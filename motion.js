/* Gallagher's Studio — Motion & Sound System
   Lightweight, responsive, dependency-free. */
(function(){
  "use strict";
  const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches;
  const revealSelectors=[
    "#home .home-latest-eyebrow",
    "#home .home-latest-content h1",
    "#home .home-latest-bottom",
    "#home .home-latest-primary",
    "#home .home-latest-foot",
    "#about .about-heading > *",
    "#about .about-grid > *",
    "#about .about-rule",
    "#about .tl > div",
    "#about .tl h3",
    "#about .tl .item",
    "#about .about-section-label",
    "#about .folders .folder",
    "#portfolio .portfolio-heading > *",
    "#portfolio .portfolio-banner-bottom",
    "#portfolio .category-copy > *",
    "#portfolio #tabs button",
    "#contact .contact-intro > *",
    "#contact .contact-form-card",
    "#contact .contact-card-head",
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
    /* Keep the marquee container visible immediately: its tracks must move
       as soon as Portfolio is rendered, not only after a navigation reveal. */
    root.querySelectorAll("#stageP .category-copy > *, #stageP .portfolio-endline, #stageP .featured-work, #stageP .work-card").forEach((el,i)=>{
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
    document.querySelectorAll("button,.btn,a.hero-primary,a.hero-secondary,.contact-send,.contact-socials a,.card,.folder,.work-card,.featured-work").forEach(el=>{
      el.classList.add("gs-interactive");
    });
    if(!reduce){
      const intro=document.querySelector("#home .home-latest-content");
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



  /* Original Linux-inspired UI tones. Audio is unlocked only after a real
     user gesture because mobile browsers block autoplay audio. */
  let audio=null,audioReady=false,lastHover=0;
  function unlockAudio(){
    if(audioReady)return;
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return;
    try{
      audio=audio||new Audio();
      if(audio.state==="suspended")audio.resume();
      audioReady=true;
    }catch(e){}
  }
  function tone(freq,delay,duration,volume,type){
    if(!audio||!audioReady)return;
    const start=audio.currentTime+delay;
    const osc=audio.createOscillator(),gain=audio.createGain();
    osc.type=type||"sine";osc.frequency.setValueAtTime(freq,start);
    gain.gain.setValueAtTime(.0001,start);
    gain.gain.exponentialRampToValueAtTime(volume,start+.012);
    gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    osc.connect(gain);gain.connect(audio.destination);
    osc.start(start);osc.stop(start+duration+.02);
  }
  function uiSound(kind){
    if(!audioReady)return;
    if(kind==="hover"){
      tone(740,0,.045,.012,"sine");
    }else if(kind==="press"){
      tone(520,0,.07,.025,"triangle");
      tone(780,.045,.085,.014,"sine");
    }else if(kind==="success"){
      tone(660,0,.09,.018,"sine");
      tone(880,.075,.12,.018,"sine");
    }
  }
  document.addEventListener("pointerdown",e=>{
    unlockAudio();
    if(e.pointerType==="touch"||e.pointerType==="pen"||e.pointerType==="mouse")uiSound("press");
  },{passive:true});
  document.addEventListener("pointerover",e=>{
    if(!audioReady||e.pointerType!=="mouse")return;
    const el=e.target.closest("button,a,.card,.folder,.work-card,.featured-work,.contact-socials a");
    if(!el||el.contains(e.relatedTarget))return;
    const now=performance.now();
    if(now-lastHover<90)return;
    lastHover=now;uiSound("hover");
  },{passive:true});
  document.addEventListener("gs:success",()=>uiSound("success"));

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();

})();
