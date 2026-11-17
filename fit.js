/* DESKTOP CANVAS MODE
   Mempertahankan layout desktop pada layar HP.
   Pengguna tetap dapat memperbesar halaman dengan gesture browser.
*/
(function(){
  var root=document.documentElement;
  function fit(){
    var width=root.clientWidth||1200;
    var height=window.innerHeight;
    root.style.zoom="1";
    root.style.setProperty("--u",(width/100)+"px");
    root.style.setProperty("--h",(height/100)+"px");
    root.classList.remove("compact");
  }
  fit();
  window.addEventListener("resize",fit,{passive:true});
  window.addEventListener("orientationchange",fit,{passive:true});
})();
