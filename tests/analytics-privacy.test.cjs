const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../analytics.js'), 'utf8');

function run(savedChoice, hostname = 'mysafezone.ca', search = '', pathname = '/') {
  const elements = [];
  const scripts = [];
  const listeners = {};
  const storage = new Map();
  if (savedChoice) storage.set('msz-analytics-choice-v2', JSON.stringify({ choice: savedChoice, at: Date.now() }));
  const el = () => ({
    listeners: {}, dataset: {},
    setAttribute() {}, append() {}, focus() {},
    addEventListener(type, fn) { this.listeners[type] = fn; },
    querySelector() { return { focus() {} }; },
  });
  const document = {
    cookie: '_ga=example; _ga_TEST=example',
    referrer: 'https://example.org/private?email=private@example.org',
    createElement(tag) { const e = el(); e.tag = tag; elements.push(e); return e; },
    body: { append() {} },
    head: { append(e) { scripts.push(e); } },
    querySelector: () => el(),
    addEventListener(type, fn) { listeners[type] = fn; },
  };
  const location = { hostname, pathname, search, hash: '#therapist-16', reload() { this.reloaded = true; } };
  const window = {};
  vm.runInNewContext(source, {
    document, location, window, URL, URLSearchParams, Date,
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
  });
  return { window, location, scripts, elements, listeners, storage };
}

const fresh = run();
assert.equal(fresh.scripts.length, 0, 'No Google request before consent');
assert.equal(fresh.window.dataLayer, undefined);
const declined = run('decline');
assert.equal(declined.scripts.length, 0, 'Declined visitors are not measured');
const local = run('allow', '127.0.0.1');
assert.equal(local.scripts.length, 0, 'Local QA cannot contaminate production reporting');
// Every public landing page must load the consent gate, and only explicitly
// reviewed routes may send events. Profile fragments must stay private.
const routes = ['/', '/guides/affordable-therapy/', '/team/', '/therapy/arabic/', '/therapy/hindi-punjabi/', '/therapy/malayalam/', '/community/', '/nutrition/'];
const path = require('node:path');
for (const route of routes) {
  const html = fs.readFileSync(path.join(__dirname, '..', route.slice(1), 'index.html'), 'utf8');
  assert.match(html, /<script[^>]+src="\/analytics\.js(?:\?[^" ]+)?"[^>]*defer/);
  for (const pathname of [route, route + 'index.html']) {
    assert.equal(run(undefined, 'mysafezone.ca', '', pathname).scripts.length, 0);
    assert.equal(run('decline', 'mysafezone.ca', '', pathname).scripts.length, 0);
    const allowed = run('allow', 'mysafezone.ca', '?email=private@example.org', pathname);
    assert.equal(allowed.scripts.length, 1);
    const payload = allowed.window.dataLayer.map(args => Array.from(args));
    assert.equal(payload.find(args => args[0] === 'config')[2].page_location, 'https://mysafezone.ca' + route);
    assert.equal(/therapist-16|private@example/.test(JSON.stringify(payload)), false);
  }
}
for (const pathname of ['/other/', '/patients/123/', '/team/private/']) {
  assert.equal(run('allow', 'mysafezone.ca', '', pathname).scripts.length, 0);
}
const active = run('allow', 'mysafezone.ca', '?email=private@example.org&concern=trauma&utm_source=google&utm_medium=cpc&utm_campaign=msz_canada_search');
assert.equal(active.scripts.length, 1);
const commands = () => active.window.dataLayer.map(args => Array.from(args));
const config = commands().find(args => args[0] === 'config')[2];
assert.equal(config.page_location, 'https://mysafezone.ca/');
assert.equal(config.page_referrer, 'https://example.org/');
assert.equal(config.allow_google_signals, false);
assert.equal(config.allow_ad_personalization_signals, false);
assert.equal(config.send_page_view, false);
assert.equal(config.campaign_name, 'msz_canada_search');
const pt = run('allow', 'mysafezone.ca', '?utm_source=psychology_today&utm_medium=referral&utm_campaign=msz_psychology_today&email=private@example.org');
assert.equal(pt.window.dataLayer.map(args => Array.from(args)).find(args => args[0] === 'config')[2].campaign_name, 'msz_psychology_today');
const unknown = run('allow', 'mysafezone.ca', '?utm_source=psychology_today&utm_medium=referral&utm_campaign=private@example.org');
assert.equal(unknown.window.dataLayer.map(args => Array.from(args)).find(args => args[0] === 'config')[2].campaign_name, undefined);
const target = href => ({ closest: () => ({ href }) });
active.listeners.click({ target: target('https://pneumahealth.janeapp.com/locations/my-safe-zone/book#/staff_member/12') });
assert.equal(commands().filter(args => args[0] === 'event' && args[1] === 'booking_click').length, 1);
assert.equal(/trauma|private@example|staff_member|\/12/.test(JSON.stringify(commands())), false, 'Private query data and selected therapist never enter payloads');
active.listeners.click({ target: target('mailto:care@mysafezone.ca?subject=private@example.org&body=trauma') });
active.listeners.click({ target: target('tel:+16475472323') });
active.listeners.click({ target: target('mailto:someone@example.org') });
assert.equal(commands().filter(args => args[0] === 'event' && args[1] === 'contact_click').length, 2);
assert.equal(/trauma|private@example|care@|16475472323/.test(JSON.stringify(commands())), false, 'Contact contents never enter payloads');
active.listeners.click({ target: target('https://docs.google.com/forms/d/e/1FAIpQLScZybuNpO0uS9r0S9Tds227BgayAe8z0cIVu_FjhuOwMrChSQ/viewform?email=private@example.org') });
active.listeners.click({ target: target('https://docs.google.com/forms/d/e/unrelated/viewform') });
assert.equal(commands().filter(args => args[0] === 'event' && args[1] === 'contact_request_click').length, 1);
assert.equal(/private@example|1FAIpQL|contact_request_submit/.test(JSON.stringify(commands())), false, 'Request clicks do not transmit form identity, inputs or pretend to be submissions');
active.elements[0].listeners.click({ target: { closest: () => ({ dataset: { choice: 'decline' } }) } });
assert.equal(active.window['ga-disable-G-J1MQ2ZJ38E'], true);
assert.equal(active.location.reloaded, true);
const eventCount = commands().length;
active.listeners.click({ target: target('https://pneumahealth.janeapp.com/') });
assert.equal(commands().length, eventCount, 'Withdrawal stops new events');
console.log('Analytics privacy checks passed: consent, local isolation, redaction, click semantics, withdrawal.');
