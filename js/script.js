document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header on scroll ---------- */
  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');
  const onScroll = () => {
    const scrolled = window.scrollY > 40;
    header.classList.toggle('scrolled', scrolled);
    backToTop.classList.toggle('show', window.scrollY > 500);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Mobile hamburger + nav dropdown ---------- */
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('mainNav');

  hamburger.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    hamburger.classList.toggle('active', isOpen);
  });

  // Close mobile nav after clicking a link (but not the dropdown's own toggle trigger)
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 780) {
        if (link.parentElement.classList.contains('has-dropdown')) return;
        mainNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Tap-to-toggle dropdown on mobile / touch devices
  document.querySelectorAll('.has-dropdown > a').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 780) {
        e.preventDefault();
        trigger.parentElement.classList.toggle('open');
      }
    });
  });

  // Order Online button dropdowns (click-to-toggle, click-outside-to-close)
  document.querySelectorAll('.order-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = toggle.parentElement;
      const wasOpen = parent.classList.contains('open');
      document.querySelectorAll('.order-dropdown.open').forEach(el => el.classList.remove('open'));
      parent.classList.toggle('open', !wasOpen);
    });
  });
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.order-dropdown.open').forEach(el => {
      if (!el.contains(e.target)) el.classList.remove('open');
    });
  });

  /* ---------- Menu category tabs + mobile select ---------- */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const menuSelect = document.getElementById('menuSelect');
  const menuPanels = document.querySelectorAll('.menu-panel');

  function showCategory(cat) {
    tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.cat === cat));
    menuPanels.forEach(panel => panel.classList.toggle('active', panel.dataset.cat === cat));
    if (menuSelect) menuSelect.value = cat;
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => showCategory(btn.dataset.cat));
  });

  if (menuSelect) {
    menuSelect.addEventListener('change', () => showCategory(menuSelect.value));
  }

  // Nav dropdown links also jump to a menu category
  document.querySelectorAll('.dropdown a[data-cat]').forEach(link => {
    link.addEventListener('click', () => showCategory(link.dataset.cat));
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.parentElement;
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.accordion-item').forEach(el => el.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---------- Review carousel ---------- */
  const track = document.getElementById('reviewTrack');
  const cards = track ? Array.from(track.children) : [];
  const dotsWrap = document.getElementById('reviewDots');
  let current = 0;
  let autoplayTimer;

  if (track && cards.length) {
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to review ${i + 1}`);
      dot.addEventListener('click', () => goToReview(i));
      dotsWrap.appendChild(dot);
    });

    function goToReview(index) {
      current = (index + cards.length) % cards.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('active', i === current));
    }

    document.getElementById('prevReview').addEventListener('click', () => { goToReview(current - 1); restartAutoplay(); });
    document.getElementById('nextReview').addEventListener('click', () => { goToReview(current + 1); restartAutoplay(); });

    function startAutoplay() {
      autoplayTimer = setInterval(() => goToReview(current + 1), 6000);
    }
    function restartAutoplay() {
      clearInterval(autoplayTimer);
      startAutoplay();
    }
    const carousel = document.querySelector('.review-carousel');
    carousel.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    carousel.addEventListener('mouseleave', startAutoplay);

    startAutoplay();
  }

  /* ---------- Gallery lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxArt = document.getElementById('lightboxArt');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  document.querySelectorAll('.gallery-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const photo = tile.querySelector('.tile-photo');
      const photoLoaded = photo && photo.style.display !== 'none' && photo.complete && photo.naturalWidth > 0;
      const artClass = tile.querySelector('.tile-art').className.split(' ').find(c => c.startsWith('art-'));
      lightboxArt.className = 'lightbox-art';
      if (photoLoaded) {
        lightboxArt.innerHTML = `<img src="${photo.src}" alt="">`;
      } else {
        lightboxArt.innerHTML = `<div class="${artClass}" style="width:100%;height:100%;"></div>`;
      }
      lightboxCaption.textContent = tile.dataset.caption || '';
      lightbox.classList.add('open');
    });
  });

  function closeLightbox() { lightbox.classList.remove('open'); }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  /* ---------- Scroll reveal animations ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

});
