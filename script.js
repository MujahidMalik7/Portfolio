/* ==========================================================================
   DEMO VIDEOS: edit these four variables (one place for both cards).
   - *_YOUTUBE_ID: the ID after "v=" in the YouTube link (Unlisted is fine).
     Leave it "" to keep the plain dark placeholder for that card.
   - *_POSTER: the thumbnail shown before the visitor clicks play. If the file
     is missing, the dark gradient is shown behind the play button instead.
   ========================================================================== */
var WENET_YOUTUBE_ID = "PuczDcLqMvY";
var WENET_POSTER = "/assets/posters/wenet-poster.jpg";
var DOWDY_YOUTUBE_ID = "EwnXITB-DC0";
var DOWDY_POSTER = "/assets/posters/dowdy-poster.jpg";

(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,hasIO='IntersectionObserver' in window;

/* Header: shadow + scroll progress */
var hd=document.querySelector('.site-header');
function onScroll(){
 hd.classList.toggle('scrolled',scrollY>=40);
 var max=document.documentElement.scrollHeight-innerHeight;
 hd.style.setProperty('--p',max>0?Math.min(scrollY/max,1):0);
}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* Active nav link */
var links={};document.querySelectorAll('.site-header nav a[href^="#"]').forEach(function(a){links[a.getAttribute('href').slice(1)]=a});
if(hasIO){
 var so=new IntersectionObserver(function(es){es.forEach(function(e){
  if(!e.isIntersecting)return;
  Object.keys(links).forEach(function(k){var on=k===e.target.id;links[k].classList.toggle('active',on);on?links[k].setAttribute('aria-current','true'):links[k].removeAttribute('aria-current')});
 })},{rootMargin:'-45% 0px -50% 0px'});
 Object.keys(links).forEach(function(k){var s=document.getElementById(k);if(s)so.observe(s)});
}

/* Fade-and-rise reveal, once, 60ms stagger between siblings */
var rev=document.querySelectorAll('.reveal');
if(reduce||!hasIO){rev.forEach(function(e){e.classList.add('in')})}
else{
 var io=new IntersectionObserver(function(es){es.forEach(function(e){
  if(!e.isIntersecting)return;
  var el=e.target,sib=[].filter.call(el.parentNode.children,function(c){return c.classList.contains('reveal')}),i=sib.indexOf(el);
  el.style.transitionDelay=(i*60)+'ms';
  el.addEventListener('transitionend',function(){el.style.transitionDelay=''},{once:true});
  el.classList.add('in');io.unobserve(el);
 })},{threshold:.1});
 rev.forEach(function(e){io.observe(e)});
}

/* Count-up, once */
function fmt(n,el){return (el.dataset.prefix||'')+n+(el.dataset.suffix||'')}
if(!reduce&&hasIO){
 var co=new IntersectionObserver(function(es){es.forEach(function(e){
  if(!e.isIntersecting)return;co.unobserve(e.target);
  var el=e.target,to=+el.dataset.to,t0=null;
  (function step(t){t0=t0||t;var p=Math.min((t-t0)/1200,1);el.textContent=fmt(Math.round(to*(1-Math.pow(1-p,3))),el);if(p<1)requestAnimationFrame(step)})(performance.now());
 })},{threshold:.6});
 document.querySelectorAll('[data-to]').forEach(function(n){n.textContent=fmt(0,n);co.observe(n)});
}

/* Copy buttons (icon-only; swaps to a check icon on success) */
var CHECK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
document.querySelectorAll('.copy').forEach(function(b){
 var icon=b.innerHTML,label=b.getAttribute('aria-label');
 b.addEventListener('click',function(){
  var t=b.dataset.copy;
  function done(){b.innerHTML=CHECK;b.setAttribute('aria-label','Copied');setTimeout(function(){b.innerHTML=icon;b.setAttribute('aria-label',label)},1500)}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,fallback)}else fallback();
  function fallback(){var x=document.createElement('textarea');x.value=t;x.style.position='fixed';x.style.opacity='0';document.body.appendChild(x);x.select();try{document.execCommand('copy')}catch(e){}document.body.removeChild(x);done()}
 });
});

/* Resume viewer */
var rv=document.getElementById('rv'),body=document.getElementById('rv-body'),closeBtn=rv.querySelector('.rv-close');
var PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/',loading=null,doc=null,last=null,token=0,lastW=0;
function addScript(src){return new Promise(function(ok,fail){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=fail;document.head.appendChild(s)})}
/* Loaded only when the viewer is first opened: PDF.js from cdnjs + the base64 resume (assets/resume-data.js) */
function loadLib(){
 if(window.pdfjsLib&&window.RESUME_B64)return Promise.resolve();
 return loading||(loading=Promise.all([
  window.pdfjsLib?0:addScript(PDFJS+'pdf.min.js').then(function(){pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.js'}),
  window.RESUME_B64?0:addScript('assets/resume-data.js')
 ]).catch(function(e){loading=null;throw e}));
}
/* If PDF.js or the embedded data fails: a short message plus a plain link (no iframe, no download attribute) */
function fallback(){
 body.textContent='';body.className='rv-body';
 body.innerHTML='<p class="rv-status">Couldn\'t load the preview.<br><a href="resume.pdf" target="_blank" rel="noopener">Open resume in new tab ↗</a></p>';
}
/* The PDF comes from assets/resume-data.js (window.RESUME_B64), never from a .pdf URL, so
   download managers such as IDM cannot intercept it. When the resume changes, replace resume.pdf
   and re-run the command in README.md to regenerate assets/resume-data.js. */
function resumeBytes(){
 var b=window.RESUME_B64;if(!b)throw new Error('resume data missing');
 var bin=atob(b),u=new Uint8Array(bin.length);
 for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
 return u;
}
async function render(){
 var my=++token;lastW=body.clientWidth;
 var w=lastW-(innerWidth<700?24:48),dpr=Math.min(window.devicePixelRatio||1,2);
 doc=doc||await pdfjsLib.getDocument({data:resumeBytes()}).promise;
 var box=document.createElement('div');
 for(var i=1;i<=doc.numPages;i++){
  var page=await doc.getPage(i);if(my!==token)return;
  var vp=page.getViewport({scale:w/page.getViewport({scale:1}).width});
  var wrap=document.createElement('div');wrap.className='rv-page';wrap.style.width=vp.width+'px';wrap.style.height=vp.height+'px';
  var c=document.createElement('canvas');c.width=Math.floor(vp.width*dpr);c.height=Math.floor(vp.height*dpr);c.style.width=vp.width+'px';c.style.height=vp.height+'px';
  wrap.appendChild(c);box.appendChild(wrap);
  if(i===1){body.textContent='';body.appendChild(box)}
  await page.render({canvasContext:c.getContext('2d'),viewport:vp,transform:dpr!==1?[dpr,0,0,dpr,0,0]:null}).promise;
  (await page.getAnnotations()).forEach(function(a){
   if(a.subtype!=='Link'||!a.url)return;
   var r=vp.convertToViewportRectangle(a.rect),l=document.createElement('a');
   l.href=a.url;l.target='_blank';l.rel='noopener';l.setAttribute('aria-label','Open link: '+a.url);
   l.style.cssText='left:'+Math.min(r[0],r[2])+'px;top:'+Math.min(r[1],r[3])+'px;width:'+Math.abs(r[2]-r[0])+'px;height:'+Math.abs(r[3]-r[1])+'px';
   wrap.appendChild(l);
  });
 }
}
function openViewer(trigger){
 last=trigger;rv.hidden=false;document.body.classList.add('rv-lock');
 body.className='rv-body';body.innerHTML='<p class="rv-status">Loading resume…</p>';closeBtn.focus();
 loadLib().then(render).catch(fallback);
}
function closeViewer(){
 token++;rv.hidden=true;document.body.classList.remove('rv-lock');
 if(last&&last.focus)last.focus();
}
document.querySelectorAll('.js-resume').forEach(function(a){
 a.addEventListener('click',function(e){if(e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;e.preventDefault();openViewer(a)});
});
closeBtn.addEventListener('click',closeViewer);
rv.addEventListener('click',function(e){if(e.target===rv)closeViewer()});
document.addEventListener('keydown',function(e){
 if(rv.hidden)return;
 if(e.key==='Escape'){e.preventDefault();closeViewer();return}
 if(e.key!=='Tab')return;
 var f=[].filter.call(rv.querySelectorAll('a[href],button,iframe'),function(n){return n.offsetParent!==null});
 if(!f.length)return;
 var first=f[0],end=f[f.length-1];
 if(!rv.contains(document.activeElement)){e.preventDefault();first.focus()}
 else if(e.shiftKey&&document.activeElement===first){e.preventDefault();end.focus()}
 else if(!e.shiftKey&&document.activeElement===end){e.preventDefault();first.focus()}
});
var rt;addEventListener('resize',function(){
 clearTimeout(rt);rt=setTimeout(function(){
  if(!rv.hidden&&doc&&Math.abs(body.clientWidth-lastW)>20)render().catch(fallback);
 },250);
});
})();

/* Click-to-play YouTube walkthroughs: nothing from YouTube loads until the click */
(function(){
var DEMOS={wenet:{id:WENET_YOUTUBE_ID,poster:WENET_POSTER},dowdy:{id:DOWDY_YOUTUBE_ID,poster:DOWDY_POSTER}};
var warmed=false;
function warm(){
 if(warmed)return;warmed=true;
 var l=document.createElement('link');l.rel='preconnect';l.href='https://www.youtube-nocookie.com';document.head.appendChild(l);
}
document.querySelectorAll('[data-yt]').forEach(function(box){
 var d=DEMOS[box.getAttribute('data-yt')]||{},card=box.closest('.card');
 var btn=box.querySelector('.yt-poster'),note=card.querySelector('.yt-link');
 if(!d.id){
  /* No ID: keep the dark placeholder */
  btn.remove();note.style.display='none';
  box.classList.remove('video');box.setAttribute('role','img');box.setAttribute('aria-label','Demo video placeholder');
  return;
 }
 var img=btn.querySelector('img'),title=card.querySelector('h3').textContent.trim();
 if(d.poster){img.onerror=function(){img.remove()};img.src=d.poster}else{img.remove()}
 btn.hidden=false;
 var a=note.querySelector('a');a.href='https://www.youtube.com/watch?v='+encodeURIComponent(d.id);note.classList.add('on');
 ['pointerenter','focus','touchstart'].forEach(function(ev){btn.addEventListener(ev,warm,{passive:true,once:true})});
 btn.addEventListener('click',function(){
  var watch='https://www.youtube.com/watch?v='+encodeURIComponent(d.id);
  /* Opened from disk (file://): YouTube refuses embeds, so open the video in a new tab instead */
  if(location.protocol==='file:'){window.open(watch,'_blank','noopener');return}
  var f=document.createElement('iframe');
  f.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(d.id)+'?autoplay=1&rel=0&playsinline=1';
  f.title=title+' walkthrough';
  f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
  f.setAttribute('allowfullscreen','');
  f.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
  f.width='100%';f.height='100%';
  f.addEventListener('load',function(){f.focus()},{once:true});
  box.replaceChild(f,btn);
 });
});
})();

/* Email buttons: desktop copies the address (toast confirms it); touch devices open the mail app. The small copy icon always copies. */
(function(){
var EMAIL='mujahidtufail726@gmail.com',CHECK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
var toast=document.getElementById('toast'),msg=document.getElementById('toast-msg'),tt=null;
function showToast(text){
 msg.textContent=text;toast.classList.add('show');clearTimeout(tt);
 tt=setTimeout(function(){toast.classList.remove('show')},3000);
}
/* Keep the toast up while it is hovered or has keyboard focus (so "Open mail app" stays reachable) */
toast.addEventListener('mouseenter',function(){clearTimeout(tt)});
toast.addEventListener('focusin',function(){clearTimeout(tt)});
['mouseleave','focusout'].forEach(function(ev){toast.addEventListener(ev,function(){clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('show')},3000)})});
function legacyCopy(){
 var x=document.createElement('textarea');x.value=EMAIL;x.setAttribute('readonly','');x.setAttribute('aria-hidden','true');
 x.style.cssText='position:fixed;top:0;left:0;opacity:0;pointer-events:none';
 document.body.appendChild(x);x.select();x.setSelectionRange(0,EMAIL.length);
 var ok=false;try{ok=document.execCommand('copy')}catch(e){}
 document.body.removeChild(x);return ok;
}
function copyEmail(){
 if(navigator.clipboard&&navigator.clipboard.writeText){
  return navigator.clipboard.writeText(EMAIL).then(function(){return true},function(){return legacyCopy()});
 }
 return Promise.resolve(legacyCopy());
}
function selectEmailText(){
 var t=document.querySelector('.js-email-text');if(!t)return;
 var r=document.createRange();r.selectNodeContents(t);var s=getSelection();s.removeAllRanges();s.addRange(r);
}
var timers=new WeakMap();
/* Phones and tablets (touch, no hover): open the mail app. Desktop (mouse): copy the address. */
function isTouch(){return matchMedia('(hover: none) and (pointer: coarse)').matches}
function handle(el,onOk,onReset){
 el.addEventListener('click',function(){
  if(isTouch()){location.href='mailto:'+EMAIL;return}
  copyEmail().then(function(ok){
   if(!ok){selectEmailText();showToast('Press Ctrl+C to copy');return}
   showToast('Email copied: '+EMAIL);
   onOk();clearTimeout(timers.get(el));
   timers.set(el,setTimeout(onReset,2000));
  });
 });
}
document.querySelectorAll('.js-email').forEach(function(b){
 var label=b.textContent,row=b.parentNode,held=false;
 handle(b,function(){
  /* If the buttons share one row, keep them on it while the longer label shows (no vertical jump) */
  if(!held&&[].every.call(row.children,function(c){return c.offsetTop===b.offsetTop})){row.classList.add('hold-row');held=true}
  b.classList.add('is-copied');b.textContent='Email copied \u2713';
 },function(){
  b.classList.remove('is-copied');b.textContent=label;
  if(held){row.classList.remove('hold-row');held=false}
 });
});
var big=document.querySelector('.js-email-text');
if(big){
 var icon=big.parentNode.querySelector('.copy'),orig=icon&&icon.innerHTML,ol=icon&&icon.getAttribute('aria-label');
 handle(big,function(){if(icon){icon.innerHTML=CHECK;icon.setAttribute('aria-label','Copied')}},function(){if(icon){icon.innerHTML=orig;icon.setAttribute('aria-label',ol)}});
}
})();
