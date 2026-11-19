// Stable local scenes for the screenshot renderer. No browser APIs or network assets are needed until paint.
export async function runShot(shot, query, prepare) {
  window.__shotReady = false;
  const layoutValue = query.get('layout');
  const layout = ['hero', 'grid', 'single', 'strip'].includes(layoutValue) ? layoutValue : 'hero';
  const requestedSize = query.get('size');
  const size = /^\d+x\d+$/.test(requestedSize || '') ? requestedSize : '1080x1080';
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await prepare({
    photo: ['pier', 'boulevard'].includes(query.get('photo')) ? query.get('photo') : 'pier',
    caption: query.get('caption') || 'Sunset Heist',
    subtitle: query.get('subtitle') || 'THE NIGHT IS OURS',
    layout,
    size,
  });
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
