/* Google Ads Phone/Site conversion tracking.
   Fires on every tel: link and every DoorDash/Uber Eats order link, site-wide.
   Fire-and-forget: does not delay or block the click, so the call/order still
   goes through even if gtag.js is blocked (ad blockers, offline, etc.). */
document.addEventListener('click', (e) => {
  if (typeof gtag_report_conversion !== 'function') return;
  const link = e.target.closest('a[href^="tel:"], a[href*="doordash.com"], a[href*="ubereats.com"]');
  if (link) gtag_report_conversion();
}, true);
