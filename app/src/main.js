(() => {
  const el=id=>document.getElementById(id),canvas=el('art');
  const model={layout:'hero',grade:'vice',caption:'Sunset Heist',subtitle:'No plans. No alibis.',panels:[]};
  let selected=0,regions=[],drag=null;
  const images={};
  const clamp=n=>Math.max(-1,Math.min(1,n));
  const crop=(image,index=0)=>({image,zoom:index?1.18:1,x:index===2?-.6:0,y:1});
  const openImage=url=>new Promise((ok,fail)=>{const image=new Image();image.onload=()=>ok(image);image.onerror=()=>fail(Error('Please choose a supported image.'));image.src=url;});
  function paint(){regions=CoastArt.render(canvas,model);}
  function controls(){
    el('panels').replaceChildren();
    const count=CoastArt.frames(model.layout,canvas.width,canvas.height).length;
    selected=Math.min(selected,count-1);
    for(let i=0;i<count;i++){
      const button=document.createElement('button');button.textContent='0'+(i+1);button.title='Edit panel '+(i+1);button.setAttribute('aria-pressed',String(selected===i));
      button.className=selected===i?'chosen':'';button.style.backgroundImage='linear-gradient(#0003,#0005),url("'+model.panels[i].image.src+'")';
      button.onclick=()=>{selected=i;controls();};el('panels').append(button);
    }
    el('zoom').value=model.panels[selected].zoom;
  }
  function useImage(image){
    if(el('fill').checked) model.panels=Array.from({length:4},(_,i)=>crop(image,i));
    else model.panels[selected]=crop(image);
    controls();paint();el('status').textContent=el('fill').checked?'Photo applied to every frame.':'Panel '+(selected+1)+' updated.';
  }
  function resize(){const [w,h]=el('size').value.split('x').map(Number);canvas.width=w;canvas.height=h;el('dimensions').textContent=w+' × '+h;paint();}
  el('layout').onchange=()=>{model.layout=el('layout').value;controls();paint();};
  for(const key of ['caption','subtitle'])el(key).oninput=()=>{model[key]=el(key).value;paint();};
  el('size').onchange=resize;
  document.querySelectorAll('[data-grade]').forEach(button=>button.onclick=()=>{model.grade=button.dataset.grade;document.querySelectorAll('[data-grade]').forEach(b=>{b.classList.toggle('chosen',b===button);b.setAttribute('aria-pressed',String(b===button));});paint();});
  document.querySelectorAll('[data-sample]').forEach(button=>button.onclick=()=>useImage(images[button.dataset.sample]));
  el('upload').onclick=()=>el('photo').click();
  el('photo').onchange=async()=>{
    const file=el('photo').files[0];if(!file)return;const url=URL.createObjectURL(file);
    try{useImage(await openImage(url));}catch(error){el('status').textContent=error.message;URL.revokeObjectURL(url);}
    el('photo').value='';
  };
  el('zoom').oninput=()=>{model.panels[selected].zoom=Number(el('zoom').value);paint();};
  el('reset').onclick=()=>{model.panels[selected]=crop(model.panels[selected].image);controls();paint();};
  const coordinates=event=>{const box=canvas.getBoundingClientRect();return {x:(event.clientX-box.left)*canvas.width/box.width,y:(event.clientY-box.top)*canvas.height/box.height};};
  canvas.onpointerdown=event=>{
    const p=coordinates(event);const frame=[...regions].reverse().find(r=>{const dx=p.x-r.x-r.w/2,dy=p.y-r.y-r.h/2;return Math.abs(dx*Math.cos(r.angle)+dy*Math.sin(r.angle))<=r.w/2&&Math.abs(-dx*Math.sin(r.angle)+dy*Math.cos(r.angle))<=r.h/2;});
    if(!frame)return;selected=frame.index;controls();canvas.setPointerCapture(event.pointerId);drag={...p,frame,startX:model.panels[selected].x,startY:model.panels[selected].y};
  };
  canvas.onpointermove=event=>{
    if(!drag)return;const p=coordinates(event),r=drag.frame,photo=model.panels[selected],image=photo.image;
    const scale=Math.max(r.w/image.naturalWidth,r.h/image.naturalHeight)*photo.zoom,dx=p.x-drag.x,dy=p.y-drag.y;
    const localX=dx*Math.cos(r.angle)+dy*Math.sin(r.angle),localY=-dx*Math.sin(r.angle)+dy*Math.cos(r.angle);
    photo.x=clamp(drag.startX+2*localX/Math.max(1,image.naturalWidth*scale-r.w));photo.y=clamp(drag.startY+2*localY/Math.max(1,image.naturalHeight*scale-r.h));paint();
  };
  canvas.onpointerup=canvas.onpointercancel=()=>{drag=null;};
  canvas.onkeydown=event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const p=model.panels[selected];p.x=clamp(p.x+(event.key==='ArrowRight'?.1:event.key==='ArrowLeft'?-.1:0));p.y=clamp(p.y+(event.key==='ArrowDown'?.1:event.key==='ArrowUp'?-.1:0));paint();};
  el('download').onclick=()=>{
    canvas.toBlob(blob=>{if(!blob){el('status').textContent='Could not export. Please try again.';return;}const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='neon-coast-'+el('size').value+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);el('status').textContent='PNG ready · '+canvas.width+' × '+canvas.height;},'image/png');
  };
  async function start(){
    [images.pier,images.boulevard]=await Promise.all(['pier','boulevard'].map(name=>openImage('./samples/'+name+'.jpg')));
    if(new URLSearchParams(location.search).has('shot')) await CoastShot(async scene=>{model.layout=scene.layout;model.caption=scene.caption;model.subtitle=scene.subtitle;model.panels=Array.from({length:4},(_,i)=>crop(images[scene.photo],i));for(const key of ['layout','caption','subtitle','size'])el(key).value=scene[key];resize();controls();});
    else{model.panels=Array.from({length:4},(_,i)=>crop(i%2?images.boulevard:images.pier,i));controls();paint();}
    el('status').textContent='Ready to roll. Your photos stay on this device.';
    window.NeonStudio={model,canvas,paint};
  }
  start().catch(error=>{el('status').textContent=error.message;document.documentElement.dataset.error=error.message;});
})();
