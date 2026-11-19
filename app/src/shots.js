window.CoastShot = async function(prepare) {
  const query=new URLSearchParams(location.search);
  const mode=query.get('shot');
  window.__shotReady=false;
  if(mode==='cover') document.body.classList.add('shot-cover');
  const allow=(key,values,fallback)=>values.includes(query.get(key))?query.get(key):fallback;
  await prepare({
    photo:allow('photo',['pier','boulevard'],'pier'),
    layout:allow('layout',['hero','grid','single','strip'],'hero'),
    size:allow('size',['1080x1080','1080x1350','1920x1080'],'1080x1080'),
    caption:query.get('caption')?.slice(0,40)||'Sunset Heist',
    subtitle:query.get('subtitle')?.slice(0,64)||'No plans. No alibis.'
  });
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  window.__shotReady=true;
  document.documentElement.dataset.ready='true';
};
