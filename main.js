// ================= DATA (ganti dengan datamu) =================
const DATA = {
  projects:[
    {t:"StudyTrack X",d:"A student productivity platform for learning, schedules, tasks, and personal progress.",img:"assets/projects/1.jpg",type:"DIGITAL PROJECT",tools:"HTML · CSS · JAVASCRIPT",url:""},
    {t:"Gallagher's Studio",d:"A cinematic personal portfolio showcasing digital work and creative identity.",img:"assets/projects/2.jpg",type:"PERSONAL PORTFOLIO",tools:"HTML · CSS · JAVASCRIPT",url:""},
    {t:"STADIUM AI",d:"An AI-versus-AI football match simulation concept.",img:"assets/projects/3.jpg",type:"GAME PROTOTYPE",tools:"ANDROID · GAME CONCEPT",url:""}
  ],
  designs:[
    {t:"Portfolio UI",d:"A cinematic portfolio interface concept.",img:"assets/designs/1.jpg",type:"WEB UI DESIGN",tools:"LAYOUT · TYPOGRAPHY"},
    {t:"Dashboard UI",d:"A student dashboard interface concept.",img:"assets/designs/2.jpg",type:"DASHBOARD DESIGN",tools:"UI · UX"},
    {t:"Game UI",d:"A football simulation interface concept.",img:"assets/designs/3.jpg",type:"GAME INTERFACE",tools:"UI · VISUAL SYSTEM"}
  ],
  visuals:[
    {t:"Automotive Emblem",d:"A minimal automotive-inspired emblem design.",img:"assets/visuals/1.jpg",type:"LOGO DESIGN",tools:"GRAPHIC · IDENTITY"},
    {t:"Suit Artwork",d:"A superhero suit design exploration.",img:"assets/visuals/2.jpg",type:"CHARACTER ARTWORK",tools:"DIGITAL ART"},
    {t:"Digital Artwork",d:"A minimalist digital visual exploration.",img:"assets/visuals/3.jpg",type:"DIGITAL ARTWORK",tools:"COMPOSITION · COLOR"}
  ]
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

// ---------- Spider-Man reveal: smooth pointer + touch morph ---------- 
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
    currentX+=dx*.24;currentY+=dy*.24;
    photo.style.setProperty("--reveal-x",currentX+"px");
    photo.style.setProperty("--reveal-y",currentY+"px");
    if(Math.abs(dx)>.18||Math.abs(dy)>.18)raf=requestAnimationFrame(track);
    else raf=0;
  }
  function hide(){
    active=false;
    photo.classList.remove("is-revealing");
  }
  photo.addEventListener("pointermove",e=>{
    if(e.pointerType==="mouse"||active)setTarget(e);
  });
  photo.addEventListener("pointerdown",setTarget);
  photo.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse")hide()});
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

// ---------- Portfolio folders: counts only; artwork is generated with CSS ----------
["projects","designs","visuals"].forEach(k=>{const count=$("#n-"+k);if(count)count.textContent=DATA[k].length;});
const $lb=$("#lb");
// Detail viewer: click card to inspect artwork and project information.
(function(){
  const panel=$lb.querySelector("div");
  if(!panel)return;
  const close=document.createElement("button");
  close.type="button";close.className="lb-close";close.setAttribute("aria-label","Close preview");close.textContent="×";
  const meta=document.createElement("div");meta.className="lb-meta";
  const type=document.createElement("span");type.className="lb-type";
  const tools=document.createElement("span");tools.className="lb-tools";
  panel.append(close,meta);
  meta.append(type,tools);
  close.addEventListener("click",e=>{e.stopPropagation();closeLb()});
  $lb.addEventListener("click",e=>{if(e.target===$lb)closeLb()});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeLb()});
  window.stxOpenPortfolioDetail=function(item){
    const art=panel.querySelector(".lb-art"),caption=panel.querySelector("p");
    art.className="lb-art "+(item.type.includes("DESIGN")?"art-design":item.type.includes("ARTWORK")||item.type.includes("LOGO")?"art-visual":"art-project");
    caption.textContent=item.t+" — "+item.d;
    type.textContent=item.type||"CREATIVE WORK";
    tools.textContent=item.tools||"";
    $lb.classList.add("on");document.body.classList.add("portfolio-modal-open");
    close.focus();
  };
})();
function openLb(item){window.stxOpenPortfolioDetail?.(item)}
function closeLb(){$lb.classList.remove("on");document.body.classList.remove("portfolio-modal-open")}
let cur="projects";
function showTab(k){
  if(!DATA[k])return;
  cur=k;
  $$("#tabs button").forEach(b=>{const active=b.dataset.tab===k;b.classList.toggle("on",active);b.setAttribute("aria-selected",String(active))});
  const box=$("#stageP"),list=DATA[k],total=list.length;
  const names={projects:"Digital Projects",designs:"Interface & Experience Design",visuals:"Visual Explorations"};
  const descriptions={projects:"Websites, applications, and digital products built from ideas.",designs:"Website layouts, dashboards, and interface concepts shaped with intention.",visuals:"Graphic works, identities, posters, and experiments in visual storytelling."};
  const cards=list.map((item,n)=>`<article class="work-card" tabindex="0" role="button" aria-label="Open ${esc(item.t)}" data-i="${n}">
    <div class="work-image ${k==="designs"?"art-design":k==="visuals"?"art-visual":"art-project"}"><span class="art-orbit"></span><span class="art-window"><i></i><i></i><i></i><b></b></span><span class="art-caption">${esc(item.type||"CREATIVE WORK")}</span><span class="work-index">0${n+1}</span><span class="work-open" aria-hidden="true">↗</span></div>
    <div class="work-meta"><div><span class="work-type">${esc(item.type||"CREATIVE WORK")}</span><h3>${esc(item.t)}</h3><p>${esc(item.d)}</p></div><span class="work-arrow">↗</span></div>
  </article>`).join("");
  const featured=k==="projects"&&list.length?`<button class="featured-work" type="button" data-feature="0"><span class="featured-label">FEATURED PROJECT <i>✳</i></span><span class="featured-preview art-project"><span class="art-orbit"></span><span class="art-window"><i></i><i></i><i></i><b></b></span><span class="featured-number">01</span></span><span class="featured-bottom"><span><small>SPOTLIGHT / 2026</small><strong>${esc(list[0].t)}</strong><em>${esc(list[0].d)}</em></span><b>Explore ↗</b></span></button>`:"";
  box.innerHTML=`<div class="portfolio-category"><div class="category-copy"><div><span class="category-kicker">0${["projects","designs","visuals"].indexOf(k)+1} / COLLECTION</span><h2>${names[k]}</h2><p>${descriptions[k]}</p></div><div class="category-total"><strong>${String(total).padStart(2,"0")}</strong><span>ITEMS</span></div></div>
  ${featured}
  <div class="work-grid ${k==="visuals"?"visual-grid":""}">${cards}</div>
  <div class="portfolio-endline"><span>GALLAGHER'S STUDIO</span><span>END OF COLLECTION · ${String(total).padStart(2,"0")} WORKS</span></div></div>`;
  const count=$("#portfolioCount");if(count)count.textContent=String(DATA.projects.length+DATA.designs.length+DATA.visuals.length).padStart(2,"0");
  $$(".work-card",box).forEach(card=>{
    const open=()=>openLb(list[Number(card.dataset.i)]);
    card.addEventListener("click",open);
    card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open()}});
  });
  const feature=$(".featured-work",box);
  if(feature)feature.addEventListener("click",()=>openLb(list[0]));
}
$("#tabs").addEventListener("click",e=>{const button=e.target.closest("button[data-tab]");if(button&&$("#tabs").contains(button))showTab(button.dataset.tab)});
$$(".folder").forEach(b=>b.addEventListener("click",()=>{
  showTab(b.dataset.tab);
  const index=panels.findIndex(p=>p.id==="portfolio");
  if(index>=0)viewport.scrollTo({left:index*viewport.clientWidth,behavior:"smooth"});
}));
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


// ---------- Stage 3: cinematic reveal when sections enter view ----------
(function(){
  const root=document.documentElement;
  const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const groups=[
    ["#about",[".sec-title",".about-grid",".tl>div",".folders"]],
    ["#portfolio",[".sec-title",".tabs","#stageP"]],
    ["#contact",[".cols>.stack","footer"]]
  ];
  const targets=[];
  groups.forEach(([sectionSelector,selectors])=>{
    const section=$(sectionSelector);
    if(!section)return;
    selectors.forEach(selector=>{
      $$(selector,section).forEach(el=>{
        if(!el.classList.contains("cinematic-reveal")){
          el.classList.add("cinematic-reveal");
          targets.push({el,root:section});
        }
      });
    });
  });
  if(!targets.length)return;
  root.classList.add("cinematic-ready");
  if(reduce||!("IntersectionObserver" in window)){
    targets.forEach(({el})=>el.classList.add("is-visible"));
    return;
  }
  const observers=new Map();
  groups.forEach(([sectionSelector])=>{
    const section=$(sectionSelector);
    if(!section)return;
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },{root:section,threshold:.08,rootMargin:"0px 0px -6% 0px"});
    observers.set(section,io);
  });
  targets.forEach(({el,root:section},index)=>{
    el.style.setProperty("--reveal-delay",Math.min(index%4,3)*75+"ms");
    observers.get(section)?.observe(el);
  });
})();


// ---------- Stage 4: tactile feedback, media arrival & keyboard activation ----------
(function(){
  const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rippleTargets=".btn,.arr,.tabs button,.card,.pol";
  document.addEventListener("pointerdown",e=>{
    if(reduce)return;
    const el=e.target.closest(rippleTargets);
    if(!el)return;
    const rect=el.getBoundingClientRect();
    const ripple=document.createElement("span");
    const size=Math.ceil(Math.hypot(rect.width,rect.height)*2);
    ripple.className="stx-ripple";
    ripple.style.left=(e.clientX-rect.left)+"px";
    ripple.style.top=(e.clientY-rect.top)+"px";
    ripple.style.setProperty("--ripple-scale",String(size/12));
    el.appendChild(ripple);
    ripple.addEventListener("animationend",()=>ripple.remove(),{once:true});
  },{passive:true});

  // Beri transisi ringan saat gambar berhasil dimuat.
  function markImage(img){
    if(img&&img.naturalWidth>0)img.classList.add("media-arrived");
  }
  document.addEventListener("load",e=>{
    if(e.target instanceof HTMLImageElement)markImage(e.target);
  },true);
  document.querySelectorAll("img").forEach(img=>{
    if(img.complete)markImage(img);
  });

  // Elemen kartu dapat dibuka dengan Enter atau Space, bukan hanya pointer.
  document.addEventListener("keydown",e=>{
    if(e.key!=="Enter"&&e.key!==" ")return;
    const item=e.target.closest(".card[tabindex],.pol[tabindex]");
    if(!item)return;
    e.preventDefault();
    item.click();
  });
})();


// ---------- STAGE 5: real pointer + touch interaction ----------
(function(){
  const root=document.documentElement;
  const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine=window.matchMedia&&window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  const targets=".btn,.arr,.tabs button,.card,.folder,.pol,nav a,.find a";
  if(fine&&!reduce)root.classList.add("has-interactive-pointer");

  // Spotlight follows the actual pointer, including dynamically rendered cards.
  document.addEventListener("pointermove",e=>{
    if(e.pointerType!=="mouse"||reduce)return;
    const el=e.target.closest(targets);
    if(!el)return;
    const r=el.getBoundingClientRect();
    el.style.setProperty("--ix",(e.clientX-r.left)+"px");
    el.style.setProperty("--iy",(e.clientY-r.top)+"px");
  },{passive:true});

  // Touch devices get a visible, temporary response instead of hover-only effects.
  let activeTimer=0;
  function activate(el,x,y){
    if(!el)return;
    const r=el.getBoundingClientRect();
    el.style.setProperty("--ix",(x-r.left)+"px");
    el.style.setProperty("--iy",(y-r.top)+"px");
    el.classList.remove("touch-active");
    void el.offsetWidth;
    el.classList.add("touch-active");
    clearTimeout(activeTimer);
    activeTimer=setTimeout(()=>el.classList.remove("touch-active"),720);
  }
  document.addEventListener("pointerdown",e=>{
    const el=e.target.closest(targets);
    if(!el)return;
    activate(el,e.clientX,e.clientY);
  },{passive:true});

  // Keyboard focus receives the same spotlight state for accessible navigation.
  document.addEventListener("focusin",e=>{
    const el=e.target.closest(targets);
    if(!el)return;
    el.style.setProperty("--ix","50%");
    el.style.setProperty("--iy","50%");
  });
})();


/* ===== GALLAGHER'S STUDIO · ROTATING HOME MOTIVATION ===== */
(function(){
  const target=document.getElementById("heroQuote");
  if(!target)return;
  const quotes=["Every great creation begins with a single idea.","Dream it. Build it. Make it real.","Small steps can lead to extraordinary places.","Keep creating, even when progress feels quiet.","Your ideas deserve the chance to exist.","Great things take time, patience, and practice.","Turn curiosity into something meaningful.","Progress begins when you decide to begin.","Create with purpose. Grow with passion.","Let your imagination lead the way.","Every expert was once a beginner.","Be proud of how far your ideas have brought you.","Make today a small step toward something bigger.","Learn something. Build something. Repeat.","Consistency gives creativity a direction.","Your next idea could change everything.","Stay curious. Stay creative. Stay moving.","Build the future one line at a time.","Don't wait for perfect. Start with possible.","Every challenge carries a lesson worth learning.","Make room for ideas that inspire you.","Keep going; meaningful work takes time.","Creativity grows when curiosity stays alive.","Think boldly. Start simply. Improve continuously.","Let every project teach you something new.","Your pace is still progress.","Make your passion visible through your work.","One focused step is better than endless waiting.","Explore more. Imagine more. Create more.","Turn what you learn into what you build.","Be the reason your idea becomes reality.","Small details can make a big difference.","Build skills today that your future self will thank you for.","Every attempt brings you closer to understanding.","Give your best to the process, not just the result.","Let curiosity open doors you haven't seen yet.","Stay patient with the process and ambitious with the vision.","Make mistakes part of your learning journey.","Your creativity has room to grow.","Start where you are. Use what you have. Keep learning.","Great ideas become real through consistent action.","Keep your vision clear and your mind open.","Create something that reflects what you believe in.","Be willing to learn what you don't know yet.","Your journey is built one decision at a time.","Think beyond limits, then take the first step.","Make every experiment an opportunity to improve.","Don't just imagine possibilities. Explore them.","Let your work speak through thoughtful details.","Stay focused on becoming better than yesterday.","Every line of code can bring an idea closer.","Technology is a tool; imagination gives it direction.","Keep building, keep learning, keep discovering.","Your future is shaped by what you practice today.","Be brave enough to try a different approach.","Turn questions into discoveries.","Let passion begin the journey and discipline continue it.","Create with intention, refine with patience.","Even the smallest breakthrough matters.","Make your curiosity your greatest advantage.","Keep exploring beyond what you already know.","Every new skill adds another possibility.","Good things grow from consistent effort.","Your ideas are worth developing.","Take the first step; clarity often follows action.","Make learning a lifelong adventure.","Build something useful. Make it meaningful.","Don't fear the blank page; see its possibilities.","Let each project become proof of your growth.","Stay open to feedback and committed to progress.","One day, today's practice will become your strength.","Make creativity a habit, not a rare moment.","Focus on the craft and let progress follow.","Every new perspective can spark a new idea.","Keep your standards high and your steps steady.","Create beyond expectations, one detail at a time.","Your journey doesn't need to look like anyone else's.","Find inspiration, then make it your own.","Turn imagination into action.","Keep showing up for the things you want to build.","Learn deeply. Create freely. Improve often.","Every project starts with the courage to begin.","Let challenges sharpen your skills.","Make progress your priority, not perfection.","Think clearly. Design thoughtfully. Build confidently.","Give your ideas time to become something great.","Keep the vision alive through daily effort.","Small improvements create lasting impact.","Be curious about what you can become.","Create today what you once only imagined.","Stay determined, even when the path is unfamiliar.","Let your work be a reflection of your growth.","Every finished project begins with an unfinished idea.","Choose progress, then choose it again tomorrow.","Your creativity is a journey, not a destination.","Keep learning until the impossible feels approachable.","Build with curiosity and finish with purpose.","Make something meaningful from what inspires you.","There's always another idea waiting to be explored.","Imagine boldly. Create patiently. Keep moving forward."];
  let index=0;
  const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.textContent=quotes[index];
  window.setInterval(()=>{
    index=(index+1)%quotes.length;
    if(reduced){target.textContent=quotes[index];return;}
    target.classList.add("is-changing");
    window.setTimeout(()=>{
      target.textContent=quotes[index];
      target.classList.remove("is-changing");
    },360);
  },180000);
})();
