/* Gallagher's Studio — Motion & Sound System
   Lightweight, responsive, dependency-free. */
(function(){
  "use strict";
  const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches;
  const revealSelectors=[
    "#home .hero-copy > *",
    "#home .hero-side-mark",
    "#home .hero-footnote",
    "#about .about-heading > *",
    "#about .about-grid > *",
    "#about .tl > div",
    "#about .tl h3",
    "#about .tl .item",
    "#about .about-section-label",
    "#about .folders .folder",
    "#portfolio .portfolio-heading > *",
    "#portfolio .category-copy > *",
    "#portfolio #tabs button",
    "#contact .contact-intro > *",
    "#contact .contact-form-card",
    "#contact .contact-field",
    "#contact .contact-submit-row",
    "#contact .contact-socials a",
    "#contact .contact-comment",
    "#contact .contact-comments",
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
    enablePageReplay();
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

  /* Replay staggered reveals whenever a page panel is entered again. */
  function enablePageReplay(){
    if(reduce||!("IntersectionObserver"in window))return;
    const sections=[...document.querySelectorAll("#pageTrack>section")];
    if(!sections.length)return;
    let activePanel=null;
    const pageObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting||entry.intersectionRatio<.58)return;
        if(activePanel===entry.target)return;
        activePanel=entry.target;
        entry.target.querySelectorAll(".gs-reveal").forEach(el=>{
          el.classList.remove("gs-visible");
          if(observer)observer.observe(el);
        });
      });
    },{root:null,threshold:[.18,.42]});
    sections.forEach(section=>pageObserver.observe(section));
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();

  /* AudioContext is unlocked on the first real user gesture, then reused. */
  let audio=null,audioUnlocked=false,lastHover=0;
  function unlockAudio(){
    if(!audio){
      const Ctx=window.AudioContext||window.webkitAudioContext;
      if(!Ctx)return;
      audio=new Ctx();
    }
    if(audio.state==="running"){audioUnlocked=true;return;}
    audio.resume().then(()=>{audioUnlocked=audio.state==="running";}).catch(()=>{});
  }
  document.addEventListener("pointerdown",unlockAudio,{capture:true,passive:true});
  document.addEventListener("keydown",unlockAudio,{capture:true});
  function tone(startFreq,endFreq,duration,volume){
    if(!audio||!audioUnlocked||audio.state!=="running")return;
    const ctx=audio,now=ctx.currentTime;
    const osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
    osc.type="sine";
    osc.frequency.setValueAtTime(startFreq,now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40,endFreq),now+duration);
    filter.type="lowpass";
    filter.frequency.setValueAtTime(1800,now);
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(volume,now+.006);
    gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    osc.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
    osc.start(now);osc.stop(now+duration+.015);
  }
  function sound(kind){
    if(reduce)return;
    /* Restrained desktop-style ticks: sine tone, short envelope, no arcade melody. */
    if(kind==="hover")tone(920,760,.045,.12);
    if(kind==="click")tone(520,410,.065,.20);
    if(kind==="open")tone(390,300,.095,.22);
    if(kind==="success")tone(660,540,.11,.19);
  }
  /* Desktop hover: cursor movement alone triggers the soft UI response. */
  const hoverTargets=[
    "button","a","[role='button']","summary",
    ".folder",".work-card",".featured-work",".contact-field",
    ".contact-send",".contact-socials a",".tabs button",
    ".arr",".portfolio-category",".project-item"
  ].join(",");
  document.addEventListener("pointerover",e=>{
    if(coarse||e.pointerType!=="mouse")return;
    const target=e.target.closest(hoverTargets);
    if(!target||target.contains(e.relatedTarget))return;
    const now=performance.now();
    if(now-lastHover<115)return;
    lastHover=now;
    sound("hover");
  },{passive:true});
  document.addEventListener("click",e=>{
    const target=e.target.closest("button,a,[role='button'],summary");
    if(!target)return;
    sound(target.classList.contains("folder")||target.classList.contains("work-card")?"open":"click");
  },true);
  document.addEventListener("submit",()=>sound("success"),true);
})();