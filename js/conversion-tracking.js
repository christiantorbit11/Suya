/* Google Ads conversion tracking.
   Fire-and-forget: never delays or blocks the click, so the call/order still
   goes through even if gtag.js is blocked (ad blockers, offline, etc.). */
document.addEventListener('click', (e) => {
  const orderLink = e.target.closest('a[href*="doordash.com"], a[href*="ubereats.com"]');
  const telLink = e.target.closest('a[href^="tel:"]');
  if (!orderLink && !telLink) return;

  /* Phone/Site conversion — every phone link and every order link. */
  if (typeof gtag_report_conversion === 'function') gtag_report_conversion();

  /* Submit lead form conversion — order links only (per your scoping). */
  if (orderLink && typeof gtag === 'function') {
    gtag('event', 'conversion', { 'send_to': 'AW-18354152027/O0G6CLbEw98cENvE-K9E' });
  }
}, true);
