/* RESPONSIVE VIEWPORT FOUNDATION
   Mengikuti ukuran layar asli tanpa memaksa kanvas desktop pada HP. */
(function(){
  var root=document.documentElement;
  function fit(){
    var width=root.clientWidth||window.innerWidth||1200;
    var height=window.innerHeight||800;
    root.style.setProperty("--u",(width/100)+"px");
    root.style.setProperty("--h",(height/100)+"px");
  }
  fit();
  window.addEventListener("resize",fit,{passive:true});
  window.addEventListener("orientationchange",fit,{passive:true});
})();
