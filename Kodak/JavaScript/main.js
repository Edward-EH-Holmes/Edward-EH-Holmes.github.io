// ── Nav Dot Active Highlight ──
// Highlights the corresponding nav dot when scrolling to each slide section.

(function () {
  const dots = document.querySelectorAll('.nav-dots .dot');
  const slides = document.querySelectorAll('.slide');

  if (!dots.length || !slides.length) return;

  function getActiveDotIndex() {
    const scrollMid = window.scrollY + window.innerHeight / 2;
    let activeIndex = 0;
    slides.forEach(function (slide, i) {
      if (slide.offsetTop <= scrollMid) {
        activeIndex = i;
      }
    });
    return activeIndex;
  }

  function updateDots() {
    const idx = getActiveDotIndex();
    dots.forEach(function (dot, i) {
      if (i === idx) {
        dot.style.background = 'var(--yellow)';
        dot.style.transform = 'scale(1.5)';
      } else {
        dot.style.background = 'rgba(255,255,255,0.2)';
        dot.style.transform = 'scale(1)';
      }
    });
  }

  window.addEventListener('scroll', updateDots, { passive: true });
  updateDots(); // run once on load
})();
