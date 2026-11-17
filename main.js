// ================= DATA (ganti dengan datamu) =================
const DATA = {
  projects:[1,2,3].map(i=>({t:"Proyek "+i,d:"Deskripsi singkat proyek.",img:`assets/projects/${i}.jpg`,url:""})),
  certs:[1,2,3].map(i=>({t:"Sertifikat "+i,d:"Penyelenggara, 2026",img:`assets/certs/${i}.jpg`})),
  awards:[1,2,3,4,5].map(i=>({t:"Penghargaan "+i,d:"Juara / Finalis",img:`assets/awards/${i}.jpg`}))
};
const SOCIAL_NOTE="";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

// ---------- Latar garis topografi (dibuat otomatis) ----------
function topo(stroke){
  const W=1200,H=900;let d="";
  for(let i=0;i<26;i++){let p="";const y0=-60+i*38;
    for(let x=0;x<=W;x+=30){const y=y0+Math.sin(x/170+i*.55)*34+Math.sin(x/70+i*1.3)*10+Math.cos(x/320-i*.2)*40;p+=(x?"L":"M")+x+" "+y.toFixed(1)}
    d+=`<path d="${p}"/>`}
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}' fill='none' stroke='${stroke}' stroke-width='1.2'>${d}</svg>`)}")`;
}
document.documentElement.style.setProperty("--topo-d",topo("#16264d"));
document.documentElement.style.setProperty("--topo-l",topo("#d3d9e6"));
 
// ---------- Cek aset gambar (hero, person, about) ----------
[["assets/bg/poster.jpg","has-hero"],["assets/images/hero-person.png","has-person"],["assets/my-transparent.png","has-about"]].forEach(([src,cls])=>{
  const im=new Image();im.onload=()=>document.body.classList.add(cls);im.src=src;
});

// ---------- Video latar hero (soft crossfade saat mengulang) ----------
(function(){
  const first=$("#heroVid");if(!first)return;
  const stage=first.closest(".stage");
  const FADE_MS=650;
  const TRIGGER_SEC=.78;
  let active=first,standby=null,fading=false,raf=0;

  first.muted=true;
  const ok=()=>document.body.classList.add("has-vid");
  first.addEventListener("loadeddata",ok);if(first.readyState>=2)ok();

  if(matchMedia("(prefers-reduced-motion:reduce)").matches){
    first.removeAttribute("autoplay");first.pause();return;
  }

  // Video kedua disiapkan di belakang layar untuk memulai dari frame pertama.
  standby=first.cloneNode(true);
  standby.removeAttribute("id");
  standby.removeAttribute("autoplay");
  standby.autoplay=false;
  standby.muted=true;
  standby.preload="auto";
  standby.classList.add("is-hidden");
  standby.pause();
  stage.insertBefore(standby,first.nextSibling);
  standby.load();

  function playActive(){
    if(document.hidden)return;
    const p=active.play();
    if(p&&p.catch)p.catch(()=>{});
  }

  function finishFade(){
    const previous=active;
    active=standby;
    standby=previous;
    previous.pause();
    try{previous.currentTime=0}catch(e){}
    previous.classList.add("is-hidden");
    active.classList.remove("is-hidden");
    fading=false;
  }

  function startFade(){
    if(fading||standby.readyState<2)return;
    fading=true;
    try{standby.currentTime=0}catch(e){}
    const p=standby.play();
    const reveal=()=>{
      standby.classList.remove("is-hidden");
      active.classList.add("is-hidden");
      window.setTimeout(finishFade,FADE_MS);
    };
    if(p&&typeof p.then==="function")p.then(reveal).catch(()=>{fading=false});
    else reveal();
  }

  function checkLoop(){
    if(!document.hidden&&!fading&&!active.paused&&Number.isFinite(active.duration)){
      const remaining=active.duration-active.currentTime;
      if(remaining>0&&remaining<=TRIGGER_SEC&&standby.readyState>=2)startFade();
    }
    raf=requestAnimationFrame(checkLoop);
  }

  playActive();
  if(!raf)raf=requestAnimationFrame(checkLoop);
  ["touchstart","click","scroll"].forEach(e=>addEventListener(e,()=>{if(active.paused)playActive()},{once:true,passive:true}));
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden){active.pause();standby.pause()}
    else playActive();
  });
  new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting)playActive();
    else{active.pause();standby.pause()}
  })).observe(stage);
})();

// ---------- Parallax hero ----------
const layers=document.querySelectorAll(".layer, .vid");
function parallax(){const z=parseFloat(document.documentElement.style.zoom)||1,y=scrollY/z;layers.forEach(l=>l.style.transform=`translateY(${y*l.dataset.s}px)`)}
addEventListener("scroll",parallax,{passive:true});parallax();

// ---------- Navbar: pill, maskot, tema terang/gelap, transisi wipe ----------
const links=$$("nav a"),pill=$("#pill"),mas=$("#mascot");
function movePill(a){pill.style.left=a.offsetLeft+"px";pill.style.width=a.offsetWidth+"px";mas.style.left=(a.offsetLeft+a.offsetWidth/2-12)+"px"}
let lastSec="home";
function wipe(){const w=$("#wipe");w.classList.remove("go");void w.offsetWidth;w.classList.add("go")}
const viewport=$("#pageViewport"),panels=$$("#pageTrack>section");
function activate(id){
  const a=links.find(x=>x.hash==="#"+id);
  if(!a)return;
  links.forEach(x=>x.classList.toggle("on",x===a));movePill(a);
  document.body.classList.toggle("light",id==="portfolio"||id==="contact");
  if(id==="portfolio"&&lastSec==="about")wipe();
  lastSec=id;
}
function goTo(id){
  const index=panels.findIndex(p=>p.id===id);
  if(index<0)return;
  viewport.scrollTo({left:index*viewport.clientWidth,behavior:"smooth"});
  activate(id);
}
links.forEach(a=>a.addEventListener("click",e=>{
  const id=a.hash.slice(1);
  if(panels.some(p=>p.id===id)){e.preventDefault();goTo(id)}
}));
document.addEventListener("click",e=>{
  const a=e.target.closest('a[href^="#"]');
  if(!a||a.closest("nav"))return;
  const id=a.getAttribute("href").slice(1);
  if(panels.some(p=>p.id===id)){e.preventDefault();goTo(id)}
});
// ---------- Swipe horizontal khusus layar sentuh ---------- 
let swipeStart=null;
viewport.addEventListener("touchstart",e=>{
  if(e.touches.length!==1){swipeStart=null;return}
  swipeStart={x:e.touches[0].clientX,y:e.touches[0].clientY};
},{passive:true});
viewport.addEventListener("touchend",e=>{
  if(!swipeStart||!e.changedTouches.length)return;
  const dx=e.changedTouches[0].clientX-swipeStart.x;
  const dy=e.changedTouches[0].clientY-swipeStart.y;
  swipeStart=null;
  if(Math.abs(dx)<48||Math.abs(dx)<Math.abs(dy)*1.2)return;
  const current=Math.max(0,Math.min(panels.length-1,Math.round(viewport.scrollLeft/viewport.clientWidth)));
  const next=Math.max(0,Math.min(panels.length-1,current+(dx<0?1:-1)));
  if(next!==current)goTo(panels[next].id);
},{passive:true});
let scrollTick=0;
viewport.addEventListener("scroll",()=>{
  if(scrollTick)return;
  scrollTick=requestAnimationFrame(()=>{
    scrollTick=0;
    const index=Math.max(0,Math.min(panels.length-1,Math.round(viewport.scrollLeft/viewport.clientWidth)));
    activate(panels[index].id);
  });
},{passive:true});
addEventListener("load",()=>{movePill($("nav a.on"));activate("home")});
addEventListener("resize",()=>{
  const active=$("nav a.on");movePill(active);
  const index=panels.findIndex(p=>"#"+p.id===active.hash);
  if(index>=0)viewport.scrollLeft=index*viewport.clientWidth;
});

// ---------- Spider-Man reveal: pointer tracking yang lebih halus ---------- 
(function(){
  const photo=$("#spiderReveal");
  if(!photo)return;
  let targetX=0,targetY=0,currentX=0,currentY=0,raf=0,active=false;
  function setTarget(e){
    const r=photo.getBoundingClientRect();
    targetX=Math.max(0,Math.min(r.width,e.clientX-r.left));
    targetY=Math.max(0,Math.min(r.height,e.clientY-r.top));
    if(!active){
      currentX=targetX;currentY=targetY;active=true;
      photo.classList.add("is-revealing");
    }
    if(!raf)raf=requestAnimationFrame(track);
  }
  function track(){
    const dx=targetX-currentX,dy=targetY-currentY;
    currentX+=dx*.38;currentY+=dy*.38;
    photo.style.setProperty("--reveal-x",currentX+"px");
    photo.style.setProperty("--reveal-y",currentY+"px");
    if(Math.abs(dx)>.25||Math.abs(dy)>.25)raf=requestAnimationFrame(track);
    else raf=0;
  }
  function hide(){
    active=false;photo.classList.remove("is-revealing");
  }
  photo.addEventListener("pointermove",setTarget);
  photo.addEventListener("pointerdown",setTarget);
  photo.addEventListener("pointerleave",hide);
  photo.addEventListener("pointerup",e=>{if(e.pointerType!=="mouse")hide()});
  photo.addEventListener("pointercancel",hide);
})();

// ---------- Timeline: 3 item tampil, sisanya di-scroll + efek fokus ----------
const SHOW=3;
function focusList(l){
  const it=$$(".item",l),st=l.scrollTop;let k=0,best=1e9;
  it.forEach((x,i)=>{const d=Math.abs(x.offsetTop-it[0].offsetTop-st);if(d<best){best=d;k=i}});
  it.forEach((x,i)=>{const d=Math.abs(i-k);x.classList.toggle("act",d===0);x.style.opacity=d===0?1:d===1?.82:.68});
}
function fitLists(){
  $$(".tl .list").forEach(l=>{
    const it=$$(".item",l);
    if(it.length>SHOW){
      l.style.height=(it[SHOW].offsetTop-it[0].offsetTop)+"px";
    }else l.style.height="auto";
    focusList(l);
  });
}
$(".tl .list").forEach(l=>{
  l.addEventListener("scroll",()=>requestAnimationFrame(()=>focusList(l)),{passive:true});
  l.addEventListener("click",e=>{
    const item=e.target.closest(".item");
    if(!item||!l.contains(item))return;
    const items=$(".item",l);
    const first=items[0];
    const top=item.offsetTop-first.offsetTop;
    l.scrollTo({top,behavior:"smooth"});
    items.forEach(x=>{
      const active=x===item;
      x.classList.toggle("act",active);
      x.style.opacity=active?1:.68;
    });
  });
});
fitLists();addEventListener("load",fitLists);addEventListener("resize",fitLists);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitLists);

// ---------- Folder & Portfolio ----------
["projects","certs","awards"].forEach(k=>{
  $("#n-"+k).textContent=DATA[k].length;
  const im=document.createElement("img");im.src=DATA[k][0].img;im.alt="";im.onerror=()=>im.remove();$("#pk-"+k).appendChild(im);
});
const ROT=[[6,34,-6],[36,2,4],[64,30,7],[18,56,-3],[50,58,5]];
function openLb(i){$("#lb img").src=i.img;$("#lb img").onerror=()=>{$("#lb img").removeAttribute("src")};$("#lb p").textContent=i.t;$("#lb").classList.add("on")}
$("#lb").addEventListener("click",()=>$("#lb").classList.remove("on"));
let cur="projects";
function showTab(k){
  cur=k;$$("#tabs button").forEach(b=>b.classList.toggle("on",b.dataset.tab===k));
  const box=$("#stageP"),list=DATA[k],label=k==="certs"?"View Certificate":k==="projects"?"View Project":"View Photo";
  if(k==="awards"){
    box.innerHTML='<div class="collage">'+list.map((i,n)=>{const r=ROT[n%5];return `<div class="pol" data-i="${n}" style="left:${r[0]}%;top:${r[1]}%;transform:rotate(${r[2]}deg)"><div class="ph">Foto<img src="${i.img}" alt="${esc(i.t)}" onerror="this.remove()"></div></div>`}).join("")+'</div>';
    $$(".pol",box).forEach(p=>p.addEventListener("click",()=>openLb(list[p.dataset.i])));
  }else{
    box.innerHTML='<div class="rail-wrap"><button class="arr p" aria-label="Sebelumnya">‹</button><div class="rail" id="rail">'+list.map((i,n)=>`<article class="card" tabindex="0" data-i="${n}"><div class="ph">Gambar<img src="${i.img}" alt="${esc(i.t)}" onerror="this.remove()"><div class="ov"><span>${label}</span></div></div><div class="b"><strong>${esc(i.t)}</strong><p>${esc(i.d)}</p></div></article>`).join("")+'</div><button class="arr n" aria-label="Berikutnya">›</button></div>';
    const r=$("#rail");$(".arr.p",box).onclick=()=>r.scrollBy({left:-320,behavior:"smooth"});$(".arr.n",box).onclick=()=>r.scrollBy({left:320,behavior:"smooth"});
    $$(".card",box).forEach(c=>c.addEventListener("click",()=>{const i=list[c.dataset.i];i.url?window.open(i.url,"_blank","noopener"):openLb(i)}));
  }
}
$$("#tabs [data-tab]").forEach(b=>b.addEventListener("click",()=>showTab(b.dataset.tab)));
$$(".folder").forEach(b=>b.addEventListener("click",()=>{showTab(b.dataset.tab);$("#portfolio").scrollIntoView({behavior:"smooth"})}));
showTab("projects");

// ---------- Kontak & komentar (sementara disimpan di browser) ----------
const KEY="portfolio-komentar-v2";
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){return[]}}
function renderC(){
  const a=load();$("#cn").textContent=a.length;
  $("#cmts").innerHTML=a.length?a.map(c=>`<div class="c"><div class="av">${c.p?`<img src="${c.p}" alt="">`:esc(c.n.slice(0,1).toUpperCase())}</div><div class="t"><div><b>${esc(c.n)}</b><small>${esc(c.d)}</small></div><p>${esc(c.c)}</p></div></div>`).join(""):'<p class="s" style="color:#8a95ad;font-size:.85rem">Belum ada komentar. Jadilah yang pertama!</p>';
}
function shrink(file){return new Promise(res=>{
  if(!file||file.size>1048576)return res("");
  const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement("canvas");c.width=c.height=64;const x=c.getContext("2d"),s=Math.min(im.width,im.height);x.drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,64,64);res(c.toDataURL("image/jpeg",.8))};im.onerror=()=>res("");im.src=fr.result};fr.onerror=()=>res("");fr.readAsDataURL(file)})}
$("#cmtForm input[type=file]").addEventListener("change",e=>{const f=e.target.files[0];$("#fname").textContent=f?(f.size>1048576?"File lebih dari 1MB":f.name):"Choose Profile Photo"});
$("#cmtForm").addEventListener("submit",async e=>{
  e.preventDefault();const f=e.target,p=await shrink(f.p.files[0]),a=load();
  a.unshift({n:f.n.value,c:f.c.value,p,d:new Date().toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"})});
  try{localStorage.setItem(KEY,JSON.stringify(a))}catch(x){}
  f.reset();$("#fname").textContent="Choose Profile Photo";renderC();
});
$("#msgForm").addEventListener("submit",e=>{e.preventDefault();alert("Pesan terkirim! (Hubungkan ke EmailJS/Formspree agar masuk ke emailmu.)");e.target.reset()});
renderC();



// ---------- Global Motion Foundation: pointer feedback + reduced motion ----------
(function(){
  const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("motion-ready");
  if(reduce)return;
  const selector=".btn,.arr,.tabs button,.card,.folder,.pol";
  document.addEventListener("pointermove",e=>{
    if(e.pointerType!=="mouse")return;
    const el=e.target.closest(selector);
    if(!el)return;
    const r=el.getBoundingClientRect();
    el.style.setProperty("--motion-x",(e.clientX-r.left)+"px");
    el.style.setProperty("--motion-y",(e.clientY-r.top)+"px");
  },{passive:true});
})();


// ---------- Stage 2: delegated press feedback + subtle 3D card tilt ----------
(function(){
  const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pressSelector=".btn,.arr,.tabs button,.card,.folder,.pol";
  let pressed=null;
  document.addEventListener("pointerdown",e=>{
    const el=e.target.closest(pressSelector);
    if(!el)return;
    pressed=el;el.classList.add("is-pressed");
  },{passive:true});
  function release(){
    if(pressed){pressed.classList.remove("is-pressed");pressed=null}
  }
  document.addEventListener("pointerup",release,{passive:true});
  document.addEventListener("pointercancel",release,{passive:true});
  document.addEventListener("pointerout",e=>{
    if(pressed&&e.target===pressed&&!pressed.contains(e.relatedTarget))release();
  },{passive:true});
  if(reduce)return;
  const maxTilt=4;
  document.addEventListener("pointermove",e=>{
    if(e.pointerType!=="mouse")return;
    const card=e.target.closest(".card");
    if(!card)return;
    const r=card.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width;
    const py=(e.clientY-r.top)/r.height;
    card.style.setProperty("--tilt-y",((px-.5)*maxTilt*2).toFixed(2)+"deg");
    card.style.setProperty("--tilt-x",((.5-py)*maxTilt*2).toFixed(2)+"deg");
  },{passive:true});
  document.addEventListener("pointerout",e=>{
    const card=e.target.closest(".card");
    if(!card||card.contains(e.relatedTarget))return;
    card.style.setProperty("--tilt-x","0deg");
    card.style.setProperty("--tilt-y","0deg");
  },{passive:true});
})();
