/* Responsif otomatis: HP, tablet, desktop, dan "Situs desktop" di HP */
(function(){
  var de=document.documentElement;
  function fit(){
    de.style.zoom=1;
    var w=de.clientWidth,h=innerHeight,sw=Math.min(screen.width,screen.height),
        touch=navigator.maxTouchPoints>0||matchMedia("(pointer:coarse)").matches,z=1;
    if(touch&&sw<=900&&w>sw*1.25)z=Math.min(3,w/Math.max(sw,360));
    de.style.zoom=z;
    de.style.setProperty("--u",(w/z/100)+"px");
    de.style.setProperty("--h",(h/z/100)+"px");
    de.classList.toggle("compact",w/z<760);
  }
  fit();addEventListener("resize",fit);addEventListener("orientationchange",fit);
})();

