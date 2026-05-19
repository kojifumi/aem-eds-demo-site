import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const cells = [...row.children];
    const imageCell = cells.find((col) => col.querySelector('picture'));
    const bodyCells = cells.filter((col) => col !== imageCell);

    if (imageCell) {
      imageCell.classList.add('cards-card-image');
      li.append(imageCell);
    }

    const body = document.createElement('div');
    bodyCells.forEach((cell) => {
      while (cell.firstElementChild) body.append(cell.firstElementChild);
    });
    body.className = 'cards-card-body';

    const heading = body.querySelector('h2, h3, h4, h5, h6');
    const category = heading?.previousElementSibling;
    if (category?.tagName === 'P' && !category.querySelector('a')) {
      category.classList.add('card-category');
    }

    li.append(body);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
}
