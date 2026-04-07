/* ===========================
   MPI ARTIST SERVICES
   Main JavaScript
   =========================== */

(function () {
  'use strict';

  // ── NAV SCROLL BEHAVIOR ──
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── MOBILE MENU ──
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu   = document.getElementById('mobileMenu');

  if (mobileToggle && mobileMenu) {
    let menuOpen = false;

    const openMenu = () => {
      menuOpen = true;
      mobileMenu.style.display = 'flex';
      mobileMenu.setAttribute('aria-hidden', 'false');
      mobileToggle.setAttribute('aria-label', 'Close menu');
      requestAnimationFrame(() => mobileMenu.classList.add('open'));
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      mobileToggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (!menuOpen) mobileMenu.style.display = 'none';
      }, 400);
    };

    mobileToggle.addEventListener('click', () => {
      menuOpen ? closeMenu() : openMenu();
    });

    // Close on link click
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menuOpen) closeMenu();
    });
  }

  // ── SCROLL REVEAL ──
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // ── SMOOTH ANCHOR SCROLLING ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── ADD REVEAL CLASSES TO SECTIONS ──
  // Progressively enhance sections with reveal animation
  const sections = document.querySelectorAll('section:not(.hero)');
  sections.forEach(section => {
    const headings = section.querySelectorAll('h2, h3');
    headings.forEach((h, i) => {
      if (!h.closest('.tier-card') && !h.closest('.how-step') && !h.closest('.fit-col')) {
        h.classList.add('reveal');
        if (i > 0) h.classList.add(`reveal-delay-${Math.min(i, 4)}`);
      }
    });
  });

  // ── TIER CARD HOVER HIGHLIGHT ──
  const tierCards = document.querySelectorAll('.tier-card');
  tierCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      tierCards.forEach(c => {
        if (c !== card) c.style.opacity = '0.6';
      });
    });
    card.addEventListener('mouseleave', () => {
      tierCards.forEach(c => { c.style.opacity = ''; });
    });
  });

})();
