import { cropOffsetY, drawCover, panelRects } from './cover.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover'); const caption = $('caption'); const subtitle = $('subtitle'); const status = $('status');
const sizeSelect = $('size'); const layoutSelect = $('layout'); const panelList = $('panel-list');
const state = { layout: 'hero', grade: 'vice', selected: 0, size: [1080, 1080], panels: [] };
const samplePhotos = ['samples/boulevard.jpg', 'samples/pier.jpg', 'samples/boulevard.jpg', 'samples/pier.jpg'];
const labels = ['Hero frame', 'Coastline', 'After hours', 'Last light'];

export function loadImage(url) {
  return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error(`Could not load ${url}`)); image.src = url; });
}
function panelCount(layout) { return layout === 'single' ? 1 : layout === 'strip' ? 3 : 4; }
function renderPanelControls() {
  panelList.replaceChildren();
  for (let id = 0; id < panelCount(state.layout); id++) {
    const card = document.createElement('div'); card.className = 'panel-card';
    const choose = document.createElement('button'); choose.type = 'button'; choose.className = `panel-button${state.selected === id ? ' active' : ''}`;
    choose.dataset.number = String(id + 1); choose.textContent = labels[id]; choose.addEventListener('click', () => { state.selected = id; renderPanelControls(); redraw(); });
    const file = document.createElement('input'); file.type = 'file'; file.accept = 'image/*'; file.setAttribute('aria-label', `Choose photo for panel ${id + 1}`);
    file.addEventListener('change', async () => {
      if (!file.files?.[0]) return;
      state.selected = id;
      try { state.panels[id] = { image: await loadImage(URL.createObjectURL(file.files[0])), zoom: 1, x: 0 }; renderPanelControls(); redraw(); status.textContent = `Panel ${id + 1} · photo loaded`; }
      catch { status.textContent = 'That image could not be opened. Try another photo.'; }
    });
    const zoomLabel = document.createElement('label'); zoomLabel.className = 'zoom-control'; zoomLabel.textContent = 'ZOOM';
    const zoom = document.createElement('input'); zoom.type = 'range'; zoom.min = '1'; zoom.max = '3'; zoom.step = '.01'; zoom.value = String(state.panels[id]?.zoom || 1); zoom.setAttribute('aria-label', `Zoom panel ${id + 1}`);
    zoom.addEventListener('input', () => { state.panels[id] ||= { image: null, x: 0 }; state.panels[id].zoom = Number(zoom.value); state.selected = id; redraw(); });
    zoomLabel.append(zoom); card.append(choose, file, zoomLabel); panelList.append(card);
  }
}
function redraw() {
  drawCover(canvas, state.panels, { layout: state.layout, grade: state.grade, caption: caption.value, subtitle: subtitle.value, active: state.selected });
}
function decodeSize() {
  status.textContent = `Canvas set to ${sizeSelect.value}`;
  const parts = sizeSelect.value.split('x').map(Number);
  state.size = parts.length === 2 && parts.every(Number.isFinite) ? parts : [1080, 1080];
  canvas.width = state.size[0]; canvas.height = state.size[1];
  $('preview-size').textContent = `${state.size[0]} × ${state.size[1]}`;
  redraw();
}
function updatePanelsForLayout() { state.layout = layoutSelect.value; status.textContent = `Layout changed · ${state.layout} poster`; state.selected = Math.min(state.selected, panelCount(state.layout) - 1); renderPanelControls(); redraw(); }
layoutSelect.addEventListener('change', updatePanelsForLayout);
$('grade').addEventListener('change', (event) => { state.grade = event.target.value; redraw(); });
caption.addEventListener('input', redraw); subtitle.addEventListener('input', redraw);
sizeSelect.addEventListener('change', decodeSize);
$('fill-all').addEventListener('click', () => $('fill-file').click());
$('fill-file').addEventListener('change', async (event) => {
  const file = event.target.files?.[0]; if (!file) return;
  try { const image = await loadImage(URL.createObjectURL(file)); state.panels = Array.from({ length: 4 }, () => ({ image, zoom: 1, x: 0 })); redraw(); status.textContent = 'All panels filled with your photo'; }
  catch { status.textContent = 'That image could not be opened. Try another photo.'; }
  event.target.value = '';
});

let drag = null;
canvas.addEventListener('pointerdown', (event) => {
  canvas.setPointerCapture(event.pointerId);
  const box = canvas.getBoundingClientRect();
  const x = (event.clientX - box.left) * canvas.width / box.width;
  const y = (event.clientY - box.top) * canvas.height / box.height;
  const hit = panelRects(state.layout, canvas.width, canvas.height).find((rect) => x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h);
  if (hit) { state.selected = hit.id; renderPanelControls(); }
  const panel = state.panels[state.selected];
  if (panel) {
    const rect = hit || panelRects(state.layout, canvas.width, canvas.height)[state.selected];
    // Start from the displayed automatic crop so the first drag does not jump.
    drag = { startX: event.clientX, startY: event.clientY, x: panel.x || 0, y: cropOffsetY(panel, rect.w, rect.h), panel, rect };
  }
});
canvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const box = canvas.getBoundingClientRect();
  const frame = drag.rect || { w: canvas.width, h: canvas.height };
  drag.panel.x = Math.max(-1, Math.min(1, drag.x - (event.clientX - drag.startX) / box.width * canvas.width / frame.w * 1.5));
  drag.panel.y = Math.max(-1, Math.min(1, drag.y - (event.clientY - drag.startY) / box.height * canvas.height / frame.h * 1.5));
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('pointercancel', () => { drag = null; });
$('export').addEventListener('click', () => {
  canvas.toBlob((blob) => {
    if (!blob) { status.textContent = 'Export failed · please try again'; return; }
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `neon-coast-${state.size[0]}x${state.size[1]}.png`; link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000); status.textContent = `Saved ${link.download}`;
  }, 'image/png');
});

async function boot() {
  renderPanelControls();
  const params = new URLSearchParams(location.search); const shot = params.get('shot');
  if (shot) {
    await runShot(shot, params, async ({ photo, caption: title, subtitle: sub, layout, size }) => {
      const image = await loadImage(photo === 'pier' ? 'samples/pier.jpg' : 'samples/boulevard.jpg');
      state.panels = Array.from({ length: 4 }, () => ({ image, zoom: 1, x: 0 }));
      caption.value = title; subtitle.value = sub;
      if (['hero', 'grid', 'single', 'strip'].includes(layout)) { layoutSelect.value = layout; state.layout = layout; }
      if (/^\d+x\d+$/.test(size)) { const [w, h] = size.split('x').map(Number); const value = `${w}x${h}`; if ([ '1080x1080', '1080x1350', '1920x1080' ].includes(value)) sizeSelect.value = value; }
      renderPanelControls(); decodeSize();
    });
  } else {
    const images = await Promise.all(samplePhotos.slice(0, 2).map(loadImage));
    state.panels = Array.from({ length: 4 }, (_, id) => ({ image: images[id % 2], zoom: 1, x: 0 }));
    renderPanelControls(); redraw();
  }
}
boot().catch((error) => { status.textContent = `Studio could not start: ${error.message}`; });
