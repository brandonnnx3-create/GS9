/* ============================================================
   GS9 — COMPORTAMIENTO DE LA PÁGINA
   Entrada del hero, columnas y fondos que se desplazan, galería
   horizontal, apariciones al scrollear, header, cinta, versión
   negra/blanca y los links de WhatsApp.

   Los datos de contacto salen de js/config.js.
   ============================================================ */

(function () {
  "use strict";

  var root = document.documentElement;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  var quieto = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* config.js declara `const CONFIG`: es global pero no cuelga de
     window, así que window.CONFIG sería undefined. */
  var cfg = typeof CONFIG !== "undefined" ? CONFIG : {};
  var numero = String(cfg.whatsapp || "").replace(/\D/g, "");
  var hayWhatsapp = numero.length >= 8;

  /* La clase .js habilita los estados de entrada. Se agrega desde acá
     para que, sin JavaScript, nada quede invisible. */
  if (!quieto) root.classList.add("js");

  /* ---------- Entrada del hero ----------
     Espera a las tipografías para que el título no entre con la letra
     de reemplazo, con un tope de 900 ms para no retener la portada. */

  function listo() {
    requestAnimationFrame(function () {
      root.classList.add("is-ready");
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

  /* ---------- Apariciones al scrollear ---------- */

  if (!quieto && "IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        obs.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.06 });
    $$(".reveal").forEach(function (el) { obs.observe(el); });
  }

  /* ---------- Cinta ----------
     El contenido va dos veces: cuando la animación llega a la mitad,
     la segunda copia está donde estaba la primera y el bucle no corta. */

  var cinta = $("#ticker");
  if (cinta) {
    var bloque = [
      "Calidad y elegancia en cada detalle",
      "Revisada una por una",
      "Envíos a todo el país",
      "El lujo está en los detalles",
    ].map(function (f) { return '<span class="ticker__item">' + esc(f) + "</span>"; }).join("");
    cinta.innerHTML = bloque + bloque;
  }

  /* ---------- Movimiento ligado al scroll ---------- */

  var header = $("#header");
  var progreso = $("#progress");
  var arriba = $("#toTop");

  var hero = $("#inicio");
  var cols = hero ? Array.prototype.slice.call(hero.querySelectorAll("[data-speed]")) : [];
  var capas = quieto ? [] : $$("[data-par]");

  var look = $("#galeria");
  var pista = $("#lookTrack");
  var barraLook = $("#lookBar");
  var cuenta = $("#lookCount");
  var total = pista ? pista.children.length : 0;
  var distancia = 0;

  /* El alto de la galería sale del ancho real de la pista: un píxel de
     scroll vertical es un píxel de desplazamiento lateral. */
  function medirGaleria() {
    if (!look || !pista || quieto) return;
    distancia = Math.max(0, pista.scrollWidth - window.innerWidth);
    look.style.height = (window.innerHeight + distancia) + "px";
  }

  function cuadro() {
    pendiente = false;
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var vh = window.innerHeight;

    if (header) header.classList.toggle("is-stuck", y > 12);

    if (progreso) {
      var alto = document.documentElement.scrollHeight - vh;
      progreso.style.transform = "scaleX(" + (alto > 0 ? Math.min(y / alto, 1) : 0) + ")";
    }

    if (arriba) {
      var ver = y > 700;
      if (ver && arriba.hidden) arriba.hidden = false;
      arriba.classList.toggle("show", ver);
    }

    if (!quieto && hero && y <= hero.offsetHeight) {
      cols.forEach(function (c) {
        c.style.setProperty("--y", (y * parseFloat(c.dataset.speed)).toFixed(1) + "px");
      });
    }

    /* Cada fondo con data-par se mueve entre -2·amp y 0 de su propio
       alto; el CSS le da el alto extra para que no quede franja vacía. */
    capas.forEach(function (capa) {
      var img = capa.querySelector("img");
      if (!img) return;
      var r = capa.getBoundingClientRect();
      if (r.bottom < -120 || r.top > vh + 120) return;
      var p = clamp((r.top + r.height / 2 - vh / 2) / ((vh + r.height) / 2), -1, 1);
      var amp = parseFloat(capa.dataset.par) || 0.07;
      img.style.transform = "translate3d(0," + (-amp * 100 + p * amp * 100).toFixed(2) + "%,0)";
    });

    if (look && pista && !quieto && distancia) {
      var rl = look.getBoundingClientRect();
      var pl = clamp(-rl.top / distancia, 0, 1);
      pista.style.transform = "translate3d(" + (-pl * distancia).toFixed(1) + "px,0,0)";
      if (barraLook) barraLook.style.width = (pl * 100).toFixed(2) + "%";
      if (cuenta) {
        var n = Math.min(total, Math.round(pl * (total - 1)) + 1);
        cuenta.textContent = (n < 10 ? "0" + n : n) + " / " + (total < 10 ? "0" + total : total);
      }
    }
  }

  var pendiente = false;
  function alScrollear() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(cuadro);
  }

  window.addEventListener("scroll", alScrollear, { passive: true });
  window.addEventListener("resize", function () { medirGaleria(); alScrollear(); }, { passive: true });

  if (arriba) {
    arriba.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: quieto ? "auto" : "smooth" });
    });
  }

  medirGaleria();
  cuadro();

  /* ---------- Versión negra / blanca ----------
     Las dos viven en css/tienda.css: alcanza con cambiar el atributo.
     La elección queda guardada para la próxima visita. */

  function cambiarTema(t) {
    root.setAttribute("data-tema", t);
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "clara" ? "#F6F6F4" : "#070707");
    try { localStorage.setItem("rj_tema", t); } catch (e) {}
  }

  var aClara = $("#temaAClara");
  if (aClara) aClara.addEventListener("click", function () { cambiarTema("clara"); });
  var aOscura = $("#temaAOscura");
  if (aOscura) aOscura.addEventListener("click", function () { cambiarTema("oscura"); });

  /* ---------- WhatsApp ----------
     Sin número cargado, los botones llevan a la galería o al contacto
     en lugar de a un WhatsApp inexistente. */

  if (hayWhatsapp) {
    var texto = "Hola! Vi la página de " + (cfg.marca || "GS9") +
      " y quería consultar por una pieza.";
    $$("[data-wa]").forEach(function (a) {
      a.href = "https://wa.me/" + numero + "?text=" + encodeURIComponent(texto);
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  /* ---------- Footer ---------- */

  var lista = $("#footerContact");
  if (lista) {
    var items = [];
    if (cfg.instagram) {
      items.push('<li><a href="https://instagram.com/' + esc(cfg.instagram) +
        '" target="_blank" rel="noopener">@' + esc(cfg.instagram) + "</a></li>");
    }
    if (cfg.email) {
      items.push('<li><a href="mailto:' + esc(cfg.email) + '">' + esc(cfg.email) + "</a></li>");
    }
    if (hayWhatsapp) {
      items.push('<li><a href="https://wa.me/' + numero + '" target="_blank" rel="noopener">WhatsApp</a></li>');
    }
    if (cfg.ciudad) items.push("<li>" + esc(cfg.ciudad) + "</li>");
    lista.innerHTML = items.join("") || "<li>Escribinos por WhatsApp</li>";
  }

  var copy = $("#footerCopy");
  if (copy) copy.textContent = "© " + new Date().getFullYear() + " " + (cfg.marca || "GS9");
})();
