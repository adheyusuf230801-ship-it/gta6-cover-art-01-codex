/* One compositor drives both the working proof and the full-resolution PNG. */
window.NeonCover = (() => {
  const inks = {
    vice: { light: '#ffd799', hot: '#f174a8', dark: '#271a3e', filter: 'saturate(1.25) contrast(1.12)' },
    neon: { light: '#a0ffe0', hot: '#f26ab7', dark: '#172648', filter: 'saturate(1.5) contrast(1.16)' },
    gold: { light: '#ffe5a7', hot: '#e9a256', dark: '#273c42', filter: 'sepia(.25) saturate(1.15) contrast(1.1)' },
    mono: { light: '#f4eadd', hot: '#bacbca', dark: '#1c2931', filter: 'grayscale(1) contrast(1.25)' }
  };
  function geometry(layout, width, height) {
    let placements;
    switch (layout) {
      case 'single': placements = [[0, 0, 1, 1]]; break;
      case 'grid': placements = [[0, 0, .5, .5], [.5, 0, .5, .5], [0, .5, .5, .5], [.5, .5, .5, .5]]; break;
      case 'strip': placements = [[.04, .06, .57, .86, -.055], [.57, .045, .38, .49, .07], [.54, .56, .42, .4, -.04]]; break;
      default: placements = [[0, 0, .675, 1], [.675, 0, .325, .335], [.675, .335, .325, .33], [.675, .665, .325, .335]];
    }
    const gap = Math.min(width, height) * .009;
    return placements.map((p, id) => ({ id, x: p[0] * width + gap, y: p[1] * height * .745 + gap,
      width: p[2] * width - gap * 2, height: p[3] * height * .745 - gap * 2, angle: p[4] || 0 }));
  }
  function imageMetrics(frame, crop) {
    const factor = Math.max(frame.width / crop.image.naturalWidth, frame.height / crop.image.naturalHeight) * crop.zoom;
    return { width: crop.image.naturalWidth * factor, height: crop.image.naturalHeight * factor };
  }
  function paintPhoto(context, frame, crop, ink, unit) {
    const { width: w, height: h } = frame;
    context.save();
    context.translate(frame.x + w / 2, frame.y + h / 2);
    context.rotate(frame.angle);
    context.fillStyle = '#f4dfbc';
    if (frame.angle) context.fillRect(-w / 2 - unit * .006, -h / 2 - unit * .006, w + unit * .012, h + unit * .012);
    context.beginPath(); context.rect(-w / 2, -h / 2, w, h); context.clip();
    if (crop && crop.image) {
      const image = imageMetrics(frame, crop);
      context.filter = ink.filter;
      context.drawImage(crop.image, -image.width / 2 + crop.x * (image.width - w) / 2,
        -image.height / 2 + crop.y * (image.height - h) / 2, image.width, image.height);
      context.filter = 'none';
    }
    const wash = context.createLinearGradient(0, -h / 2, 0, h / 2);
    wash.addColorStop(0, ink.light); wash.addColorStop(.6, ink.hot); wash.addColorStop(1, ink.dark);
    context.globalCompositeOperation = 'soft-light'; context.globalAlpha = .53;
    context.fillStyle = wash; context.fillRect(-w / 2, -h / 2, w, h);
    context.globalCompositeOperation = 'source-over'; context.globalAlpha = 1;
    const shade = context.createLinearGradient(0, 0, 0, h / 2);
    shade.addColorStop(0, '#10172200'); shade.addColorStop(1, '#1017226b');
    context.fillStyle = shade; context.fillRect(-w / 2, -h / 2, w, h);
    context.fillStyle = '#152429b3'; context.fillRect(-w / 2 + unit * .012, -h / 2 + unit * .012, unit * .105, unit * .027);
    context.font = `700 ${unit * .011}px Arial, sans-serif`; context.textBaseline = 'middle'; context.fillStyle = '#ffead0';
    context.fillText(`CHAPTER / 0${frame.id + 1}`, -w / 2 + unit * .018, -h / 2 + unit * .026);
    context.restore();
  }
  function render(canvas, project) {
    const context = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height, unit = Math.min(w, h), titleTop = h * .745;
    const ink = inks[project.grade] || inks.vice;
    context.clearRect(0, 0, w, h); context.fillStyle = '#142129'; context.fillRect(0, 0, w, h);
    const frames = geometry(project.layout, w, h);
    frames.forEach(frame => paintPhoto(context, frame, project.panels[frame.id], ink, unit));
    context.save(); context.beginPath(); context.rect(0, titleTop, w, h - titleTop); context.clip();
    const paper = context.createLinearGradient(0, titleTop, w, h);
    paper.addColorStop(0, ink.dark); paper.addColorStop(1, '#101f29');
    context.fillStyle = paper; context.fillRect(0, titleTop, w, h - titleTop);
    const pitch = unit * .009;
    context.fillStyle = ink.hot; context.globalAlpha = .22;
    for (let row = 0; row * pitch < h - titleTop; row++) {
      for (let x = (row % 2) * pitch / 2; x < w; x += pitch) {
        context.beginPath(); context.arc(x, titleTop + row * pitch, pitch * .17, 0, 2 * Math.PI); context.fill();
      }
    }
    context.globalAlpha = 1;
    context.fillStyle = ink.hot; context.fillRect(unit * .032, titleTop + h * .025, unit * .052, unit * .005);
    context.fillStyle = ink.light; context.font = `700 ${unit * .012}px Arial, sans-serif`; context.textBaseline = 'middle';
    context.fillText('NEON COAST  /  AN INDEPENDENT COVER STORY', unit * .1, titleTop + h * .028);
    const headline = (project.caption.trim() || 'UNTITLED ESCAPE').toLocaleUpperCase('en-US');
    let fontSize = h * .14;
    const setFont = () => { context.font = `900 ${fontSize}px Impact, Haettenschweiler, "Arial Narrow", "Liberation Sans Narrow", sans-serif`; };
    setFont();
    while (context.measureText(headline).width > w * .935 && fontSize > 12) { fontSize -= 1; setFont(); }
    const baseline = titleTop + h * .153;
    const titleInk = context.createLinearGradient(0, baseline - fontSize, 0, baseline);
    titleInk.addColorStop(0, '#fff3d3'); titleInk.addColorStop(.55, ink.light); titleInk.addColorStop(1, ink.hot);
    context.textBaseline = 'alphabetic'; context.lineJoin = 'round'; context.lineWidth = unit * .007;
    context.strokeStyle = '#0b1420'; context.fillStyle = '#080f18';
    context.fillText(headline, unit * .032 + unit * .005, baseline + unit * .006);
    context.strokeText(headline, unit * .032, baseline); context.fillStyle = titleInk; context.fillText(headline, unit * .032, baseline);
    context.font = `italic 600 ${unit * .024}px Georgia, serif`; context.fillStyle = ink.hot;
    context.fillText(project.subtitle, unit * .035, h - h * .04, w * .76);
    context.textAlign = 'right'; context.fillStyle = '#b9c7c1'; context.font = `700 ${unit * .01}px Arial, sans-serif`;
    context.fillText('AFTER HOURS / 01', w - unit * .03, h - h * .022);
    context.restore();
    context.strokeStyle = '#f2d8af'; context.lineWidth = unit * .004;
    context.strokeRect(unit * .003, unit * .003, w - unit * .006, h - unit * .006);
    return frames;
  }
  return { render, geometry, imageMetrics };
})();
