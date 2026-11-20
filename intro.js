/* GALLAGHER'S STUDIO — AUTOMATIC CINEMATIC OPENING */
(() => {
  "use strict";
  const intro=document.getElementById("gsIntro");
  const logo=document.getElementById("gsIntroLogo");
  const word=document.getElementById("gsIntroWordmark");
  const brand=document.getElementById("gsBrand");
  if(!intro||!logo||!word||!brand)return;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease="cubic-bezier(.22,1,.36,1)";
  const animations=[];
  const animate=(el,frames,options={})=>{
    const a=el.animate(frames,{fill:"both",...options});animations.push(a);return a;
  };
  function makeParticles(){
    const holder=document.getElementById("gsIntroParticles");if(!holder)return;
    for(let i=0;i<18;i++){
      const p=document.createElement("i");p.className="gs-intro-particle";
      p.style.left=(7+(i*37)%87)+"%";p.style.top=(18+(i*29)%68)+"%";
      p.style.setProperty("--duration",(6+(i%5)*1.3)+"s");
      p.style.setProperty("--alpha",(.12+(i%4)*.055).toFixed(2));
      p.style.setProperty("--drift",((i%2?1:-1)*(12+(i%5)*8))+"px");
      p.style.animationDelay=(-i*.53)+"s";holder.appendChild(p);
    }
  }
  // Best-effort ambient audio. Browsers may defer Web Audio until the visitor interacts.
  function playAmbient(){
    const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;
    try{
      const ctx=new Ctx(),master=ctx.createGain(),filter=ctx.createBiquadFilter();
      master.gain.value=.0001;filter.type="lowpass";filter.frequency.value=900;
      filter.connect(master);master.connect(ctx.destination);
      const now=ctx.currentTime;
      master.gain.setTargetAtTime(.055,now+0.2,.9);
      [[110,.025,5.5],[164.81,.016,5.1],[220,.011,4.8],[329.63,.007,3.1]].forEach(([hz,vol,duration],i)=>{
        const osc=ctx.createOscillator(),gain=ctx.createGain();
        osc.type="sine";osc.frequency.value=hz;
        gain.gain.setValueAtTime(.0001,now+i*.22);
        gain.gain.exponentialRampToValueAtTime(vol,now+i*.22+.8);
        gain.gain.setTargetAtTime(.0001,now+i*.22+duration,.8);
        osc.connect(gain);gain.connect(filter);osc.start(now+i*.22);osc.stop(now+i*.22+duration+2);
      });
      window.setTimeout(()=>{try{ctx.close()}catch(e){}},11000);
    }catch(e){}
  }
  let introFinished=false;
  let skipRequested=false;
  let dockTimer=null;
  function skipIntro(){
    if(introFinished||skipRequested)return;
    skipRequested=true;
    if(dockTimer)window.clearTimeout(dockTimer);
    dockBrand();
  }
  intro.addEventListener("click",skipIntro);
  function dockBrand(){
    if(introFinished)return;
    const brandIcon=brand.querySelector("svg"),brandCopy=brand.querySelector(".gs-brand-copy");
    if(!brandIcon||!brandCopy)return;
    // Measure the final brand without its hidden-state offset, so the handoff cannot jump.
    brand.style.transform="none";
    const overlayRect=intro.getBoundingClientRect();
    const local=r=>({left:r.left-overlayRect.left,top:r.top-overlayRect.top,width:r.width,height:r.height});
    const fromLogo=local(logo.getBoundingClientRect()),fromWord=local(word.getBoundingClientRect());
    const toLogo=local(brandIcon.getBoundingClientRect()),toWord=local(brandCopy.getBoundingClientRect());
    // Stop the entrance animations before docking. Their fill effects otherwise keep
    // overriding the new transform and make the logo jump or drift away.
    logo.getAnimations().forEach(a=>a.cancel());
    word.getAnimations().forEach(a=>a.cancel());
    const place=(el,r)=>{
      el.style.position="absolute";el.style.left=r.left+"px";el.style.top=r.top+"px";
      el.style.right="auto";el.style.bottom="auto";el.style.width=r.width+"px";el.style.height=r.height+"px";
      el.style.margin="0";el.style.transformOrigin="top left";el.style.transform="none";
    };
    place(logo,fromLogo);place(word,fromWord);
    const move=(from,to)=>[
      {transform:"translate3d(0,0,0) scale(1,1)"},
      {transform:"translate3d("+(to.left-from.left)+"px,"+(to.top-from.top)+"px,0) scale("+(to.width/from.width)+","+(to.height/from.height)+")"}
    ];
    const opts={duration:2600,easing:"cubic-bezier(.65,0,.35,1)",fill:"both"};
    const la=logo.animate(move(fromLogo,toLogo),opts);
    const wa=word.animate(move(fromWord,toWord),{...opts,delay:100});
    Promise.allSettled([la.finished,wa.finished]).then(()=>{
      if(introFinished)return;
      introFinished=true;
      la.cancel();wa.cancel();
      place(logo,toLogo);place(word,toWord);
      word.classList.add("gs-wordmark-docking");
      // Reveal the real header identity underneath the matching overlay elements.
      brand.classList.add("gs-brand-visible");
      intro.classList.add("gs-intro-out");
      window.setTimeout(()=>intro.remove(),2200);
    });
  }
  function run(){
    // Center the complete logo + wordmark lockup as one visual composition.
    const lr=logo.getBoundingClientRect(),wr=word.getBoundingClientRect();
    const top=Math.min(lr.top,wr.top),bottom=Math.max(lr.bottom,wr.bottom);
    const shift=window.innerHeight/2-(top+bottom)/2;
    intro.style.setProperty("--gs-center-shift",shift+"px");
    makeParticles();
    if(reduced){
      // Respect reduced-motion preferences while keeping the skip control available.
      logo.style.opacity="1";
      word.style.opacity="1";
      word.style.transform="translate(-50%,0)";
      word.style.filter="none";
      dockTimer=window.setTimeout(dockBrand,1800);
      return;
    }
    playAmbient();
    const hex=logo.querySelector(".gs-hex");
    const light=logo.querySelector(".gs-mark-light");
    const blue=logo.querySelector(".gs-mark-blue");
    const lightFill=logo.querySelector(".gs-mark-fill-light");
    const blueFill=logo.querySelector(".gs-mark-fill-blue");
    const topBar=intro.querySelector(".gs-letterbox-top");
    const bottomBar=intro.querySelector(".gs-letterbox-bottom");
    animate(topBar,[{transform:"scaleY(1)"},{transform:"scaleY(0)"}],{duration:1050,delay:180,easing:ease});
    animate(bottomBar,[{transform:"scaleY(1)"},{transform:"scaleY(0)"}],{duration:1050,delay:180,easing:ease});
    animate(logo,[{transform:"translate(-50%,-50%) scale(.94)",filter:"drop-shadow(0 0 3px rgba(217,165,102,0))"},{transform:"translate(-50%,-50%) scale(1)",filter:"drop-shadow(0 0 25px rgba(217,165,102,.2)"},{transform:"translate(-50%,-50%) scale(.88)",filter:"drop-shadow(0 0 18px rgba(217,165,102,.16)"}],{duration:6500,delay:250,easing:ease});
    animate(hex,[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:1900,delay:650,easing:"cubic-bezier(.4,0,.2,1)"});
    animate(light,[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:1500,delay:2050,easing:ease});
    animate(blue,[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:1500,delay:2250,easing:ease});
    animate(lightFill,[{opacity:0},{opacity:1}],{duration:850,delay:3500,easing:ease});
    animate(blueFill,[{opacity:0},{opacity:1}],{duration:850,delay:3650,easing:ease});
    animate(light,[{opacity:1},{opacity:.12}],{duration:650,delay:3650});
    animate(blue,[{opacity:1},{opacity:.22}],{duration:650,delay:3750});
    animate(document.getElementById("gsIntroFlare"),[{opacity:0,transform:"scaleX(0)"},{opacity:.85,transform:"scaleX(1)",offset:.48},{opacity:0,transform:"scaleX(1)"}],{duration:1350,delay:4050,easing:ease});
    animate(word,[{opacity:0,transform:"translate(-50%,16px)",filter:"blur(5px)"},{opacity:1,transform:"translate(-50%,0)",filter:"blur(0)"}],{duration:1150,delay:5950,easing:ease});
    animate(word.querySelector(".gs-intro-rule"),[{width:"0px",opacity:0},{width:"112px",opacity:1}],{duration:850,delay:6850,easing:ease});
    animate(document.querySelector(".gs-intro-tagline"),[{opacity:0,transform:"translateY(7px)"},{opacity:.72,transform:"translateY(0)"}],{duration:1000,delay:7200,easing:ease});
    dockTimer=window.setTimeout(dockBrand,8250);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
})();