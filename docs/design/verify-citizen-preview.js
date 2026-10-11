// Run in the preview browser: (await import('./verify-citizen-preview.js')).verifyCitizenPreview()
export async function verifyCitizenPreview() {
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const settle = () => new Promise(resolve => setTimeout(resolve, 100));
  const visit = async route => { location.hash = route; await settle(); };
  const report = [];
  await document.fonts.ready;
  await visit('language');
  document.querySelector('input[value=hi]').click();
  document.querySelector('.next').click(); await settle();
  assert(location.hash === '#location', 'Language continues to location');
  assert(document.querySelector('.panel').textContent.includes('No location permission'), 'Sample location is explicit');
  document.querySelector('.next').click(); await settle();
  assert(location.hash === '#reveal', 'Location continues to reveal');
  assert(document.querySelector('.guardian').alt === 'River dolphin guardian', 'Reveal uses dolphin artwork');
  document.querySelector('.back').click(); await settle();
  assert(location.hash === '#location', 'Back returns one step');
  await visit('language');
  assert(document.querySelector('input[value=hi]').checked, 'Language choice survives navigation');
  for (const route of ['language', 'location', 'reveal', 'home']) {
    await visit(route);
    assert(document.documentElement.scrollWidth <= innerWidth + 1, route + ' fits viewport');
    assert([...document.images].every(n => n.complete && n.naturalWidth > 0), route + ' has loaded artwork');
    report.push(route + ': fits, artwork loaded');
  }
  document.querySelector('.daily').click();
  assert(document.querySelector('dialog').open, 'Daily action opens confirmation');
  document.querySelector('.cancel').click();
  assert(!document.querySelector('dialog').open, 'Cancel closes confirmation');
  document.querySelector('.daily').click(); document.querySelector('.confirm').click();
  assert(document.querySelector('.panel').textContent.includes('preview action is recorded'), 'Confirmation records preview state');
  const toggle = document.querySelector('.motion');
  if (toggle.getAttribute('aria-pressed') !== 'true') toggle.click();
  await visit('reveal');
  assert(document.getAnimations().length === 0, 'Reduced motion stops all animations after navigation');
  report.push('journey, Back, language, confirmation and reduced motion pass');
  await visit('home');
  return {width: innerWidth, height: innerHeight, checks: report};
}
