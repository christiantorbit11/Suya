/* ---------- Broken image fallback (CSP-safe replacement for inline onerror) ---------- */
(function () {
  function handleImgError(img) {
    img.style.display = 'none';
    if (img.hasAttribute('data-fallback-flex')) {
      const sib = img.nextElementSibling;
      if (sib) sib.style.display = 'flex';
    }
  }
  document.addEventListener('error', (e) => {
    if (e.target && e.target.tagName === 'IMG') handleImgError(e.target);
  }, true);
  document.querySelectorAll('img').forEach((img) => {
    if (img.complete && img.naturalWidth === 0) handleImgError(img);
  });
})();

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Full-screen video intro ---------- */
  const intro = document.getElementById('siteIntro');
  if (intro) {
    if (prefersReducedMotion) {
      intro.remove();
    } else {
      const INTRO_DURATION = 3500;
      const FALLBACK_TIMEOUT = 6000; // in case the video never plays (slow network, blocked autoplay, etc.)
      document.body.classList.add('intro-active');
      let dismissed = false;

      function endIntro() {
        if (dismissed) return;
        dismissed = true;
        intro.classList.add('leaving');
        document.body.classList.remove('intro-active');
        setTimeout(() => intro.remove(), 1050);
      }

      const introTimer = setTimeout(endIntro, INTRO_DURATION);
      const fallbackTimer = setTimeout(endIntro, FALLBACK_TIMEOUT);

      document.getElementById('introSkip').addEventListener('click', () => {
        clearTimeout(introTimer);
        clearTimeout(fallbackTimer);
        endIntro();
      });
      document.addEventListener('keydown', function introEscape(e) {
        if (e.key === 'Escape') {
          clearTimeout(introTimer);
          clearTimeout(fallbackTimer);
          endIntro();
          document.removeEventListener('keydown', introEscape);
        }
      });
      const introVideo = document.getElementById('introVideo');
      if (introVideo) {
        introVideo.addEventListener('error', () => { clearTimeout(introTimer); endIntro(); });
      }
    }
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header, back-to-top, mobile bar, progress bar ---------- */
  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');
  const mobileBar = document.getElementById('mobileActionBar');
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  const onScroll = () => {
    const scrolled = window.scrollY > 40;
    header.classList.toggle('scrolled', scrolled);
    backToTop.classList.toggle('show', window.scrollY > 500);
    if (mobileBar) {
      const show = window.scrollY > 560;
      mobileBar.classList.toggle('show', show);
      mobileBar.setAttribute('aria-hidden', String(!show));
    }
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : '0%';
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
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', () => {
      const item = trigger.parentElement;
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.accordion-item').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
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

  /* ---------- Gallery lightbox (with prev/next, keyboard, swipe) ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxArt = document.getElementById('lightboxArt');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const galleryTiles = Array.from(document.querySelectorAll('.gallery-tile'));
  let lightboxIndex = 0;

  function renderLightbox(index) {
    lightboxIndex = (index + galleryTiles.length) % galleryTiles.length;
    const tile = galleryTiles[lightboxIndex];
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
    if (lightboxCounter) lightboxCounter.textContent = `${lightboxIndex + 1} / ${galleryTiles.length}`;
  }

  galleryTiles.forEach((tile, i) => {
    tile.addEventListener('click', () => {
      renderLightbox(i);
      lightbox.classList.add('open');
    });
  });

  function closeLightbox() { lightbox.classList.remove('open'); }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); renderLightbox(lightboxIndex - 1); });
  if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); renderLightbox(lightboxIndex + 1); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) {
      if (e.key === 'Escape') closeLightbox();
      return;
    }
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') renderLightbox(lightboxIndex - 1);
    else if (e.key === 'ArrowRight') renderLightbox(lightboxIndex + 1);
  });

  let touchStartX = null;
  lightbox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(dx) > 50) renderLightbox(lightboxIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- Scroll reveal animations (also drives the catering stagger) ---------- */
  const revealEls = document.querySelectorAll('.reveal, .catering-grid');
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

  /* ---------- Count-up stat numbers ---------- */
  const countEls = document.querySelectorAll('.countup');
  function formatCount(value, decimals, suffix) {
    return value.toFixed(decimals) + suffix;
  }
  function animateCount(el) {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    if (prefersReducedMotion) {
      el.textContent = formatCount(target, decimals, suffix);
      return;
    }
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = formatCount(target * eased, decimals, suffix);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (countEls.length) {
    if ('IntersectionObserver' in window) {
      const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      countEls.forEach(el => countObserver.observe(el));
    } else {
      countEls.forEach(el => animateCount(el));
    }
  }

  /* ---------- Subtle hero video parallax ---------- */
  const heroParallax = document.getElementById('heroParallax');
  if (heroParallax && !prefersReducedMotion) {
    let ticking = false;
    const updateParallax = () => {
      const rect = heroParallax.getBoundingClientRect();
      const viewportMid = window.innerHeight / 2;
      const offset = (rect.top + rect.height / 2 - viewportMid) * -0.06;
      const clamped = Math.max(-18, Math.min(18, offset));
      heroParallax.style.transform = `translateY(${clamped}px)`;
      ticking = false;
    };
    document.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }

  /* ---------- Live open/closed status (America/New_York) ---------- */
  // Weekly hours as minutes-from-midnight windows; index 0 = Sunday.
  const WEEK_HOURS = [
    [12 * 60, 16 * 60 + 40],  // Sun 12:00–4:40 PM
    null,                     // Mon closed
    [12 * 60, 17 * 60 + 40],  // Tue 12:00–5:40 PM
    [11 * 60, 19 * 60 + 40],  // Wed
    [11 * 60, 19 * 60 + 40],  // Thu
    [11 * 60, 19 * 60 + 40],  // Fri
    [11 * 60, 19 * 60 + 40]   // Sat
  ];
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function minutesToLabel(mins) {
    let h = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  function nyNow() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
    }).formatToParts(new Date());
    const get = (t) => parts.find(p => p.type === t)?.value;
    const dayIdx = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day: dayIdx, minutes: (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10) };
  }

  function updateOpenStatus() {
    const pills = document.querySelectorAll('[data-open-status]');
    if (!pills.length) return;
    let state;
    try {
      const { day, minutes } = nyNow();
      const today = WEEK_HOURS[day];
      if (today && minutes >= today[0] && minutes < today[1]) {
        state = { open: true, text: `Open now · closes ${minutesToLabel(today[1])}` };
      } else if (today && minutes < today[0]) {
        state = { open: false, text: `Closed · opens today ${minutesToLabel(today[0])}` };
      } else {
        for (let ahead = 1; ahead <= 7; ahead++) {
          const next = WEEK_HOURS[(day + ahead) % 7];
          if (next) {
            const dayLabel = ahead === 1 ? 'tomorrow' : DAY_NAMES[(day + ahead) % 7];
            state = { open: false, text: `Closed · opens ${dayLabel} ${minutesToLabel(next[0])}` };
            break;
          }
        }
      }
    } catch (err) {
      return; // leave pills hidden if timezone lookup fails
    }
    if (!state) return;
    pills.forEach(pill => {
      pill.hidden = false;
      pill.classList.toggle('is-open', state.open);
      pill.classList.toggle('is-closed', !state.open);
      pill.querySelector('.status-text').textContent = state.text;
    });
  }
  updateOpenStatus();
  setInterval(updateOpenStatus, 60000);

  /* ---------- Scrollspy: highlight the section in view ---------- */
  const spySections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav > ul > li > a[href^="#"]');
  if ('IntersectionObserver' in window && spySections.length && navLinks.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    spySections.forEach(s => spy.observe(s));
  }

  /* ---------- Blur-in reveal for section headings ---------- */
  const headingEls = document.querySelectorAll('section h2');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const headingObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          headingObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    headingEls.forEach(h => { h.classList.add('reveal-blur'); headingObserver.observe(h); });
  }

  /* ---------- 3D tilt on menu cards (mouse only) ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion) {
    document.querySelectorAll('.menu-card').forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-8px) perspective(800px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Ambient ember particles in the hero ---------- */
  const heroSection = document.querySelector('.hero');
  if (heroSection && !prefersReducedMotion) {
    const canvas = document.createElement('canvas');
    canvas.className = 'ember-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    heroSection.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, embers = [], running = false, rafId = null;
    const EMBER_COUNT = 26;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = heroSection.clientWidth;
      h = heroSection.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(scattered) {
      return {
        x: Math.random() * w,
        y: scattered ? Math.random() * h : h + 8,
        r: 0.8 + Math.random() * 2,
        speed: 0.22 + Math.random() * 0.5,
        sway: Math.random() * Math.PI * 2,
        swayAmp: 0.15 + Math.random() * 0.45,
        alpha: 0.2 + Math.random() * 0.4,
        gold: Math.random() > 0.35 // gold vs deeper orange embers
      };
    }

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const e of embers) {
        e.y -= e.speed;
        e.sway += 0.012;
        e.x += Math.sin(e.sway) * e.swayAmp * 0.5;
        if (e.y < -10 || e.x < -12 || e.x > w + 12) Object.assign(e, spawn(false));
        const heightFade = Math.min(1, e.y / (h * 0.28)); // fade out near the top
        const a = e.alpha * heightFade;
        if (a <= 0.01) continue;
        const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 3.2);
        const core = e.gold ? '240,200,119' : '224,130,60';
        grad.addColorStop(0, `rgba(${core},${a})`);
        grad.addColorStop(1, `rgba(${core},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      rafId = requestAnimationFrame(tick);
    }

    function start() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(tick);
    }
    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    }

    resize();
    embers = Array.from({ length: EMBER_COUNT }, () => spawn(true));
    window.addEventListener('resize', () => { resize(); }, { passive: true });
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach(entry => entry.isIntersecting ? start() : stop());
      }, { threshold: 0 }).observe(heroSection);
    } else {
      start();
    }
  }

});
