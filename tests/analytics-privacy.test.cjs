const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../analytics.js'), 'utf8');

function run(savedChoice, hostname = 'mysafezone.ca', search = '') {
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
  const location = { hostname, pathname: '/', search, reload() { this.reloaded = true; } };
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
active.listeners.click({ target: target('mailto:info@pneumahealth.ca?subject=private@example.org&body=trauma') });
active.listeners.click({ target: target('tel:+16475472323') });
active.listeners.click({ target: target('mailto:someone@example.org') });
assert.equal(commands().filter(args => args[0] === 'event' && args[1] === 'contact_click').length, 2);
assert.equal(/trauma|private@example|info@|16475472323/.test(JSON.stringify(commands())), false, 'Contact contents never enter payloads');
active.elements[0].listeners.click({ target: { closest: () => ({ dataset: { choice: 'decline' } }) } });
assert.equal(active.window['ga-disable-G-J1MQ2ZJ38E'], true);
assert.equal(active.location.reloaded, true);
const eventCount = commands().length;
active.listeners.click({ target: target('https://pneumahealth.janeapp.com/') });
assert.equal(commands().length, eventCount, 'Withdrawal stops new events');
console.log('Analytics privacy checks passed: consent, local isolation, redaction, click semantics, withdrawal.');
