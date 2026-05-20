import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function navSectionItems(navSections) {
  return navSections.querySelectorAll(
    ':scope .default-content-wrapper > ul > li, :scope > ul > li',
  );
}

function toggleAllNavSections(sections, expanded = false) {
  navSectionItems(sections).forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/** UE may wrap the three nav columns in a single div — flatten to brand / sections / tools. */
function normalizeNavColumns(nav) {
  if (nav.children.length !== 1) return;
  const wrapper = nav.firstElementChild;
  if (wrapper.children.length < 2) return;
  [...wrapper.children].forEach((child) => nav.append(child));
  wrapper.remove();
}

/** Locale prefix for /ja/… pages (matches DA folder structure). */
function getLocalePrefix() {
  const [first] = window.location.pathname.split('/').filter(Boolean);
  return first === 'ja' ? '/ja' : '';
}

const NAV_PATHS = {
  products: '/products/nexapredict',
  solutions: '/solutions',
  pricing: '/pricing',
  customers: '/customers',
  integrations: '/integrations',
  about: '/about',
  docs: '/docs',
};

/** UE sometimes saves nav labels without <a> — infer href from label when missing. */
function ensureNavItemLinks(navSections) {
  if (!navSections) return;
  const prefix = getLocalePrefix();

  navSections.querySelectorAll('ul > li').forEach((li) => {
    if (li.querySelector('a')) return;

    const text = li.textContent.trim();
    const path = NAV_PATHS[text.toLowerCase()];
    if (!path) return;

    const a = document.createElement('a');
    a.href = `${prefix}${path}`;
    a.textContent = text;
    li.textContent = '';
    li.append(a);
  });
}

function decorateNavBrand(navBrand) {
  if (!navBrand) return;
  navBrand.querySelectorAll('a.button').forEach((a) => {
    a.classList.remove('button', 'primary', 'secondary');
  });
  navBrand.querySelectorAll('.button-container').forEach((el) => {
    el.classList.remove('button-container');
  });
  const link = navBrand.querySelector('a');
  if (!link) return;
  const strong = link.closest('strong');
  if (strong && strong.parentElement?.tagName === 'P') {
    strong.replaceWith(link);
  }
  if (!link.querySelector('span') && /\sAI\s*$/i.test(link.textContent)) {
    const base = link.textContent.replace(/\s*AI\s*$/i, '').trim();
    link.textContent = '';
    link.append(document.createTextNode(base));
    const accent = document.createElement('span');
    accent.textContent = ' AI';
    link.append(accent);
  }

  const prefix = getLocalePrefix();
  if (prefix && (link.getAttribute('href') === '/' || link.getAttribute('href') === '')) {
    link.setAttribute('href', prefix);
  }
}

function decorateNavTools(navTools) {
  if (!navTools) return;
  const cta = navTools.querySelector('a');
  if (!cta) return;
  const href = cta.getAttribute('href');
  if (!href || href === '#') {
    cta.setAttribute('href', `${getLocalePrefix()}/signup`);
  }
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);
  normalizeNavColumns(nav);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  decorateNavBrand(nav.querySelector('.nav-brand'));
  decorateNavTools(nav.querySelector('.nav-tools'));

  const navSections = nav.querySelector('.nav-sections');
  ensureNavItemLinks(navSections);

  if (navSections) {
    navSectionItems(navSections).forEach((navItem) => {
      const submenu = navItem.querySelector(':scope > ul');
      if (!submenu) return;

      navItem.classList.add('nav-drop');
      navItem.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        if (isDesktop.matches) {
          const expanded = navItem.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navItem.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
