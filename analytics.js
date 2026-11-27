// Public-site measurement only. Never read matching answers or send therapist IDs.
(() => {
  const measurementId = 'G-J1MQ2ZJ38E';
  const preferenceKey = 'msz-analytics-choice-v2';
  const allowedPages = new Map([
    ['/', 'My Safe Zone'],
    ['/guides/affordable-therapy/', 'Affordable therapy guide'],
    ['/team/', 'Meet our team'],
    ['/therapy/arabic/', 'Arabic therapy'],
    ['/therapy/hindi-punjabi/', 'Hindi and Punjabi therapy'],
    ['/therapy/malayalam/', 'Malayalam therapy'],
    ['/community/', 'Community resources'],
    ['/nutrition/', 'Nutrition counselling'],
  ]);
  const canonicalPath = location.pathname.replace(/index\.html$/, '');
  if (!allowedPages.has(canonicalPath)) return;
  let choice = null;
  try {
    const saved = JSON.parse(localStorage.getItem(preferenceKey));
    if (saved && Date.now() - saved.at < 180 * 86400000 && ['allow', 'decline'].includes(saved.choice)) {
      choice = saved.choice;
    }
  } catch (_) { /* A blocked storage API must not prevent use of the site. */ }

  const banner = document.createElement('section');
  banner.className = 'analytics-choice';
  banner.setAttribute('aria-labelledby', 'analytics-choice-title');
  banner.innerHTML = `<div><strong id="analytics-choice-title">Your privacy, your choice</strong>
    <p>May we use optional Google Analytics cookies to understand visits and clicks on booking, contact and callback-form links? Google receives usage and device data. We do not send your matching answers, selected therapist, messages or booking details. Declining will not affect your care or use of this site.</p>
    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google’s privacy policy</a></div>
    <div class="analytics-actions"><button type="button" data-choice="decline">Decline analytics</button><button type="button" data-choice="allow">Allow analytics</button></div>`;
  banner.hidden = choice !== null;
  document.body.append(banner);

  const preferences = document.createElement('button');
  preferences.type = 'button';
  preferences.className = 'analytics-preferences';
  preferences.textContent = 'Cookie preferences';
  (document.querySelector('.site-footer') || document.querySelector('main') || document.body).append(preferences);
  preferences.addEventListener('click', () => {
    banner.hidden = false;
    banner.querySelector('[data-choice="decline"]').focus();
  });

  let started = false;
  const isProduction = location.hostname === 'mysafezone.ca' || location.hostname === 'www.mysafezone.ca';
  const gtag = function () { window.dataLayer.push(arguments); };
  const page = {
    page_location: 'https://mysafezone.ca' + canonicalPath,
    page_title: allowedPages.get(canonicalPath),
    // Referrer paths and query strings can contain private information.
    page_referrer: '',
  };
  try {
    if (document.referrer) page.page_referrer = new URL(document.referrer).origin + '/';
  } catch (_) { /* Invalid referrers are omitted. */ }

  function startAnalytics() {
    if (started || choice !== 'allow' || !isProduction) return;
    started = true;
    window['ga-disable-' + measurementId] = false;
    window.dataLayer = window.dataLayer || [];
    gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied',
    });
    gtag('set', 'ads_data_redaction', true);
    gtag('set', 'url_passthrough', false);
    const config = {
      ...page, send_page_view: false,
      allow_google_signals: false, allow_ad_personalization_signals: false,
      cookie_expires: 180 * 86400, cookie_update: false,
    };
    // Only the exact campaign labels we control may enter analytics.
    const query = new URLSearchParams(location.search);
    if (query.get('utm_source') === 'google' && query.get('utm_medium') === 'cpc' && query.get('utm_campaign') === 'msz_canada_search') {
      Object.assign(config, { campaign_source: 'google', campaign_medium: 'cpc', campaign_name: 'msz_canada_search' });
    }
    if (query.get('utm_source') === 'psychology_today' && query.get('utm_medium') === 'referral' && query.get('utm_campaign') === 'msz_psychology_today') {
      Object.assign(config, { campaign_source: 'psychology_today', campaign_medium: 'referral', campaign_name: 'msz_psychology_today' });
    }
    // Apply privacy and page-view controls globally before the tag initializes,
    // including any stream initialization performed by Google's tag container.
    gtag('set', config);
    gtag('js', new Date());
    gtag('config', measurementId, config);
    gtag('event', 'page_view', { ...page, send_to: measurementId });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.append(script);
  }

  function clearAnalyticsCookies() {
    for (const item of document.cookie.split(';')) {
      const name = item.split('=')[0].trim();
      if (name !== '_ga' && !name.startsWith('_ga_')) continue;
      for (const domain of ['', '; domain=mysafezone.ca', '; domain=.mysafezone.ca', '; domain=' + location.hostname]) {
        document.cookie = name + '=; Max-Age=0; path=/' + domain + '; SameSite=Lax';
      }
    }
  }

  banner.addEventListener('click', event => {
    const button = event.target.closest('[data-choice]');
    if (!button) return;
    choice = button.dataset.choice;
    try { localStorage.setItem(preferenceKey, JSON.stringify({ choice, at: Date.now() })); } catch (_) {}
    banner.hidden = true;
    if (choice === 'decline') {
      window['ga-disable-' + measurementId] = true;
      clearAnalyticsCookies();
      // Reload unloads an already-initialized tag after consent withdrawal.
      if (started) location.reload();
    } else {
      startAnalytics();
    }
    preferences.focus();
  });

  document.addEventListener('click', event => {
    if (choice !== 'allow' || !started) return;
    const link = event.target.closest('a[href]');
    if (!link) return;
    let destination;
    try { destination = new URL(link.href); } catch (_) { return; }
    if (destination.hostname === 'pneumahealth.janeapp.com') {
      // This is an outbound click, never a completed-booking conversion.
      gtag('event', 'booking_click', { ...page, send_to: measurementId });
    } else if (destination.hostname === 'docs.google.com' && destination.pathname === '/forms/d/e/1FAIpQLScZybuNpO0uS9r0S9Tds227BgayAe8z0cIVu_FjhuOwMrChSQ/viewform') {
      // Form opening only; submitted requests are counted privately in Forms.
      gtag('event', 'contact_request_click', { ...page, send_to: measurementId });
    } else if ((destination.protocol === 'mailto:' && destination.pathname === 'care@mysafezone.ca') ||
               (destination.protocol === 'tel:' && destination.pathname.replace(/[^0-9]/g, '') === '16475472323')) {
      // Count only opening a contact link, never a sent enquiry or an answered call.
      // Do not send the address, phone number, subject, message, or full link.
      gtag('event', 'contact_click', { ...page, send_to: measurementId });
    }
  });
  if (choice === 'decline') clearAnalyticsCookies();
  startAnalytics();
})();
