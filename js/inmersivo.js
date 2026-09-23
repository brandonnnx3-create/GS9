/* ============================================================
   GS9 — MOVIMIENTO DE LA PORTADA
   Lo que no es catálogo ni carrito: la entrada del hero, las
   columnas de fotos que se desplazan a distinta velocidad, la
   galería horizontal y el botón de WhatsApp del llamado.

   Va separado de js/app.js a propósito: si este archivo falla,
   la tienda y el checkout siguen funcionando igual.
   ============================================================ */

(function () {
  "use strict";

  var root = document.documentElement;
  var quieto = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  /* ---------- Entrada del hero ----------
     Espera a las tipografías (para que el título no entre con la
     letra de reemplazo y cambie a mitad de camino), con un tope de
     900 ms para no retener la portada si tardan. */

  function listo() {
    requestAnimationFrame(function () {
      root.classList.add("is-ready");
      /* Terminada la entrada, las columnas siguen al scroll sin demora. */
      setTimeout(function () { root.classList.add("is-live"); }, 2600);
    });
  }

  if (quieto) {
    root.classList.add("is-ready", "is-live");
  } else {
    var tope = new Promise(function (r) { setTimeout(r, 900); });
    var fuentes = document.fonts && document.fonts.ready ? document.fonts.ready : tope;
    Promise.race([fuentes, tope]).then(listo, listo);
  }

  /* ---------- Columnas del hero ---------- */

  var hero = document.getElementById("inicio");
  var cols = hero ? Array.prototype.slice.call(hero.querySelectorAll("[data-speed]")) : [];

  function moverColumnas() {
    if (!hero) return;
    var alto = hero.offsetHeight;
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (y > alto) return;
    cols.forEach(function (c) {
      c.style.setProperty("--y", (y * parseFloat(c.dataset.speed)).toFixed(1) + "px");
    });
  }

  /* ---------- Galería horizontal ----------
     El alto de la sección se calcula con el ancho real de la pista:
     así un píxel de scroll vertical es un píxel de desplazamiento
     lateral, en cualquier pantalla. */

  var look = document.getElementById("galeria");
  var pista = document.getElementById("lookTrack");
  var barra = document.getElementById("lookBar");
  var cuenta = document.getElementById("lookCount");
  var total = pista ? pista.children.length : 0;
  var distancia = 0;

  function medirGaleria() {
    if (!look || !pista || quieto) return;
    distancia = Math.max(0, pista.scrollWidth - window.innerWidth);
    look.style.height = (window.innerHeight + distancia) + "px";
  }

  function moverGaleria() {
    if (!look || !pista || quieto || !distancia) return;
    var r = look.getBoundingClientRect();
    var p = clamp(-r.top / distancia, 0, 1);
    pista.style.transform = "translate3d(" + (-p * distancia).toFixed(1) + "px,0,0)";
    if (barra) barra.style.width = (p * 100).toFixed(2) + "%";
    if (cuenta) {
      var n = Math.min(total, Math.round(p * (total - 1)) + 1);
      cuenta.textContent = (n < 10 ? "0" + n : n) + " / " + (total < 10 ? "0" + total : total);
    }
  }

  /* ---------- Un solo manejador de scroll ---------- */

  var pendiente = false;

  function cuadro() {
    pendiente = false;
    if (!quieto) moverColumnas();
    moverGaleria();
  }

  function alScrollear() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(cuadro);
  }

  window.addEventListener("scroll", alScrollear, { passive: true });
  window.addEventListener("resize", function () { medirGaleria(); alScrollear(); }, { passive: true });

  medirGaleria();
  cuadro();

  /* ---------- WhatsApp del llamado ----------
     El número sale de js/config.js, el mismo que edita el panel:
     no hay un segundo lugar donde cargarlo. Sin número, el botón
     lleva al catálogo en lugar de a un WhatsApp inexistente. */

  /* config.js declara `const CONFIG`: es global pero no cuelga de
     window, así que window.CONFIG sería undefined. */
  var cfg = typeof CONFIG !== "undefined" ? CONFIG : {};
  var numero = String(cfg.whatsapp || "").replace(/\D/g, "");

  Array.prototype.forEach.call(document.querySelectorAll("[data-wa]"), function (a) {
    if (numero.length < 8) return;
    var texto = "Hola! Vi la tienda de " + (cfg.marca || "GS9") +
      " y quería consultar por una pieza.";
    a.href = "https://wa.me/" + numero + "?text=" + encodeURIComponent(texto);
    a.target = "_blank";
    a.rel = "noopener";
  });
})();
