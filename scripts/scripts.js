import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  loadBlock,
} from './aem.js';

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
/**
 * Apply section style classes from section-metadata (UE may keep metadata in the DOM).
 * @param {ParentNode} root
 */
export function syncSectionStyleClasses(root) {
  root.querySelectorAll('main > div').forEach((el) => el.classList.add('section'));

  root.querySelectorAll('.section-metadata').forEach((meta) => {
    const section = meta.parentElement;
    if (!section) return;
    section.classList.add('section');
    meta.querySelectorAll(':scope > div').forEach((row) => {
      const cols = [...row.children];
      if (cols.length < 2) return;
      if (cols[0].textContent.trim().toLowerCase() !== 'style') return;
      cols[1].textContent.split(',').forEach((style) => {
        const cls = style.trim().toLowerCase().replace(/\s+/g, '-');
        if (cls) section.classList.add(cls);
      });
    });
  });
}

/**
 * Mark section intro paragraph before cards/columns/accordion (Products, How It Works, FAQ).
 * Handles UE wrappers around Title/Text components.
 * @param {ParentNode} root
 */
export function decorateSectionSubtitles(root) {
  root.querySelectorAll('.section').forEach((section) => {
    const wrapper = section.querySelector('.default-content-wrapper') || section;
    const block = section.querySelector(
      '.block.cards, .cards, .block.columns, .block.accordion, .accordion',
    );
    if (!block) return;

    const introNodes = [];
    [...wrapper.children].some((child) => {
      if (child === block || child.contains(block)) return true;
      if (child.classList.contains('section-metadata')) return false;
      introNodes.push(child);
      return false;
    });

    let foundHeading = false;
    introNodes.some((node) => {
      if (node.matches('h1, h2, h3') || node.querySelector('h1, h2, h3')) {
        foundHeading = true;
        return false;
      }
      if (!foundHeading) return false;
      const p = node.tagName === 'P' ? node : node.querySelector('p');
      if (p) {
        p.classList.add('section-subtitle');
        return true;
      }
      return false;
    });
  });
}

export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  normalizeBlockNames(main);
  syncSectionStyleClasses(main);
  decorateSectionSubtitles(main);
}

const BLOCK_NAME_ALIASES = {
  'hero--gradient-': 'hero-gradient',
};

/**
 * Map AEM UE block class slugs to blocks/ folder names.
 * "Hero (Gradient)" is published as hero--gradient- but assets live under hero-gradient.
 * @param {ParentNode} root
 */
export function normalizeBlockNames(root) {
  root.querySelectorAll('[data-block-name]').forEach((block) => {
    const resolved = BLOCK_NAME_ALIASES[block.dataset.blockName];
    if (resolved) block.dataset.blockName = resolved;
  });
}

/**
 * Re-run block JS after Universal Editor patches (resets decoration state).
 * @param {HTMLElement} block
 */
export async function reloadBlock(block) {
  const root = block.closest('main') || document;
  normalizeBlockNames(root);
  delete block.dataset.blockStatus;
  decorateButtons(block);
  await loadBlock(block);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
  if (document.querySelector('[data-aue-resource]')) {
    import('./editor-support.js');
  }
}

loadPage();
