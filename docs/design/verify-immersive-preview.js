// Run in the preview's browser console:
// (await import('./verify-immersive-preview.js')).verifyOruPreview()
export async function verifyOruPreview() {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  await document.fonts.ready;
  const initialScroll = scrollY;
  const motion = document.querySelector('.motion');
  const wasReduced = motion.getAttribute('aria-pressed') === 'true';
  const cards = [...document.querySelectorAll('.guardian')];
  const stages = [...document.querySelectorAll('.stages button')];
  const oldStage = stages.findIndex(b => b.getAttribute('aria-pressed') === 'true');
  try {
    assert(![...document.images].some(i => !i.complete || !i.naturalWidth), 'Missing artwork');
    assert(document.documentElement.scrollWidth <= innerWidth, 'Horizontal overflow');
    if (wasReduced) motion.click();
    scrollTo({top:0, behavior:'instant'}); await frame();
    const before = getComputedStyle(document.querySelector('.buddy')).transform;
    const backgroundBefore = getComputedStyle(document.querySelector('.scene')).transform;
    scrollTo({top:500, behavior:'instant'}); await frame();
    if (CSS.supports('animation-timeline', 'view()')) {
      assert(before !== getComputedStyle(document.querySelector('.buddy')).transform, 'Parallax did not respond to scroll');
      const foregroundDistance = Math.abs(new DOMMatrixReadOnly(before).m42 - new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.buddy')).transform).m42);
      const backgroundDistance = Math.abs(new DOMMatrixReadOnly(backgroundBefore).m42 - new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.scene')).transform).m42);
      assert(foregroundDistance > backgroundDistance, 'Foreground and background depth rates are incorrect');
    }
    for (const b of stages) {
      b.click();
      assert(b.getAttribute('aria-pressed') === 'true', 'Stage not selected');
      assert(document.querySelectorAll('.plots>div:not([hidden])').length === 1, 'Plot visibility mismatch');
    }
    for (const b of cards) {
      const before = b.getAttribute('aria-pressed'); b.click();
      assert(b.getAttribute('aria-pressed') !== before, 'Guardian card did not turn');
      b.click();
    }
    motion.click(); await frame();
    assert(document.querySelector('.buddy').getAnimations().length === 0, 'Reduced motion still animates');
    const dialog = document.querySelector('dialog');
    document.querySelector('.menu').click(); assert(dialog.open, 'Menu did not open');
    dialog.querySelector('.close').click(); assert(!dialog.open, 'Menu did not close');
    return {passed:true, stages:stages.length, guardians:cards.length, nativeParallax:CSS.supports('animation-timeline','view()'), width:innerWidth};
  } finally {
    if ((motion.getAttribute('aria-pressed') === 'true') !== wasReduced) motion.click();
    stages[oldStage]?.click();
    scrollTo({top:initialScroll, behavior:'instant'});
  }
}
