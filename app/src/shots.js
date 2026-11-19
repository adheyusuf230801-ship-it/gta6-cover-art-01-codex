/* Capture consumers wait for __shotReady; no capture or image generation occurs here. */
window.NeonScene = {
  read() {
    window.__shotReady = false;
    const parameters = new URLSearchParams(window.location.search);
    const mode = parameters.get('shot');
    if (mode !== 'cover' && mode !== 'editor') return null;
    const pick = (key, choices, fallback) => choices.includes(parameters.get(key)) ? parameters.get(key) : fallback;
    document.body.classList.toggle('cover-only', mode === 'cover');
    return {
      photo: pick('photo', ['pier', 'boulevard'], 'pier'),
      layout: pick('layout', ['hero', 'grid', 'single', 'strip'], 'hero'),
      size: pick('size', ['1080x1080', '1080x1350', '1920x1080'], '1080x1080'),
      caption: (parameters.get('caption') || 'Sunset Heist').slice(0, 40),
      subtitle: (parameters.get('subtitle') || 'No plans. No alibis.').slice(0, 64)
    };
  },
  async complete() {
    await document.fonts.ready;
    await new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)));
    window.__shotReady = true;
    document.documentElement.dataset.ready = 'true';
  }
};
