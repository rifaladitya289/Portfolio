/* Gallagher's Studio — Motion & Sound System
   Lightweight, responsive, dependency-free. */
(function(){
  "use strict";
  const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches;
  const revealSelectors=[
    "#home .hero-copy > *",
    "#about .about-heading > *",
    "#about .about-grid > *",
    "#about .tl > div",
    "#about .about-section-label",
    "#about .folders .folder",
    "#portfolio .portfolio-heading > *",
    "#portfolio #tabs button",
    "#contact .contact-intro > *",
    "#contact .contact-form-card",
    "#contact .contact-lower > *"
  ];
  const seen=new WeakSet();
  let observer=null;
  function reveal(root){
    if(reduce){root.querySelectorAll(".gs-reveal").forEach(el=>el.classList.add("gs-visible"));return;}
    if(!observer){
      observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add("gs-visible");
        observer.unobserve(entry.target);
      }),{threshold:.08,rootMargin:"0px 0px -3% 0px"});
    }
    root.querySelectorAll(".gs-reveal:not(.gs-visible)").forEach(el=>observer.observe(el));
  }
  function prepare(root){
    let index=0;
    revealSelectors.forEach(selector=>{
      root.querySelectorAll(selector).forEach(el=>{
        if(seen.has(el))return;
        seen.add(el);
        el.classList.add("gs-reveal");
        el.style.setProperty("--gs-delay",Math.min(index++%8,7)*85+"ms");
      });
    });
    root.querySelectorAll("#stageP .portfolio-category, #stageP .featured-work, #stageP .work-card, #stageP .portfolio-endline").forEach((el,i)=>{
      if(seen.has(el))return;
      seen.add(el);
      el.classList.add("gs-reveal");
      el.style.setProperty("--gs-delay",Math.min(i,8)*90+"ms");
    });
    reveal(root);
  }
  function boot(){
    prepare(document);
    document.body.classList.add("gs-motion-ready");
    const stage=document.getElementById("stageP");
    if(stage&&"MutationObserver"in window){
      new MutationObserver(()=>prepare(stage)).observe(stage,{childList:true,subtree:true});
    }
    document.querySelectorAll("button,.btn,a.hero-primary,a.hero-secondary,.contact-send,.contact-socials a").forEach(el=>{
      el.classList.add("gs-interactive");
    });
    if(!reduce){
      const intro=document.querySelector("#home .hero-copy");
      if(intro)intro.classList.add("gs-opening");
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();

  /* Soft synthesized UI sounds. Audio is created only after a user gesture. */
  let audio=null,lastHover=0;
  function getAudio(){
    if(!audio){
      const Ctx=window.AudioContext||window.webkitAudioContext;
      if(!Ctx)return null;
      audio=new Ctx();
    }
    if(audio.state==="suspended")audio.resume().catch(()=>{});
    return audio;
  }
  function tone(freq,duration,volume,shape){
    const ctx=getAudio();if(!ctx)return;
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type=shape||"sine";osc.frequency.setValueAtTime(freq,ctx.currentTime);
    gain.gain.setValueAtTime(.0001,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),ctx.currentTime+.012);
    gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);
    osc.connect(gain);gain.connect(ctx.destination);
    osc.start();osc.stop(ctx.currentTime+duration+.025);
  }
  function sound(kind){
    if(reduce)return;
    if(kind==="hover")tone(720,.035,.009,"sine");
    if(kind==="click")tone(510,.055,.018,"sine");
    if(kind==="open"){tone(460,.09,.014,"sine");window.setTimeout(()=>tone(690,.12,.012,"sine"),55);}
    if(kind==="success"){tone(620,.12,.014,"sine");window.setTimeout(()=>tone(830,.16,.012,"sine"),95);}
  }
  document.addEventListener("pointerover",e=>{
    if(coarse||e.pointerType!=="mouse")return;
    const target=e.target.closest("button,a,[role='button'],summary");
    if(!target||target.contains(e.relatedTarget))return;
    const now=performance.now();if(now-lastHover<100)return;lastHover=now;sound("hover");
  },{passive:true});
  document.addEventListener("click",e=>{
    const target=e.target.closest("button,a,[role='button'],summary");
    if(!target)return;
    sound(target.classList.contains("folder")||target.classList.contains("work-card")?"open":"click");
  },true);
  document.addEventListener("submit",()=>sound("success"),true);
})();