// ================= DATA (ganti dengan datamu) =================
const DATA = {
  projects:[{
    t:"WebMotion",
    type:"WEB DEVELOPMENT · DEVELOPER TOOL",
    d:"I built WebMotion as a focused workspace for previewing websites across screen sizes and recording the details that matter during a manual review.",
    attribution:"A product by Gallagher's Studio",
    live:"https://rifaladitya289.github.io/WebMotion/"
  }],
  designs:[{t:"WebMotion Design",type:"PRODUCT INTERFACE · UI DESIGN",d:"A visual record of the WebMotion interface, its responsive layouts, and the tools that shape the review experience.",attribution:"A product by Gallagher's Studio"}],
  showcase:[]
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
[["assets/bg/poster.jpg","has-hero"],["assets/images/portrait-gw.jpg","has-about"]].forEach(([src,cls])=>{
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

// ---------- Native vertical navigation + animated pill ----------
const links=$$("nav a"),pill=$("#pill"),mas=$("#mascot");
const panels=$$("#pageTrack>section");
function movePill(a){
  if(!a||!pill)return;
  const navRect=$("#nav").getBoundingClientRect();
  const linkRect=a.getBoundingClientRect();
  const left=linkRect.left-navRect.left;
  pill.style.left=left+"px";
  pill.style.width=linkRect.width+"px";
  if(mas)mas.style.left=(left+linkRect.width/2-12)+"px";
}
function refreshPill(){
  const active=links.find(a=>a.classList.contains("on"))||links[0];
  if(active)movePill(active);
}
let lastSec="";
function activate(id){
  const a=links.find(x=>x.hash==="#"+id);
  if(!a)return;
  links.forEach(x=>x.classList.toggle("on",x===a));
  movePill(a);
  lastSec=id;
}
function goTo(id){
  const panel=panels.find(p=>p.id===id);
  if(!panel)return;
  panel.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
  activate(id);
}
links.forEach(a=>{
  a.addEventListener("pointerenter",e=>{
    if(e.pointerType==="mouse")movePill(a);
  });
  a.addEventListener("focus",()=>movePill(a));
  a.addEventListener("click",e=>{
  const id=a.hash.slice(1);
  if(panels.some(p=>p.id===id)){e.preventDefault();goTo(id)}
  });
});
$("#nav").addEventListener("pointerleave",e=>{
  if(e.pointerType==="mouse")refreshPill();
});
$("#nav").addEventListener("focusout",()=>{
  requestAnimationFrame(()=>{
    if(!$("#nav").contains(document.activeElement))refreshPill();
  });
});
document.addEventListener("click",e=>{
  const a=e.target.closest('a[href^="#"]');
  if(!a||a.closest("nav"))return;
  const id=a.getAttribute("href").slice(1);
  if(panels.some(p=>p.id===id)){e.preventDefault();goTo(id)}
});
let navTick=0;
function syncNavigation(){
  if(navTick)return;
  navTick=requestAnimationFrame(()=>{
    navTick=0;
    const marker=window.innerHeight*.38;
    let current=panels[0];
    panels.forEach(panel=>{
      const rect=panel.getBoundingClientRect();
      // Keep the latest section whose top has crossed the navigation marker.
      // This also keeps Contact active near the document's bottom edge.
      if(rect.top<=marker)current=panel;
    });
    if(current)activate(current.id);
  });
}
window.addEventListener("scroll",syncNavigation,{passive:true});
window.addEventListener("resize",()=>{
  refreshPill();
  syncNavigation();
},{passive:true});
window.addEventListener("load",()=>{
  refreshPill();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(refreshPill);
  const requested=(location.hash||"").slice(1);
  if(panels.some(p=>p.id===requested)){
    const target=panels.find(p=>p.id===requested);
    window.scrollTo({top:target.getBoundingClientRect().top+window.scrollY,behavior:"auto"});
    activate(requested);
  }else syncNavigation();
},{once:true});
// ---------- Spider-Man reveal: direct, low-latency pointer + touch ---------- 
(function(){
  const photo=$("#spiderReveal");
  if(!photo)return;
  let latestX=0,latestY=0,raf=0,active=false;
  function setTarget(e){
    const r=photo.getBoundingClientRect();
    // Use the natural left-to-right coordinate; do not mirror the gesture.
    latestX=Math.max(0,Math.min(r.width,e.clientX-r.left));
    latestY=Math.max(0,Math.min(r.height,e.clientY-r.top));
    if(!active){
      active=true;
      photo.classList.add("is-revealing");
    }
    if(!raf)raf=requestAnimationFrame(()=>{
      photo.style.setProperty("--reveal-x",latestX+"px");
      photo.style.setProperty("--reveal-y",latestY+"px");
      raf=0;
    });
  }
  function hide(){
    active=false;
    photo.classList.remove("is-revealing");
  }
  photo.addEventListener("pointermove",e=>{
    if(e.pointerType==="mouse"||active)setTarget(e);
  },{passive:true});
  photo.addEventListener("pointerdown",setTarget,{passive:true});
  photo.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse")hide()});
  photo.addEventListener("pointerup",e=>{if(e.pointerType!=="mouse")hide()});
  photo.addEventListener("pointercancel",hide);
})();
// ---------- Timeline: natural document flow, no nested scrolling ----------
function fitLists(){
  $$(".tl .list").forEach(l=>{
    l.style.height="auto";
    l.style.maxHeight="none";
    l.style.overflow="visible";
    $$(".item",l).forEach(item=>{
      item.classList.remove("act");
      item.style.opacity="1";
    });
  });
}
fitLists();
addEventListener("load",fitLists);
addEventListener("resize",fitLists);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitLists);

// ---------- Folder previews: show real collection content before opening ---------- 
(function(){
  const previews={
    projects:{label:"WEBMOTION",sub:"WEB DEVELOPMENT",screen:"<div class='folder-screen-bar'><i></i><i></i><i></i><b>WebMotion</b></div><div class='folder-screen-body'><span>RESPONSIVE PREVIEW</span><strong>Web<span>Motion</span></strong><div class='folder-device-row'><i></i><i></i><i></i></div><small>DESKTOP · TABLET · MOBILE</small></div>"},
    designs:{label:"WEBMOTION UI",sub:"INTERFACE DESIGN",screen:"<div class='folder-screen-bar'><i></i><i></i><i></i><b>Design system</b></div><div class='folder-screen-body folder-design-screen'><span>PRODUCT INTERFACE</span><strong>Designed<br>to review.</strong><div class='folder-design-lines'><i></i><i></i><i></i></div><small>LAYOUT · COMPONENTS · DETAILS</small></div>"},
    showcase:{label:"COMING NEXT",sub:"CLIENT COLLECTION",screen:"<div class='folder-screen-bar'><i></i><i></i><i></i><b>Showcase</b></div><div class='folder-screen-body'><span>COLLABORATIVE WORK</span><strong>Next<br>chapter.</strong><small>NEW WORK WILL APPEAR HERE</small></div>"}
  };
  $$(".folder").forEach(folder=>{
    const data=previews[folder.dataset.tab],peek=$(".peek",folder);
    if(!data||!peek)return;
    peek.innerHTML=`<div class="folder-preview"><div class="folder-preview-screen">${data.screen}</div><div class="folder-preview-caption"><b>${data.label}</b><span>${data.sub}</span></div></div>`;
    folder.setAttribute("aria-expanded","false");
    folder.addEventListener("pointerenter",e=>{if(e.pointerType==="mouse")folder.classList.add("is-peeking")});
    folder.addEventListener("pointerleave",()=>folder.classList.remove("is-peeking"));
    folder.addEventListener("focus",()=>folder.classList.add("is-peeking"));
    folder.addEventListener("blur",()=>folder.classList.remove("is-peeking"));
  });
})();
// ---------- Portfolio folders: counts only; artwork is generated with CSS ----------
["projects","designs","showcase"].forEach(k=>{const count=$("#n-"+k);if(count)count.textContent=DATA[k].length;});
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
let activeCollectionRail=null,collectionRailFrame=0,collectionRailLast=0,collectionRailDragging=false;
function setCollectionRail(row){
  activeCollectionRail=row;
  const track=row?.querySelector(".marquee-track");
  const group=track?.querySelector(".marquee-group");
  if(!track||!group)return;
  track.querySelector(".marquee-group--clone")?.remove();
  if(!matchMedia("(prefers-reduced-motion: reduce)").matches){
    const clone=group.cloneNode(true);
    clone.classList.add("marquee-group--clone");
    clone.setAttribute("aria-hidden","true");
    clone.querySelectorAll("a,button").forEach(el=>{el.removeAttribute("href");el.tabIndex=-1});
    track.append(clone);
  }
  collectionRailLast=0;
  if(!collectionRailFrame)collectionRailFrame=requestAnimationFrame(animateCollectionRail);
}
function animateCollectionRail(now){
  const row=activeCollectionRail;
  if(row&&!collectionRailDragging&&!document.hidden&&!matchMedia("(prefers-reduced-motion: reduce)").matches){
    const group=row.querySelector(".marquee-group:not(.marquee-group--clone)");
    const elapsed=collectionRailLast?Math.min(now-collectionRailLast,40):16;
    if(group&&group.scrollWidth>row.clientWidth){
      row.scrollLeft+=elapsed*.018;
      if(row.scrollLeft>=group.scrollWidth)row.scrollLeft-=group.scrollWidth;
    }
  }
  collectionRailLast=now;
  collectionRailFrame=requestAnimationFrame(animateCollectionRail);
}
let cur="projects";
function showTab(k){
  if(!DATA[k])return;
  cur=k;
  $$("#tabs button").forEach(b=>{const active=b.dataset.tab===k;b.classList.toggle("on",active);b.setAttribute("aria-selected",String(active))});
  const box=$("#stageP");
  const names={projects:"Digital Projects",designs:"Interface & Experience Design",showcase:"Client Showcase"};
  const descriptions={projects:"A growing collection of digital products built with curiosity and intent.",designs:"Selected interface work, visual decisions, and product experiences.",showcase:"Client and collaborative work will appear here when available."};
  const entries={
    projects:[
      {title:"WebMotion",meta:"WEB DEVELOPMENT · DEVELOPER TOOL",desc:"A responsive workspace for previewing websites across screen sizes.",href:"pages/project-detail.html",kind:"available"},
      {title:"Future Project",meta:"PROJECT SLOT 02",desc:"A space reserved for the next digital product.",kind:"placeholder"},
      {title:"Future Project",meta:"PROJECT SLOT 03",desc:"A space reserved for a project currently in development.",kind:"placeholder"},
      {title:"Future Project",meta:"PROJECT SLOT 04",desc:"A new project will appear here when it is ready.",kind:"placeholder"}
    ],
    designs:[
      {title:"WebMotion Design",meta:"PRODUCT INTERFACE · UI DESIGN",desc:"The interface and visual system behind WebMotion.",href:"pages/design-detail.html",kind:"available"},
      {title:"Future Design",meta:"DESIGN SLOT 02",desc:"Reserved for a future interface or visual exploration.",kind:"placeholder"},
      {title:"Future Design",meta:"DESIGN SLOT 03",desc:"A place for another design collection when ready.",kind:"placeholder"},
      {title:"Future Design",meta:"DESIGN SLOT 04",desc:"New visual work will be added here in the future.",kind:"placeholder"}
    ],
    showcase:[
      {title:"Available Soon",meta:"SHOWCASE SLOT 01",desc:"A space reserved for future client or collaborative work.",kind:"placeholder"},
      {title:"Available Soon",meta:"SHOWCASE SLOT 02",desc:"Client work will appear here when it is ready to share.",kind:"placeholder"},
      {title:"Available Soon",meta:"SHOWCASE SLOT 03",desc:"Reserved for a future collaboration.",kind:"placeholder"}
    ]
  };
  const cards=entries[k].map((item,index)=>{
    const number=String(index+1).padStart(2,"0");
    if(item.kind==="available")return `
      <a class="work-card work-card--placeholder collection-card is-available" href="${item.href}">
        <div class="work-image work-image--webmotion collection-card-art" aria-hidden="true"><span class="art-orbit"></span><span class="art-window"><i></i><i></i><i></i><b></b></span><span class="work-index">${number}</span><span class="collection-status">OPEN COLLECTION</span></div>
        <div class="collection-card-copy"><small>${esc(item.meta)}</small><strong>${esc(item.title)}</strong><p>${esc(item.desc)}</p><span class="collection-card-link">Explore details ↗</span></div>
      </a>`;
    return `
      <article class="work-card work-card--placeholder collection-card is-placeholder" aria-label="${esc(item.meta)} — not published">
        <div class="work-image work-image--future" aria-hidden="true"><span class="placeholder-folder-icon"><i></i></span><span class="work-index">${number}</span><span class="collection-status">IN THE WORKS</span><span class="placeholder-watermark">COMING<br>SOON</span></div>
        <div class="collection-card-copy"><small>${esc(item.meta)}</small><strong>${esc(item.title)}</strong><p>${esc(item.desc)}</p><span class="collection-card-link collection-card-link--muted">Not published yet</span></div>
      </article>`;
  }).join("");
  const availableCount=entries[k].filter(item=>item.kind==="available").length;
  const row=`<div class="marquee-window" role="region" aria-label="${names[k]} collection" tabindex="0"><div class="marquee-track"><div class="marquee-group">${cards}</div></div></div>`;
  box.innerHTML=`<div class="portfolio-category"><div class="category-copy"><div><span class="category-kicker">0${["projects","designs","showcase"].indexOf(k)+1} / COLLECTION</span><h2>${names[k]}</h2><p>${descriptions[k]}</p></div><div class="category-total"><strong>${String(availableCount).padStart(2,"0")}</strong><span>AVAILABLE</span></div></div><div class="portfolio-marquee">${row}</div><div class="portfolio-endline"><span>GALLAGHER'S STUDIO</span><span>SELECTED WORK · ${availableCount?"FEATURED WORK + FUTURE SLOTS":"FUTURE COLLECTION SLOTS"}</span></div></div>`;
  setCollectionRail(box.querySelector(".marquee-window"));
  box.classList.remove("portfolio-shimmer-in");void box.offsetWidth;box.classList.add("portfolio-shimmer-in");
  const count=$("#portfolioCount");if(count)count.textContent=String(availableCount).padStart(2,"0");
  $$$(".folder").forEach(folder=>{if(folder.dataset.tab===k){folder.setAttribute("aria-current","true")}else folder.removeAttribute("aria-current")});
}
document.addEventListener("click",e=>{
  const explore=e.target instanceof Element?e.target.closest('.portfolio-banner-bottom a[href="#stageP"]'):null;
  if(!explore)return;
  e.preventDefault();
  const target=$("#stageP");
  if(target)target.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
});
$("#tabs").addEventListener("click",e=>{const button=e.target.closest("button[data-tab]");if(button&&$("#tabs").contains(button))showTab(button.dataset.tab)});
$$(".folder").forEach(b=>b.addEventListener("click",()=>{
  b.classList.add("is-opening");
  b.setAttribute("aria-expanded","true");
  $$(".folder").forEach(folder=>{if(folder!==b){folder.classList.remove("is-opening");folder.setAttribute("aria-expanded","false")}});
  window.setTimeout(()=>{b.classList.remove("is-opening");b.setAttribute("aria-expanded","false")},1450);
  showTab(b.dataset.tab);
  const index=panels.findIndex(p=>p.id==="portfolio");
  if(index>=0)goTo("portfolio");
}));
showTab("projects");

/* Manual swipe/drag: pause the CSS marquee while the user controls it. */
(function(){
 let drag=null,suppressClick=false;
 document.addEventListener("pointerdown",e=>{
  const row=e.target instanceof Element?e.target.closest(".marquee-window"):null;
  if(!row||e.button!==0||e.target.closest("button"))return;
  drag={row,id:e.pointerId,x:e.clientX,scroll:row.scrollLeft,moved:false};
  collectionRailDragging=true;
  row.classList.add("is-dragging");

 });
 document.addEventListener("pointermove",e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const dx=e.clientX-drag.x;
  if(Math.abs(dx)>4)drag.moved=true;
  if(drag.moved){drag.row.scrollLeft=drag.scroll-dx;suppressClick=true;}
 });
 function finish(e){
  if(!drag||drag.id!==e.pointerId)return;
  const row=drag.row;
  row.classList.remove("is-dragging");
  collectionRailDragging=false;
  drag=null;
 }
 document.addEventListener("pointerup",finish);
 document.addEventListener("pointercancel",finish);
 document.addEventListener("click",e=>{if(!suppressClick)return;suppressClick=false;e.preventDefault();e.stopPropagation();},true);
})();
// ---------- Kontak & komentar (sementara disimpan di browser) ----------
const KEY="portfolio-komentar-v2";
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){return[]}}
function renderC(){
  const a=load();$("#cn").textContent=a.length;
  $("#cmts").innerHTML=a.length?a.map(c=>`<div class="c"><div class="av">${c.p?`<img src="${c.p}" alt="">`:esc(c.n.slice(0,1).toUpperCase())}</div><div class="t"><div><b>${esc(c.n)}</b><small>${esc(c.d)}</small></div><p>${esc(c.c)}</p></div></div>`).join(""):'<p class="s" style="color:#8a95ad;font-size:.85rem">No notes yet. You can be the first to leave one.</p>';
}
function shrink(file){return new Promise(res=>{
  if(!file||file.size>1048576)return res("");
  const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement("canvas");c.width=c.height=64;const x=c.getContext("2d"),s=Math.min(im.width,im.height);x.drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,64,64);res(c.toDataURL("image/jpeg",.8))};im.onerror=()=>res("");im.src=fr.result};fr.onerror=()=>res("");fr.readAsDataURL(file)})}
$("#cmtForm input[type=file]").addEventListener("change",e=>{const f=e.target.files[0];$("#fname").textContent=f?(f.size>1048576?"File exceeds 1 MB":f.name):"Choose a profile photo"});
$("#cmtForm").addEventListener("submit",async e=>{
  e.preventDefault();const f=e.target,p=await shrink(f.p.files[0]),a=load();
  a.unshift({n:f.n.value,c:f.c.value,p,d:new Date().toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"})});
  let saved=false;
  try{localStorage.setItem(KEY,JSON.stringify(a));saved=true}catch(x){}
  f.reset();$("#fname").textContent="Choose a profile photo";renderC();
  if(saved)document.dispatchEvent(new Event("gs:success"));
});
(function(){
 const form=$("#msgForm");if(!form)return;
 const fields=[...form.querySelectorAll("input,textarea")],bar=$("#contactProgress"),label=$("#contactProgressLabel"),feedback=$("#msgFeedback");
 function update(){
  let done=0;
  fields.forEach(field=>{
   const wrap=field.closest(".contact-field"),filled=field.value.trim().length>0,valid=filled&&field.checkValidity();
   if(filled)done++;
   if(wrap){wrap.classList.toggle("is-filled",filled);wrap.classList.toggle("is-valid",valid);wrap.classList.toggle("is-invalid",filled&&!valid)}
  });
  const pct=Math.round(done/fields.length*100);if(bar)bar.style.width=pct+"%";if(label)label.textContent=pct+"% completed";
 }
 fields.forEach(field=>{field.addEventListener("input",update);field.addEventListener("blur",update)});
 const spotlight=document.createElement("div");spotlight.className="contact-spotlight";$("#contact").prepend(spotlight);
 $("#contact").addEventListener("pointermove",e=>{
  if(e.pointerType!=="mouse")return;
  const rect=$("#contact").getBoundingClientRect();
  $("#contact").style.setProperty("--spot-x",(e.clientX-rect.left)+"px");
  $("#contact").style.setProperty("--spot-y",(e.clientY-rect.top)+"px");
 },{passive:true});
 form.addEventListener("submit",e=>{
  e.preventDefault();update();
  if(!form.checkValidity()){form.reportValidity();if(feedback)feedback.textContent="A few details need another look before you continue.";return;}
  if(feedback)feedback.textContent="Your details look complete. This form is not connected to an email service yet, so your message has not been sent.";
 });
 update();
})();
renderC();



// ---------- Global Motion Foundation: pointer feedback + reduced motion ----------
(function(){
  const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("motion-ready");
  if(reduce)return;
  const selector=".btn,.arr,.tabs button,.card,.folder,.pol,.work-card,.featured-work,#tabs button,.lb-close";
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
  const pressSelector=".btn,.arr,.tabs button,.card,.folder,.pol,.work-card,.featured-work,#tabs button,.lb-close";
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
  const rippleTargets=".btn,.arr,.tabs button,.card,.pol,.work-card,.featured-work,#tabs button,.lb-close";
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
  const targets=".btn,.arr,.tabs button,.card,.folder,.pol,nav a,.find a,.work-card,.featured-work,#tabs button,.lb-close";
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

// ---------- Stage 5: scroll craft + masked typography ----------
(function(){
  const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const selectors=[
    "#home .hero-copy h1",
    "#home .hero-description",
    "#home .hero-quote",
    "#about .about-heading-main",
    "#about .a-left h2",
    "#about .a-right p",
    "#portfolio .portfolio-banner-title",
    "#portfolio .portfolio-banner-bottom",
    "#contact .box h2",
    "#contact .box h3"
  ];
  const targets=selectors.flatMap(selector=>$$(selector));
  targets.forEach(el=>el.classList.add("text-mask-reveal"));
  if(reduce||!("IntersectionObserver" in window)){
    targets.forEach(el=>el.classList.add("text-mask-visible"));
    return;
  }
  const homeTargets=targets.filter(el=>el.closest("#home"));
  homeTargets.forEach(el=>el.classList.add("text-mask-visible"));
  ["#about","#portfolio","#contact"].forEach(selector=>{
    const section=$(selector);
    if(!section)return;
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add("text-mask-visible");
        io.unobserve(entry.target);
      });
    },{root:section,threshold:.12,rootMargin:"0px 0px -5% 0px"});
    targets.filter(el=>el.closest(selector)).forEach(el=>io.observe(el));
  });
  // Subtle scroll depth for ambient layers; no layout or navigation changes.
  panels.forEach(panel=>{
    let raf=0;
    panel.addEventListener("scroll",()=>{
      if(raf)return;
      raf=requestAnimationFrame(()=>{
        raf=0;
        panel.style.setProperty("--scroll-shift",(Math.min(panel.scrollTop,900)*-.035)+"px");
      });
    },{passive:true});
  });
})();



// Keep one continuous copy of the original Home video behind the entire document.
(function(){
  const sharedBg=document.querySelector("#home .home-latest-bg");
  if(sharedBg && sharedBg.parentElement!==document.body){
    document.body.appendChild(sharedBg);
    sharedBg.setAttribute("aria-hidden","true");
  }
})();
