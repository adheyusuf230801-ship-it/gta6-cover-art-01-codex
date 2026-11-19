const GRADES = {
  vice: { top: 'rgba(255,119,91,.13)', bottom: 'rgba(226,35,114,.44)', shadow: '#2a114e', highlight: '#ffd298', band: '#f14c72', light: '#ffbf7a' },
  neon: { top: 'rgba(51,231,220,.13)', bottom: 'rgba(221,34,143,.43)', shadow: '#052e50', highlight: '#ff8ab9', band: '#fb4e9a', light: '#65f4df' },
  gold: { top: 'rgba(255,194,83,.22)', bottom: 'rgba(42,77,125,.38)', shadow: '#20375d', highlight: '#ffd67f', band: '#f2ad4e', light: '#ffe2a2' },
  mono: { top: 'rgba(206,221,231,.1)', bottom: 'rgba(12,15,28,.58)', shadow: '#202630', highlight: '#f4eef1', band: '#d6d9de', light: '#fff' },
};
const GAP = 0.012;
const DEFAULT_GRADE = 'vice';

/** Canvas-space regions let dragging target the selected photograph without changing the poster layout. */
export function panelRects(layout, w, h) {
  const g = Math.max(5, Math.round(Math.min(w, h) * GAP));
  if (layout === 'single') return [{ id: 0, x: 0, y: 0, w, h }];
  if (layout === 'grid') {
    const bottom = h * 0.79;
    return [
      { id: 0, x: 0, y: 0, w: w / 2 - g / 2, h: bottom / 2 - g / 2 },
      { id: 1, x: w / 2 + g / 2, y: 0, w: w / 2 - g / 2, h: bottom / 2 - g / 2 },
      { id: 2, x: 0, y: bottom / 2 + g / 2, w: w / 2 - g / 2, h: bottom / 2 - g / 2 },
      { id: 3, x: w / 2 + g / 2, y: bottom / 2 + g / 2, w: w / 2 - g / 2, h: bottom / 2 - g / 2 },
    ];
  }
  if (layout === 'strip') return [
    { id: 0, x: w * .08, y: h * .11, w: w * .58, h: h * .53, angle: -.075 },
    { id: 1, x: w * .49, y: h * .18, w: w * .43, h: h * .48, angle: .065 },
    { id: 2, x: w * .17, y: h * .49, w: w * .48, h: h * .30, angle: .025 },
  ];
  const heroEnd = h * .79;
  const lowerY = h * .615;
  return [
    { id: 0, x: 0, y: 0, w, h: lowerY - g / 2 },
    { id: 1, x: 0, y: lowerY + g / 2, w: w / 3 - g * 2 / 3, h: heroEnd - lowerY - g / 2 },
    { id: 2, x: w / 3 + g / 3, y: lowerY + g / 2, w: w / 3 - g * 2 / 3, h: heroEnd - lowerY - g / 2 },
    { id: 3, x: 2 * w / 3 + g / 3, y: lowerY + g / 2, w: w / 3 - g * 2 / 3, h: heroEnd - lowerY - g / 2 },
  ];
}

function paintPhoto(ctx, photo, rect, key, selected) {
  ctx.save();
  if (rect.angle) {
    ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.rotate(rect.angle);
    ctx.shadowColor = '#000'; ctx.shadowBlur = rect.w * .035; ctx.shadowOffsetY = rect.w * .018;
    ctx.fillStyle = '#f6e8d8'; ctx.fillRect(-rect.w / 2 - 8, -rect.h / 2 - 8, rect.w + 16, rect.h + 16);
    ctx.beginPath(); ctx.rect(-rect.w / 2, -rect.h / 2, rect.w, rect.h); ctx.clip();
    drawCrop(ctx, photo, key, -rect.w / 2, -rect.h / 2, rect.w, rect.h);
    ctx.restore();
    return;
  }
  ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.clip();
  drawCrop(ctx, photo, key, rect.x, rect.y, rect.w, rect.h);
  if (selected && key === selected) {
    ctx.strokeStyle = '#65f4df'; ctx.lineWidth = Math.max(3, rect.w * .004);
    ctx.strokeRect(rect.x + 3, rect.y + 3, rect.w - 6, rect.h - 6);
  }
  ctx.restore();
}
export function cropOffsetY(photo, w, h) {
  if (!photo?.image) return 0;
  if (photo.y != null) return Math.max(-1, Math.min(1, Number(photo.y) || 0));
  const image = photo.image;
  const iw = image.naturalWidth || image.width;
  const ih = image.naturalHeight || image.height;
  // Positive pan cancels the centered overflow in drawCrop: 1 aligns the top.
  // Compare aspect ratios before zoom so zooming cannot switch the default pan.
  return (ih / iw) / (h / w) > 1.3 ? 1 : 0;
}

function drawCrop(ctx, photo, key, x, y, w, h) {
  if (!photo?.image) {
    ctx.fillStyle = '#29223c'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#ffb56c'; ctx.font = `700 ${Math.min(w, h) * .08}px system-ui`; ctx.fillText('ADD A MOMENT', x + w * .08, y + h * .55);
    return;
  }
  const image = photo.image;
  const iw = image.naturalWidth || image.width; const ih = image.naturalHeight || image.height;
  const zoom = Number(photo.zoom) || 1;
  const scale = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * scale; const dh = ih * scale;
  const extraX = dw - w; const extraY = dh - h;
  const ox = Math.max(-1, Math.min(1, Number(photo.x) || 0));
  const oy = cropOffsetY(photo, w, h);
  ctx.drawImage(image, x - extraX / 2 + ox * extraX / 2, y - extraY / 2 + oy * extraY / 2, dw, dh);
}

function fitTitle(ctx, title, maxWidth, initial) {
  let size = initial;
  do { ctx.font = `400 ${size}px AntonPoster,"Arial Black",Impact,sans-serif`; if (ctx.measureText(title).width <= maxWidth || size <= 12) break; size -= Math.max(1, initial * .035); } while (size > 12);
  return size;
}
function seededNoise(w, h) {
  const points = [];
  let seed = 0x31d4cafe;
  for (let i = 0; i < 1900; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const x = seed / 4294967296 * w;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    points.push([x, seed / 4294967296 * h]);
  }
  return points;
}

/** Draw a poster composition at the canvas's current export dimensions. */
export function drawCover(canvas, panels, { layout = 'hero', grade = 'vice', caption = '', subtitle = '', active = -1 } = {}) {
  const ctx = canvas.getContext('2d'); const { width: w, height: h } = canvas;
  const colors = GRADES[grade] || GRADES[DEFAULT_GRADE];
  ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#171322'; ctx.fillRect(0, 0, w, h);
  const rects = panelRects(layout, w, h);
  if (layout === 'strip') {
    const bg = ctx.createLinearGradient(0, 0, w, h); bg.addColorStop(0, '#1c1930'); bg.addColorStop(1, '#603449'); ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h * .8);
    rects.forEach((r) => paintPhoto(ctx, panels[r.id], r, r.id, active));
  } else rects.forEach((r) => paintPhoto(ctx, panels[r.id], r, r.id, active));

  const duo = ctx.createLinearGradient(0, 0, w * .18, h * .82); duo.addColorStop(0, colors.highlight); duo.addColorStop(1, colors.shadow);
  ctx.save(); ctx.globalAlpha = .2; ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = duo; ctx.fillRect(0, 0, w, h * .82); ctx.restore();
  const gradeWash = ctx.createLinearGradient(0, 0, w, h);
  gradeWash.addColorStop(0, colors.top); gradeWash.addColorStop(.62, 'rgba(26,18,39,.05)'); gradeWash.addColorStop(1, colors.bottom);
  ctx.fillStyle = gradeWash; ctx.fillRect(0, 0, w, h * .82);
  const vignette = ctx.createRadialGradient(w * .5, h * .38, Math.min(w, h) * .18, w * .5, h * .42, Math.max(w, h) * .78);
  vignette.addColorStop(0, 'rgba(8,6,18,0)'); vignette.addColorStop(1, 'rgba(8,6,18,.56)'); ctx.fillStyle = vignette; ctx.fillRect(0, 0, w, h * .82);
  ctx.save(); ctx.globalAlpha = .13; ctx.fillStyle = '#fff';
  for (const [x, y] of seededNoise(w, h)) ctx.fillRect(x, y, Math.max(1, w * .001), Math.max(1, w * .001));
  ctx.restore();

  const bandY = h * .795; const bandH = h - bandY;
  ctx.fillStyle = '#171220'; ctx.fillRect(0, bandY, w, bandH);
  ctx.fillStyle = colors.band; ctx.fillRect(0, bandY, w * .022, bandH);
  ctx.fillStyle = colors.light; ctx.font = `700 ${Math.max(11, h * .018)}px system-ui,sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('NEON COAST  /  PERSONAL EDITION', w * .06, bandY + bandH * .16);
  const title = String(caption || '').trim().toUpperCase();
  if (title) {
    const initial = bandH * .36; fitTitle(ctx, title, w * .87, initial);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, h * .003); ctx.strokeStyle = 'rgba(16,10,22,.7)'; ctx.fillStyle = '#fff9ef';
    ctx.strokeText(title, w * .06, bandY + bandH * .44, w * .87); ctx.fillText(title, w * .06, bandY + bandH * .44, w * .87);
  }
  const sub = String(subtitle || '').trim();
  if (sub) { ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'; ctx.font = `italic 500 ${Math.max(12, bandH * .12)}px "Brush Script MT","Segoe Script",cursive`; ctx.shadowColor = colors.light; ctx.shadowBlur = h * .004; ctx.fillStyle = colors.light; ctx.fillText(sub, w * .94, bandY + bandH * .77, w * .72); ctx.shadowBlur = 0; }
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = `600 ${Math.max(8,h*.012)}px system-ui`; ctx.fillText('VICE CITY  •  1986', w * .06, bandY + bandH * .94);
  return rects;
}
