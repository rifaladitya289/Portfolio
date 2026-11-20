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

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();

})();
