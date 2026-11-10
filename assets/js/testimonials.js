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
(async()=>{
 try{
  const rows=await KyvoraData.listTestimonials();if(!rows.length)return;
  document.querySelector('.testimonial-empty')?.remove();
  root.innerHTML='<div class="testimonial-grid">'+rows.map((x,i)=>{
   const imgs=Array.isArray(x.images)?x.images.filter(Boolean):[];
   return '<article class="testimonial-card"><div class="testimonial-photos">'+imgs.map((src,j)=>'<img src="'+esc(src)+'" alt="Foto testimoni '+(j+1)+'" loading="lazy">').join('')+(imgs.length?'<button class="preview-images testimonial-preview" type="button" data-preview="'+i+'">Preview gambar</button>':'')+'</div><div class="testimonial-card-copy"><small>'+(x.date?esc(x.date):'CUSTOMER STORY')+'</small><h2>'+esc(x.title)+'</h2><p>'+esc(x.description||'')+'</p></div></article>';
  }).join('')+'</div>';
  root.querySelectorAll('[data-preview]').forEach(btn=>btn.addEventListener('click',()=>{const row=rows[Number(btn.dataset.preview)];openLight(Array.isArray(row?.images)?row.images.filter(Boolean):[])}));
 }catch(e){root.innerHTML='<p class="testimonial-intro">Testimoni belum dapat dimuat. Silakan coba beberapa saat lagi.</p>';console.error(e)}
})();
})();