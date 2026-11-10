(()=>{'use strict';
const root=document.querySelector('#testimonial-content');if(!root)return;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let modal=null,lightImgs=[],lightIndex=0,touchX=0,touchY=0;
function ensureModal(){
 if(modal)return;
 modal=document.createElement('div');modal.className='image-lightbox';
 modal.innerHTML='<div class="lightbox-panel" role="dialog" aria-modal="true" aria-label="Preview foto testimoni"><button class="lightbox-close" type="button" aria-label="Tutup">×</button><img alt="Preview foto testimoni"><div class="lightbox-count" aria-live="polite"></div></div>';
 document.body.append(modal);
 modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('.lightbox-close'))closeLight()});
 document.addEventListener('keydown',e=>{if(!modal?.classList.contains('open'))return;if(e.key==='Escape')closeLight();if(e.key==='ArrowRight')stepLight(1);if(e.key==='ArrowLeft')stepLight(-1)});
 const panel=modal.querySelector('.lightbox-panel');
 panel.addEventListener('touchstart',e=>{touchX=e.touches[0].clientX;touchY=e.touches[0].clientY},{passive:true});
 panel.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))stepLight(dx<0?1:-1)},{passive:true});
}
function paintLight(){if(!modal||!lightImgs.length)return;modal.querySelector('img').src=lightImgs[lightIndex];modal.querySelector('.lightbox-count').textContent=(lightIndex+1)+' / '+lightImgs.length}
function stepLight(dir){if(lightImgs.length<2)return;lightIndex=(lightIndex+dir+lightImgs.length)%lightImgs.length;paintLight()}
function closeLight(){modal?.classList.remove('open')}
function openLight(imgs){if(!imgs.length)return;ensureModal();lightImgs=imgs;lightIndex=0;paintLight();modal.classList.add('open')}
function setupCarousel(box,imgs){
 if(imgs.length<2)return;
 let index=0,timer=null,startX=0,startY=0;
 const image=box.querySelector('.testimonial-slide-image'),count=box.querySelector('.testimonial-slide-count');
 function show(next,dir){dir=dir||1;index=(next+imgs.length)%imgs.length;const previous=image.cloneNode();previous.removeAttribute('loading');previous.classList.add('testimonial-slide-previous');previous.alt='';previous.setAttribute('aria-hidden','true');box.append(previous);image.src=imgs[index];image.alt='Foto testimoni '+(index+1);count.textContent=(index+1)+' / '+imgs.length;image.onload=()=>{if(image.naturalWidth&&image.naturalHeight)box.style.aspectRatio=image.naturalWidth+' / '+image.naturalHeight};if(image.animate){image.animate([{transform:'translateX('+(dir*42)+'px)',opacity:.65},{transform:'translateX(0)',opacity:1}],{duration:260,easing:'cubic-bezier(.22,.75,.25,1)'});previous.animate([{transform:'translateX(0)',opacity:1},{transform:'translateX('+(-dir*42)+'px)',opacity:0}],{duration:260,easing:'cubic-bezier(.22,.75,.25,1)'}).onfinish=()=>previous.remove()}else previous.remove()}
 function stop(){if(timer)clearInterval(timer);timer=null}
 function start(){stop();if(!document.hidden)timer=setInterval(()=>show(index+1,1),5000)}
 box.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;startY=e.touches[0].clientY;stop()},{passive:true});
 box.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))show(index+(dx<0?1:-1),dx<0?1:-1);start()},{passive:true});
 box.addEventListener('mouseenter',stop);box.addEventListener('mouseleave',start);
 document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
 start();
}
(async()=>{
 try{
  const rows=await KyvoraData.listTestimonials();if(!rows.length)return;
  document.querySelector('.testimonial-empty')?.remove();
  root.innerHTML='<div class="testimonial-grid">'+rows.map((x,i)=>{
   const imgs=Array.isArray(x.images)?x.images.filter(Boolean):[];
   const gallery=imgs.length?'<div class="testimonial-carousel" data-gallery="'+i+'"><img class="testimonial-slide-image" src="'+esc(imgs[0])+'" alt="Foto testimoni 1" loading="lazy">'+(imgs.length>1?'<span class="testimonial-slide-count" aria-live="polite">1 / '+imgs.length+'</span>':'')+'</div><button class="preview-images testimonial-preview" type="button" data-preview="'+i+'">Preview gambar</button>':'';
   return '<article class="testimonial-card"><div class="testimonial-photos">'+gallery+'</div><div class="testimonial-card-copy"><small>'+(x.date?esc(x.date):'CUSTOMER STORY')+'</small><h2>'+esc(x.title)+'</h2><p>'+esc(x.description||'')+'</p></div></article>';
  }).join('')+'</div>';
  root.querySelectorAll('[data-gallery]').forEach(box=>{const row=rows[Number(box.dataset.gallery)],imgs=Array.isArray(row?.images)?row.images.filter(Boolean):[];setupCarousel(box,imgs)});
  root.querySelectorAll('[data-preview]').forEach(btn=>btn.addEventListener('click',()=>{const row=rows[Number(btn.dataset.preview)];openLight(Array.isArray(row?.images)?row.images.filter(Boolean):[])}));
 }catch(e){root.innerHTML='<p class="testimonial-intro">Testimoni belum dapat dimuat. Silakan coba beberapa saat lagi.</p>';console.error(e)}
})();
})();