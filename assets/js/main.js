/**
 * Minghua He — academic homepage
 * Header state, scrollspy, theme toggle, mobile menu,
 * publication tabs, and the news "show all" toggle.
 */

document.addEventListener('DOMContentLoaded', function () {
  initHeader();
  initScrollSpy();
  initThemeToggle();
  initMobileMenu();
  initPubTabs();
  initNewsToggle();
  initScrollReveal();
  initHeroSpotlight();
});

/* ---------- Header scroll state ---------- */

function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 16);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- Scrollspy ---------- */

function initScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  if (!navLinks.length || !sections.length) return;

  function setActive(id) {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === id);
    });
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { threshold: 0.2, rootMargin: '-20% 0px -60% 0px' });

  sections.forEach(section => observer.observe(section));
  setActive(sections[0].id);
}

/* ---------- Theme toggle ---------- */

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
}

/* ---------- Mobile menu ---------- */

function initMobileMenu() {
  const btn = document.getElementById('menu-btn');
  const nav = document.getElementById('site-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  nav.addEventListener('click', e => {
    if (e.target.closest('a')) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---------- Publication tabs ----------
 * One visible panel at a time. Inactive panels use hidden="until-found"
 * so find-in-page (Cmd/Ctrl+F) can reveal them; beforematch syncs the
 * active tab. Old anchors (#selected / #publications / #preprints)
 * keep working as deep links into the corresponding tab.
 */

function initPubTabs() {
  const tablist = document.querySelector('.pub-tabs');
  if (!tablist) return;

  const tabs = Array.from(tablist.querySelectorAll('.pub-tab'));
  const panels = {};
  tabs.forEach(tab => {
    panels[tab.dataset.panel] = document.getElementById('panel-' + tab.dataset.panel);
  });

  const hashToPanel = {
    'selected': 'selected',
    'publications': 'all',
    'all': 'all',
    'preprints': 'preprints'
  };
  const panelToHash = {
    'selected': 'selected',
    'all': 'publications',
    'preprints': 'preprints'
  };

  function activate(name, options) {
    options = options || {};
    if (!panels[name]) return;

    tabs.forEach(tab => {
      const isActive = tab.dataset.panel === name;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    Object.keys(panels).forEach(key => {
      const panel = panels[key];
      if (!panel) return;
      if (key === name) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', 'until-found');
      }
    });

    if (options.updateHash) {
      history.replaceState(null, '', '#' + panelToHash[name]);
    }
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(tab.dataset.panel, { updateHash: true }));
    tab.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const next = e.key === 'ArrowRight' ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      activate(tabs[next].dataset.panel, { updateHash: true });
    });
  });

  Object.keys(panels).forEach(key => {
    const panel = panels[key];
    if (panel) panel.addEventListener('beforematch', () => activate(key));
  });

  function applyHash(scrollToSection) {
    const hash = location.hash.replace('#', '');
    const target = hashToPanel[hash];
    if (!target) return;
    activate(target);
    if (scrollToSection && !document.getElementById(hash)) {
      setTimeout(() => {
        const section = document.getElementById('publications');
        if (section) section.scrollIntoView();
      }, 50);
    }
  }

  applyHash(true);
  window.addEventListener('hashchange', () => applyHash(false));
}

/* ---------- News toggle ---------- */

function initNewsToggle() {
  const btn = document.getElementById('news-toggle');
  const list = document.getElementById('news-list');
  if (!btn || !list) return;

  btn.addEventListener('click', () => {
    const expanded = list.classList.toggle('expanded');
    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  });
}

/* ---------- One-shot scroll reveal ---------- */

function initScrollReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll('.section:not(.section-hero)');
  if (!targets.length) return;

  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06 });

  targets.forEach(el => observer.observe(el));
}

/* ---------- Page-wide cursor glow (desktop only) ---------- */

function initHeroSpotlight() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let raf = null;
  window.addEventListener('mousemove', e => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      glow.style.setProperty('--mx', e.clientX + 'px');
      glow.style.setProperty('--my', e.clientY + 'px');
      glow.classList.add('on');
    });
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => glow.classList.remove('on'));
}
