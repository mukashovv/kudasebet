const gallery = document.querySelector('#gallery');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => gallery.scrollBy({left: Number(button.dataset.scroll) * (gallery.querySelector('figure').getBoundingClientRect().width + 24), behavior: reducedMotion ? 'instant' : 'smooth'})));
const viewer = document.querySelector('#viewer');
const viewerImage = document.querySelector('#viewer-image');
const screens = Array.from(document.querySelectorAll('.screen img'));
let current = 0;
function showScreen(index) {
  current = (index + screens.length) % screens.length;
  viewerImage.src = screens[current].src;
  viewerImage.alt = screens[current].alt;
  document.querySelector('#viewer-count').textContent = `${current + 1} / ${screens.length}`;
}
document.querySelectorAll('[data-screen]').forEach(button => button.addEventListener('click', () => { showScreen(Number(button.dataset.screen)); viewer.showModal(); }));
document.querySelector('#viewer-close').addEventListener('click', () => viewer.close());
document.querySelector('.viewer-prev').addEventListener('click', () => showScreen(current - 1));
document.querySelector('.viewer-next').addEventListener('click', () => showScreen(current + 1));
viewer.addEventListener('click', event => { if(event.target === viewer) { const box = viewer.getBoundingClientRect(); if(event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) viewer.close(); }});
viewer.addEventListener('keydown', event => { if(event.key === 'ArrowLeft') {event.preventDefault(); showScreen(current - 1);} if(event.key === 'ArrowRight') {event.preventDefault(); showScreen(current + 1);} });
