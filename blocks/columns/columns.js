function decorateHowItWorksSteps(block) {
  const section = block.closest('.section');
  if (!section?.classList.contains('how-it-works')) return;

  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let stepEl = cell.querySelector(':scope > p:has(+ :is(h1, h2, h3, h4))');
    if (!stepEl) {
      const firstP = cell.querySelector(':scope > p');
      if (firstP?.textContent?.trim().match(/^\d{1,2}$/)) {
        stepEl = firstP;
      }
    }
    if (stepEl) stepEl.classList.add('step-number');
  });
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  decorateHowItWorksSteps(block);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
