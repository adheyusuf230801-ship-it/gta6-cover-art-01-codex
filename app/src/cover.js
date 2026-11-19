/* Local canvas compositor; preview and downloaded PNG use this same painter. */
window.CoastArt = (() => {
  const palettes = {
    vice: ['#ffbf78', '#ec5794', '#321744'],
    neon: ['#70f5d0', '#f54ca1', '#101f48'],
    gold: ['#ffe1a0', '#e79d4b', '#243d51'],
    mono: ['#f1ece2', '#a9b9bc', '#171c29']
  };
  function frames(kind, width, height) {
    const gutter = Math.min(width, height) * .012, top = height * .745;
    let boxes;
    if (kind === 'single') boxes = [[0, 0, 1, 1]];
    else if (kind === 'grid') boxes = [[0,0,.5,.5],[.5,0,.5,.5],[0,.5,.5,.5],[.5,.5,.5,.5]];
    else if (kind === 'strip') boxes = [[.045,.06,.57,.79,-.065],[.52,.04,.43,.52,.08],[.47,.51,.47,.45,-.045]];
    else boxes = [[0,0,.67,1],[.67,0,.33,.34],[.67,.34,.33,.33],[.67,.67,.33,.33]];
    return boxes.map(([x,y,w,h,angle=0], index) => ({index, x:x*width+gutter, y:y*top+gutter, w:w*width-gutter*2, h:h*top-gutter*2, angle}));
  }
  function photograph(ctx, rect, panel, grade) {
    const {x,y,w,h,angle}=rect;
    ctx.save(); ctx.translate(x+w/2,y+h/2); ctx.rotate(angle);
    if(angle){ctx.fillStyle='#f2dec0';ctx.fillRect(-w/2-7,-h/2-7,w+14,h+14);}
    ctx.beginPath();ctx.rect(-w/2,-h/2,w,h);ctx.clip();
    const image=panel.image;
    const scale=Math.max(w/image.naturalWidth,h/image.naturalHeight)*panel.zoom;
    const dw=image.naturalWidth*scale,dh=image.naturalHeight*scale;
    ctx.filter=grade==='mono'?'grayscale(1) contrast(1.2)':'saturate(1.25) contrast(1.14)';
    ctx.drawImage(image,-dw/2+(dw-w)*panel.x/2,-dh/2+(dh-h)*panel.y/2,dw,dh);ctx.filter='none';
    const colors=palettes[grade];
    const wash=ctx.createLinearGradient(0,-h/2,0,h/2);wash.addColorStop(0,colors[0]);wash.addColorStop(1,colors[1]);
    ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=.45;ctx.fillStyle=wash;ctx.fillRect(-w/2,-h/2,w,h);
    ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.18;ctx.fillStyle=colors[2];ctx.fillRect(-w/2,-h/2,w,h);
    ctx.restore();
  }
  function render(canvas, model) {
    const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,m=Math.min(w,h),colors=palettes[model.grade]||palettes.vice;
    c.fillStyle='#15151e';c.fillRect(0,0,w,h);
    const regions=frames(model.layout,w,h);
    regions.forEach(r=>photograph(c,r,model.panels[r.index],model.grade));
    c.textBaseline='top';
    regions.forEach((r,i)=>{c.fillStyle='#161521b0';c.fillRect(r.x+12,r.y+12,m*.09,m*.026);c.fillStyle='#fff0d4';c.font='700 '+m*.011+'px Arial';c.fillText('SCENE / 0'+(i+1),r.x+18,r.y+17);});
    const y=h*.745;
    const band=c.createLinearGradient(0,y,w,h);band.addColorStop(0,'#241b32');band.addColorStop(1,'#121b27');c.fillStyle=band;c.fillRect(0,y,w,h-y);
    c.save();c.beginPath();c.rect(0,y,w,h-y);c.clip();
    c.fillStyle=colors[1];c.globalAlpha=.25;
    const dot=m*.008;
    for(let row=0;row<(h-y)/dot;row++)for(let col=0;col<w/dot;col++){c.beginPath();c.arc(col*dot+(row%2)*dot/2,y+row*dot,dot*.15,0,Math.PI*2);c.fill();}
    c.restore();
    c.fillStyle=colors[1];c.fillRect(m*.025,y+m*.024,m*.055,m*.005);
    c.font='700 '+m*.012+'px Arial';c.fillStyle=colors[0];c.fillText('NEON COAST  /  AN ORIGINAL STORY',m*.095,y+m*.019);
    const title=(model.caption.trim()||'UNTITLED ESCAPE').toUpperCase();
    let font=h*.14;
    const type=()=> '900 '+font+'px Impact, "Arial Narrow", "Liberation Sans Narrow", sans-serif';
    c.font=type();while(c.measureText(title).width>w*.91&&font>12){font-=1;c.font=type();}
    c.textBaseline='alphabetic';c.lineJoin='round';c.lineWidth=m*.006;c.strokeStyle='#100f1c';
    const letter=c.createLinearGradient(0,y,0,h);letter.addColorStop(0,'#fff5d4');letter.addColorStop(.6,colors[0]);letter.addColorStop(1,colors[1]);
    c.fillStyle='#060b13';c.fillText(title,m*.03+4,y+h*.145+5,w*.94);c.fillStyle=letter;c.strokeText(title,m*.03,y+h*.145,w*.94);c.fillText(title,m*.03,y+h*.145,w*.94);
    c.font='italic 600 '+m*.024+'px Georgia,serif';c.fillStyle=colors[1];c.fillText(model.subtitle,m*.035,h-m*.039,w*.77);
    c.textAlign='right';c.font='700 '+m*.01+'px Arial';c.fillStyle='#b6b4b0';c.fillText('AFTER DARK / VOL. 01',w-m*.03,h-m*.025);c.textAlign='left';
    c.strokeStyle='#f7d6a4';c.lineWidth=m*.004;c.strokeRect(m*.003,m*.003,w-m*.006,h-m*.006);
    return regions;
  }
  return {frames,render};
})();
