const totalPages = 28;
let currentSpread = 0;
let isDragging = false;
let startX = 0;

const leftPage = document.getElementById('left-page');
const rightPage = document.getElementById('right-page');
const book = document.querySelector('.book');
const bookContainer = document.querySelector('.book-container');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const pageTurnSound = new Audio('page-turn.mp3');
pageTurnSound.preload = 'auto';
pageTurnSound.volume = 0.5;

function loadSpread() {
  console.log('Current spread:', currentSpread); // Debug
  const isCover = currentSpread === 0;
  const isBack = currentSpread === Math.ceil((totalPages - 1) / 2);
  const leftIndex = isCover ? 1 : currentSpread * 2;
  const rightIndex = leftIndex + 1;

  if (isCover || isBack) {
    book.classList.add('single');
  } else {
    book.classList.remove('single');
  }

  leftPage.classList.add('loading');
  rightPage.classList.add('loading');

  const leftImage = new Image();
  leftImage.src = `images/Page${leftIndex}.jpg`;
  leftImage.onload = () => {
    leftPage.style.backgroundImage = `url('${leftImage.src}')`;
    leftPage.classList.remove('loading');
    leftPage.dataset.page = leftIndex;
    console.log(`Loaded Page${leftIndex}.jpg`);
  };
  leftImage.onerror = () => {
    console.error(`Failed to load images/Page${leftIndex}.jpg`);
    leftPage.classList.remove('loading');
  };
  setTimeout(() => leftPage.classList.remove('loading'), 5000);

  if (!isCover && !isBack && rightIndex <= totalPages) {
    const rightImage = new Image();
    rightImage.src = `images/Page${rightIndex}.jpg`;
    rightImage.onload = () => {
      rightPage.style.backgroundImage = `url('${rightImage.src}')`;
      rightPage.classList.remove('loading');
      console.log(`Loaded Page${rightIndex}.jpg`);
    };
    rightImage.onerror = () => {
      console.error(`Failed to load images/Page${rightIndex}.jpg`);
      rightPage.classList.remove('loading');
    };
    setTimeout(() => rightPage.classList.remove('loading'), 5000);
  } else {
    rightPage.style.backgroundImage = 'none';
    rightPage.style.backgroundColor = '#444';
    rightPage.classList.remove('loading');
  }

  if (typeof gtag === 'function') {
    gtag('event', 'page_view', { 'page_title': `Spread ${currentSpread}` });
  }
}

function flipNext(e) {
  e.stopPropagation(); // Prevent double trigger
  const maxSpread = Math.ceil((totalPages - 1) / 2);
  if (currentSpread < maxSpread) {
    currentSpread++;
    pageTurnSound.currentTime = 0;
    try { pageTurnSound.play(); } catch (e) { console.log('Sound failed:', e); }
    loadSpread();
    console.log('Flipped to next:', currentSpread); // Debug
  }
}

function flipPrev(e) {
  e.stopPropagation(); // Prevent double trigger
  if (currentSpread > 0) {
    currentSpread--;
    pageTurnSound.currentTime = 0;
    try { pageTurnSound.play(); } catch (e) { console.log('Sound failed:', e); }
    loadSpread();
    console.log('Flipped to prev:', currentSpread); // Debug
  }
}

function startDrag(e) {
  isDragging = true;
  startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  e.preventDefault();
}

function dragMove(e) {
  if (!isDragging) return;
  const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  const deltaX = x - startX;
  const threshold = bookContainer.offsetWidth * 0.1;
  const maxSpread = Math.ceil((totalPages - 1) / 2);

  if (deltaX > threshold && currentSpread < maxSpread) {
    flipNext(e);
    isDragging = false;
  } else if (deltaX < -threshold && currentSpread > 0) {
    flipPrev(e);
    isDragging = false;
  }
}

function endDrag() {
  isDragging = false;
}

function handleClick(e) {
  if (isDragging) return;
  const clickX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  const midpoint = bookContainer.offsetLeft + (bookContainer.offsetWidth / 2);
  if (clickX < midpoint) flipPrev(e);
  else if (clickX > midpoint) flipNext(e);
}

function handleDoubleTap(e) {
  bookContainer.style.transform = bookContainer.style.transform === 'scale(1.5)' ? 'scale(1)' : 'scale(1.5)';
  bookContainer.style.transition = 'transform 0.3s ease';
}

nextButton.addEventListener('click', flipNext);
prevButton.addEventListener('click', flipPrev);
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') flipPrev(e);
  if (e.key === 'ArrowRight') flipNext(e);
});
book.addEventListener('mousedown', startDrag);
book.addEventListener('mousemove', dragMove);
book.addEventListener('mouseup', endDrag);
book.addEventListener('touchstart', (e) => {
  startDrag(e);
  handleClick(e);
});
book.addEventListener('touchmove', dragMove);
book.addEventListener('touchend', endDrag);
book.addEventListener('dblclick', handleDoubleTap);
book.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    const now = Date.now();
    const lastTap = book.dataset.lastTap || 0;
    if (now - lastTap < 300) handleDoubleTap(e);
    book.dataset.lastTap = now;
  }
});
// Removed document.addEventListener('click', handleClick) to avoid overlap

loadSpread();