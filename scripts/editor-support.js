import {
  decorateBlock,
  decorateBlocks,
  decorateButtons,
  decorateIcons,
  decorateSections,
  loadBlock,
  loadCSS,
  loadScript,
  loadSections,
} from './aem.js';
import { decorateRichtext } from './editor-support-rte.js';
import {
  decorateMain,
  decorateSectionSubtitles,
  normalizeBlockNames,
  reloadBlock,
  syncSectionStyleClasses,
} from './scripts.js';

loadCSS(`${window.hlx.codeBasePath}/scripts/editor-support.css`);

let promiseChanges$ = Promise.resolve();

async function refreshSectionIntro(section) {
  if (!section) return;
  syncSectionStyleClasses(section);
  decorateSectionSubtitles(section);
  await Promise.all(
    [...section.querySelectorAll('.columns.block, .block.columns')].map((block) => reloadBlock(block)),
  );
}

async function applyChanges(event) {
  await promiseChanges$;

  try {
  // redecorate default content and blocks on patches (in the properties rail)
  const { detail } = event;

  const resource = detail?.request?.target?.resource // update, patch components
    || detail?.request?.target?.container?.resource // update, patch, add to sections
    || detail?.request?.to?.container?.resource; // move in sections
  if (!resource) return false;
  const updates = detail?.response?.updates;
  if (!updates.length) return false;
  const { content } = updates[0];
  if (!content) return false;

  // load dompurify
  await loadScript(`${window.hlx.codeBasePath}/scripts/dompurify.min.js`);

  const sanitizedContent = window.DOMPurify.sanitize(content, { USE_PROFILES: { html: true } });
  const parsedUpdate = new DOMParser().parseFromString(sanitizedContent, 'text/html');
  const element = document.querySelector(`[data-aue-resource="${resource}"]`);

  if (element) {
    if (element.matches('main')) {
      const newMain = parsedUpdate.querySelector(`[data-aue-resource="${resource}"]`);
      if (!newMain) return false;
      newMain.style.display = 'none';
      element.insertAdjacentElement('afterend', newMain);
      decorateMain(newMain);
      decorateRichtext(newMain);
      await loadSections(newMain);
      element.remove();
      newMain.style.display = null;
      // eslint-disable-next-line no-use-before-define
      attachEventListeners(newMain);
      return true;
    }

    const block = element.parentElement?.closest('.block[data-aue-resource]') || element?.closest('.block[data-aue-resource]');
    if (block) {
      const blockResource = block.getAttribute('data-aue-resource');
      const newBlock = parsedUpdate.querySelector(`[data-aue-resource="${blockResource}"]`);
      if (newBlock) {
        newBlock.style.display = 'none';
        block.insertAdjacentElement('afterend', newBlock);
        decorateButtons(newBlock);
        decorateIcons(newBlock);
        decorateBlock(newBlock);
        decorateRichtext(newBlock);
        normalizeBlockNames(newBlock.closest('main') || document);
        delete newBlock.dataset.blockStatus;
        await loadBlock(newBlock);
        block.remove();
        newBlock.style.display = null;
        await refreshSectionIntro(newBlock.closest('.section'));
        return true;
      }
    } else {
      // sections and default content, may be multiple in the case of richtext
      const newElements = parsedUpdate.querySelectorAll(`[data-aue-resource="${resource}"],[data-richtext-resource="${resource}"]`);
      if (newElements.length) {
        const { parentElement } = element;
        const containingBlock = element.closest('.block[data-aue-resource]');
        const blockResource = containingBlock?.getAttribute('data-aue-resource');
        const freshBlock = blockResource
          ? parsedUpdate.querySelector(`[data-aue-resource="${blockResource}"]`)
          : null;

        if (freshBlock && containingBlock) {
          freshBlock.style.display = 'none';
          containingBlock.insertAdjacentElement('afterend', freshBlock);
          decorateButtons(freshBlock);
          decorateIcons(freshBlock);
          decorateBlock(freshBlock);
          decorateRichtext(freshBlock);
          normalizeBlockNames(freshBlock.closest('main') || document);
          delete freshBlock.dataset.blockStatus;
          await loadBlock(freshBlock);
          containingBlock.remove();
          freshBlock.style.display = null;
          return true;
        }

        if (element.matches('.section')) {
          const [newSection] = newElements;
          newSection.style.display = 'none';
          element.insertAdjacentElement('afterend', newSection);
          decorateButtons(newSection);
          decorateIcons(newSection);
          decorateRichtext(newSection);
          decorateSections(parentElement);
          decorateBlocks(parentElement);
          await loadSections(parentElement);
          element.remove();
          newSection.style.display = null;
          await refreshSectionIntro(newSection);
        } else {
          const section = element.closest('.section') || parentElement?.closest('.section');
          element.replaceWith(...newElements);
          decorateButtons(parentElement);
          decorateIcons(parentElement);
          decorateRichtext(parentElement);
          await refreshSectionIntro(section);
          if (containingBlock) await reloadBlock(containingBlock);
        }
        return true;
      }
    }
  }

  return false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('editor-support applyChanges failed', error);
    return false;
  }
}

function attachEventListeners(main) {
  [
    'aue:content-patch',
    'aue:content-update',
    'aue:content-add',
    'aue:content-move',
    'aue:content-remove',
    'aue:content-copy',
  ].forEach((eventType) => main?.addEventListener(eventType, async (event) => {
    event.stopPropagation();
    promiseChanges$ = applyChanges(event);
    const applied = await promiseChanges$;
    if (!applied) {
      await refreshSectionIntro(document.querySelector('main'));
    }
  }));
}

const main = document.querySelector('main');
attachEventListeners(main);
refreshSectionIntro(main);

// decorate rich text
// this has to happen after decorateMain(), and everythime decorateBlocks() is called
decorateRichtext();
// in cases where the block decoration is not done in one synchronous iteration we need to listen
// for new richtext-instrumented elements. this happens for example when using experimentation.
const observer = new MutationObserver(() => decorateRichtext());
observer.observe(document, { attributeFilter: ['data-richtext-prop'], subtree: true });
