/* Responsif otomatis: HP, tablet, desktop, dan "Situs desktop" di HP */
(function(){
  var root = document.documentElement;

  function fit(){
    var width = root.clientWidth || window.innerWidth;
    var height = window.innerHeight;

    /* Jangan paksa zoom: biarkan browser menentukan lebar viewport desktop/mobile. */
    root.style.zoom = "1";
    root.style.setProperty("--u", (width / 100) + "px");
    root.style.setProperty("--h", (height / 100) + "px");

    /* Layout compact hanya aktif ketika viewport memang sempit. */
    root.classList.toggle("compact", width < 760);
  }

  fit();
  window.addEventListener("resize", fit);
  window.addEventListener("orientationchange", fit);
})();
