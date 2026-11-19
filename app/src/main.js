(() => {
  const byId = id => document.getElementById(id);
  const canvas = byId('cover');
  const project = { layout: 'hero', grade: 'vice', caption: 'Sunset Heist', subtitle: 'No plans. No alibis.', panels: [] };
  const samples = {};
  const scene = NeonScene.read();
  let activePanel = 0, frames = [], gesture = null, loaded = false;
  const limit = value => Math.min(1, Math.max(-1, value));
  const newCrop = (image, index = 0) => ({ image, x: index === 2 ? -.45 : 0, y: .8, zoom: index === 0 ? 1 : 1.16 });
  const announce = message => { byId('status').textContent = message; };
  function loadPhoto(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('That photo could not be opened. Try a JPEG, PNG or WebP.'));
      image.src = url;
    });
  }
  function draw() { if (project.panels.length) frames = NeonCover.render(canvas, project); }
  function refreshPanels() {
    const count = NeonCover.geometry(project.layout, canvas.width, canvas.height).length;
    activePanel = Math.min(activePanel, count - 1);
    const buttons = Array.from({ length: count }, (_, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = String(index + 1).padStart(2, '0');
      button.setAttribute('aria-label', `Edit panel ${index + 1}`);
      button.setAttribute('aria-pressed', String(index === activePanel));
      button.style.backgroundImage = `linear-gradient(#11232c22,#11232c55), url("${project.panels[index].image.src}")`;
      button.addEventListener('click', () => { activePanel = index; refreshPanels(); });
      return button;
    });
    byId('panel-list').replaceChildren(...buttons);
    byId('zoom').value = project.panels[activePanel].zoom;
  }
  function setPhoto(image) {
    if (!loaded) return;
    if (byId('all-panels').checked) project.panels = Array.from({ length: 4 }, (_, index) => newCrop(image, index));
    else project.panels[activePanel] = newCrop(image);
    refreshPanels(); draw(); announce(byId('all-panels').checked ? 'Photo added to every panel.' : `Photo added to panel ${activePanel + 1}.`);
  }
  function setSize() {
    const dimensions = byId('size').value.split('x').map(Number);
    [canvas.width, canvas.height] = dimensions;
    byId('resolution').textContent = dimensions.join(' × '); draw();
  }
  byId('layout').addEventListener('change', event => {
    project.layout = event.target.value;
    if (loaded) { refreshPanels(); draw(); }
  });
  byId('size').addEventListener('change', setSize);
  ['caption', 'subtitle'].forEach(key => byId(key).addEventListener('input', event => { project[key] = event.target.value; draw(); }));
  document.querySelectorAll('[data-look]').forEach(button => button.addEventListener('click', () => {
    project.grade = button.dataset.look;
    document.querySelectorAll('[data-look]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    draw();
  }));
  document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => { if (samples[button.dataset.photo]) setPhoto(samples[button.dataset.photo]); }));
  byId('choose-photo').addEventListener('click', () => byId('photo-file').click());
  byId('photo-file').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    try { setPhoto(await loadPhoto(localUrl)); }
    catch (error) { announce(error.message); URL.revokeObjectURL(localUrl); }
    event.target.value = '';
  });
  byId('zoom').addEventListener('input', event => { if (loaded) { project.panels[activePanel].zoom = Number(event.target.value); draw(); } });
  byId('reset-crop').addEventListener('click', () => {
    if (!loaded) return;
    project.panels[activePanel] = { image: project.panels[activePanel].image, zoom: 1, x: 0, y: 0 };
    refreshPanels(); draw(); announce(`Panel ${activePanel + 1} framing reset.`);
  });
  function position(event) {
    const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * canvas.width / bounds.width, y: (event.clientY - bounds.top) * canvas.height / bounds.height };
  }
  function localDelta(x, y, angle) { return { x: x * Math.cos(angle) + y * Math.sin(angle), y: y * Math.cos(angle) - x * Math.sin(angle) }; }
  canvas.addEventListener('pointerdown', event => {
    const point = position(event);
    const frame = frames.slice().reverse().find(frame => {
      const p = localDelta(point.x - frame.x - frame.width / 2, point.y - frame.y - frame.height / 2, frame.angle);
      return Math.abs(p.x) <= frame.width / 2 && Math.abs(p.y) <= frame.height / 2;
    });
    if (!frame) return;
    activePanel = frame.id; refreshPanels(); canvas.focus(); canvas.setPointerCapture(event.pointerId);
    gesture = { point, frame, x: project.panels[activePanel].x, y: project.panels[activePanel].y };
  });
  canvas.addEventListener('pointermove', event => {
    if (!gesture) return;
    const point = position(event), crop = project.panels[activePanel];
    const delta = localDelta(point.x - gesture.point.x, point.y - gesture.point.y, gesture.frame.angle);
    const image = NeonCover.imageMetrics(gesture.frame, crop);
    crop.x = limit(gesture.x + delta.x * 2 / Math.max(1, image.width - gesture.frame.width));
    crop.y = limit(gesture.y + delta.y * 2 / Math.max(1, image.height - gesture.frame.height)); draw();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => canvas.addEventListener(type, () => { gesture = null; }));
  canvas.addEventListener('keydown', event => {
    if (!loaded || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault(); const crop = project.panels[activePanel], step = event.shiftKey ? .2 : .05;
    if (event.key === 'ArrowLeft') crop.x = limit(crop.x - step);
    if (event.key === 'ArrowRight') crop.x = limit(crop.x + step);
    if (event.key === 'ArrowUp') crop.y = limit(crop.y - step);
    if (event.key === 'ArrowDown') crop.y = limit(crop.y + step);
    draw();
  });
  byId('save').addEventListener('click', () => {
    draw();
    canvas.toBlob(blob => {
      if (!blob) { announce('PNG export failed. Please try again.'); return; }
      const url = URL.createObjectURL(blob), anchor = document.createElement('a');
      anchor.href = url; anchor.download = `neon-coast-${canvas.width}x${canvas.height}.png`;
      document.body.append(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 15000);
      announce(`PNG downloaded · ${canvas.width} × ${canvas.height}`);
    }, 'image/png');
  });
  async function initialize() {
    const photos = await Promise.all(['pier', 'boulevard'].map(name => loadPhoto(`samples/${name}.jpg`)));
    samples.pier = photos[0]; samples.boulevard = photos[1];
    if (scene) {
      for (const key of ['layout', 'caption', 'subtitle']) project[key] = scene[key];
      for (const key of ['layout', 'caption', 'subtitle', 'size']) byId(key).value = scene[key];
    }
    project.panels = Array.from({ length: 4 }, (_, index) => newCrop(scene ? samples[scene.photo] : photos[index % 2], index));
    loaded = true; setSize(); refreshPanels(); byId('save').disabled = false;
    announce('Ready. Your photos stay on this device.');
    window.NeonStudio = { project, canvas, draw };
    await NeonScene.complete();
  }
  initialize().catch(error => { announce(error.message); document.documentElement.dataset.error = error.message; });
})();
