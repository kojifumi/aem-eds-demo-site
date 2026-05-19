function decorateStatsColumns(block) {
  const section = block.closest('.section');
  if (!section?.classList.contains('stats')) return;

  const row = block.firstElementChild;
  if (!row) return;

  const cells = [...row.children];
  if (cells.length !== 3) return;

  let statCount = 0;
  cells.forEach((cell) => {
    const metric = cell.querySelector(':scope > :is(h1, h2, h3, h4, h5, h6)')
      || cell.querySelector(':scope > p:first-child strong');
    const label = [...cell.querySelectorAll(':scope > p')].find(
      (p) => !p.querySelector('strong') && p !== metric,
    );

    if (!metric || !label) return;

    metric.classList.add('stat-number');
    label.classList.add('stat-label');
    statCount += 1;
  });

  if (statCount >= 2) {
    block.classList.add('stats-columns');
  }
}

function decorateHowItWorksSteps(block) {
  const row = block.firstElementChild;
  if (!row) return;

  const cells = [...row.children];
  if (cells.length !== 3) return;

  let stepCount = 0;
  cells.forEach((cell) => {
    // Remove duplicate step <p> inserted by earlier decoration (keeps authored element)
    cell.querySelectorAll(':scope > p.step-number').forEach((p) => {
      const prev = p.previousElementSibling;
      const prevText = prev?.textContent?.trim() ?? '';
      if (prev && /^\d{1,2}$/.test(prevText)) {
        p.remove();
      }
    });

    const heading = cell.querySelector(':scope > :is(h1, h2, h3, h4)');
    let stepEl = cell.querySelector(':scope > p:has(+ :is(h1, h2, h3, h4))');

    if (!stepEl) {
      const firstP = cell.querySelector(':scope > p');
      if (/^\d{1,2}$/.test(firstP?.textContent?.trim() ?? '')) {
        stepEl = firstP;
      }
    }

    if (!stepEl) {
      const stepWrapper = [...cell.children].find((el) => {
        if (el === heading || el.contains(heading)) return false;
        if (el.matches(':is(h1, h2, h3, h4)')) return false;
        return /^\d{1,2}$/.test(el.textContent?.trim() ?? '');
      });
      if (stepWrapper) {
        if (stepWrapper.tagName === 'P') {
          stepEl = stepWrapper;
        } else {
          stepWrapper.classList.add('step-number');
          stepCount += 1;
          return;
        }
      }
    }

    if (stepEl) {
      stepEl.classList.add('step-number');
      stepCount += 1;
    }
  });

  if (stepCount >= 2) {
    block.classList.add('how-it-works-steps');
    block.closest('.section')?.classList.add('how-it-works');
  }
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  decorateStatsColumns(block);
  decorateHowItWorksSteps(block);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
