/* ============================================================
   G.S.9 — CATÁLOGO
   Arma el índice de categorías, los filtros, la grilla de
   productos, la ficha de cada uno y el menú del celular, todo a
   partir de js/productos.js.

   Links que entiende la página:
     #joyas                   la tienda filtrada por esa categoría
     #producto/<id>           la ficha de ese producto, abierta
   Así se puede pasar por Instagram el link de una categoría o de
   un producto puntual. La ficha suma un paso al historial: el
   botón "atrás" del celular la cierra.

   El carrito junta varias piezas en un solo pedido de WhatsApp. No
   cobra nada: vive en localStorage (por eso no se comparte entre
   dispositivos) y al finalizar arma un mensaje con el detalle y el
   total estimado; el pago se sigue confirmando como siempre.
   ============================================================ */

(function () {
  "use strict";

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;

  var G = window.GS9 || {
    marca: "G.S.9",
    whatsapp: function () { return false; },
    esc: function (s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; });
    },
  };
  var esc = G.esc;

  var quieto = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* ---------- Datos ----------
     Se descarta lo incompleto en vez de romper la página: un producto
     sin nombre o con una categoría que no existe no se muestra. */

  var DATA = typeof CATALOGO !== "undefined" ? CATALOGO : {};
  var cats = (DATA.categorias || []).filter(function (c) { return c && c.id && c.nombre; });
  var idsCat = cats.map(function (c) { return String(c.id); });
  var prods = (DATA.productos || []).filter(function (p) {
    return p && p.id && p.nombre && idsCat.indexOf(String(p.categoria)) >= 0;
  });

  function cat(id) {
    for (var i = 0; i < cats.length; i++) if (cats[i].id === id) return cats[i];
    return null;
  }

  function producto(id) {
    for (var i = 0; i < prods.length; i++) if (prods[i].id === id) return prods[i];
    return null;
  }

  function deCat(id) {
    return id === "todo" ? prods : prods.filter(function (p) { return p.categoria === id; });
  }

  function tipos(lista) {
    var vistos = [];
    lista.forEach(function (p) {
      if (p.tipo && vistos.indexOf(p.tipo) < 0) vistos.push(p.tipo);
    });
    return vistos;
  }

  var dinero = window.Intl
    ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
    : { format: function (n) { return "$ " + n; } };

  function precio(p) {
    var n = Number(p.precio);
    return p.precio !== "" && p.precio != null && isFinite(n) && n > 0 ? dinero.format(n) : "";
  }

  function cuantos(n) {
    return n === 1 ? "1 producto" : n + " productos";
  }

  function dosCifras(n) { return n < 10 ? "0" + n : String(n); }

  var flecha = '<svg class="arrow" width="17" height="10" viewBox="0 0 17 10" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M0 5h15M11 1l4 4-4 4"/></svg>';

  /* ---------- Links de categorías ----------
     Header, menú, índice y footer salen de la misma lista: agregar una
     categoría en productos.js la suma en todos lados. */

  function renglon(c, i) {
    var n = deCat(c.id).length;
    var meta = n ? cuantos(n) : "Próximamente";
    return '<li><a class="index__row' + (n ? "" : " is-soon") + '" href="#' + esc(c.id) + '" data-cat="' + esc(c.id) + '">' +
      '<span class="index__n">' + dosCifras(i + 1) + "</span>" +
      '<span class="index__main"><span class="index__name">' + esc(c.nombre) + "</span>" +
      (c.bajada ? '<span class="index__sub">' + esc(c.bajada) + "</span>" : "") + "</span>" +
      '<span class="index__meta">' + meta + "</span>" + flecha +
      "</a></li>";
  }

  var navLinks = $("#navLinks");
  if (navLinks && cats.length) {
    navLinks.innerHTML = '<li><a href="#tienda" data-cat="todo">Tienda</a></li>' +
      cats.map(function (c) {
        return '<li><a href="#' + esc(c.id) + '" data-cat="' + esc(c.id) + '">' + esc(c.nombre) + "</a></li>";
      }).join("");
  }

  var footerCats = $("#footerCats");
  if (footerCats && cats.length) {
    footerCats.innerHTML = cats.map(function (c) {
      return '<li><a href="#' + esc(c.id) + '" data-cat="' + esc(c.id) + '">' + esc(c.nombre) + "</a></li>";
    }).join("");
  }

  var catsLista = $("#catsLista");
  if (catsLista) catsLista.innerHTML = cats.map(renglon).join("");

  var menuLinks = $("#menuLinks");
  if (menuLinks) {
    menuLinks.innerHTML = cats.map(renglon).join("") +
      '<li><a class="index__row" href="#tienda" data-cat="todo">' +
      '<span class="index__n">' + dosCifras(cats.length + 1) + "</span>" +
      '<span class="index__main"><span class="index__name">Todo</span></span>' +
      '<span class="index__meta">' + cuantos(prods.length) + "</span>" + flecha + "</a></li>";
  }

  /* ---------- Tienda: filtros y grilla ---------- */

  var filtro = { cat: "todo", tipo: "" };
  var chipsCat = $("#chipsCat");
  var chipsTipo = $("#chipsTipo");
  var grid = $("#grid");
  var cuenta = $("#shopCount");
  var vacio = $("#shopEmpty");

  function chip(valor, texto, activo, extra) {
    return '<button class="chip" type="button" data-valor="' + esc(valor) + '" aria-pressed="' + activo + '">' +
      esc(texto) + (extra ? '<span class="chip__n">' + extra + "</span>" : "") + "</button>";
  }

  /* Con una sola categoría, "Todo" y "Joyería" muestran siempre los
     mismos productos: el renglón de categoría no suma nada y sólo le
     agrega un clic al cliente para llegar al filtro por tipo. Se
     saca ese renglón y el filtro por tipo pasa a ser el único, visible
     desde el principio. Si en algún momento vuelve a haber más de una
     categoría, esto se desarma solo y el filtro de categoría reaparece. */
  var unaCategoria = cats.length <= 1;

  function pintarChips() {
    if (!chipsCat) return;
    chipsCat.hidden = unaCategoria;
    chipsCat.innerHTML = unaCategoria ? "" : chip("todo", "Todo", filtro.cat === "todo", prods.length) +
      cats.map(function (c) {
        var n = deCat(c.id).length;
        return chip(c.id, c.nombre, filtro.cat === c.id, n || "Pronto");
      }).join("");

    var t = unaCategoria || filtro.cat !== "todo" ? tipos(deCat(filtro.cat)) : [];
    chipsTipo.hidden = t.length < 2;
    chipsTipo.innerHTML = t.length < 2 ? "" : chip("", "Todos", !filtro.tipo) +
      t.map(function (x) { return chip(x, x, filtro.tipo === x); }).join("");
  }

  function tarjeta(p, i) {
    var c = cat(p.categoria);
    var etiqueta = p.estado === "agotado" ? "Agotado" : p.estado === "nuevo" ? "Nuevo" : "";
    var meta = [filtro.cat === "todo" && c ? c.nombre : "", p.tipo].filter(Boolean).join(" · ");
    return '<article class="card' + (p.estado === "agotado" ? " is-out" : "") + '" style="--i:' + Math.min(i, 8) + '">' +
      '<a class="card__link" href="#producto/' + encodeURIComponent(p.id) + '">' +
      '<div class="card__frame">' +
      (p.imagen ? '<img src="' + esc(p.imagen) + '" alt="' + esc(p.alt || p.nombre) + '" width="825" height="1100" loading="lazy">' : "") +
      (etiqueta ? '<span class="card__tag">' + etiqueta + "</span>" : "") +
      "</div>" +
      '<div class="card__info">' +
      (meta ? '<p class="card__meta">' + esc(meta) + "</p>" : "") +
      '<h3 class="card__name">' + esc(p.nombre) + "</h3>" +
      '<p class="card__price">' + (precio(p) || "Consultar") + "</p>" +
      "</div></a></article>";
  }

  function pintarGrilla() {
    if (!grid) return;
    var lista = deCat(filtro.cat).filter(function (p) { return !filtro.tipo || p.tipo === filtro.tipo; });
    grid.innerHTML = lista.map(tarjeta).join("");
    grid.hidden = !lista.length;
    if (cuenta) cuenta.textContent = lista.length ? cuantos(lista.length) : "";

    var c = cat(filtro.cat);
    vacio.hidden = !!lista.length;
    if (!lista.length) {
      var nombre = c ? c.nombre : "Esto";
      $("#shopEmptyTitulo").textContent = nombre;
      var cta = $("#shopEmptyCta");
      if (!G.whatsapp(cta, "Hola! Quiero que me avisen cuando haya " + nombre.toLowerCase() + " en " + G.marca + ".")) {
        cta.href = "#contacto";
      }
    }
  }

  function filtrar(catId, tipo) {
    filtro.cat = catId === "todo" || cat(catId) ? catId : "todo";
    filtro.tipo = tipo || "";
    pintarChips();
    pintarGrilla();
    $$("[data-cat]").forEach(function (a) {
      if (a.closest(".chips")) return;
      if (filtro.cat !== "todo" && a.dataset.cat === filtro.cat) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  function irATienda(suave) {
    var t = $("#tienda");
    if (t) t.scrollIntoView({ behavior: suave && !quieto ? "smooth" : "auto", block: "start" });
  }

  function hashDeFiltro() {
    return filtro.cat === "todo" ? "#tienda" : "#" + filtro.cat;
  }

  if (chipsCat) {
    chipsCat.addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      filtrar(b.dataset.valor, "");
      history.replaceState(null, "", hashDeFiltro());
    });
    chipsTipo.addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      filtrar(filtro.cat, b.dataset.valor);
    });
  }

  /* Cualquier link de categoría (header, índice, menú, footer) filtra
     y baja a la tienda. replaceState y no un salto de ancla: cambiar
     de filtro no tiene que llenar el historial. */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-cat]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
    e.preventDefault();
    cerrarMenu();
    filtrar(a.dataset.cat, "");
    history.replaceState(null, "", hashDeFiltro());
    irATienda(true);
  });

  /* ---------- Ficha de producto ---------- */

  var ficha = $("#ficha");
  var carrito = $("#carrito");
  var actual = null;
  var desdeLista = false;   // si la abrió un click, cerrar = volver atrás
  var cantidadFicha = 1;

  function bloquear(si) { root.classList.toggle("bloqueado", si); }

  /* Puede haber más de un <dialog> involucrado (ej. se abre el carrito
     con la ficha todavía cerrándose): sólo se desbloquea el scroll
     cuando ninguno de los tres queda abierto. */
  function algoAbierto() {
    return !!((ficha && ficha.open) || (menu && menu.open) || (carrito && carrito.open));
  }

  function mensaje(p, talle) {
    var c = cat(p.categoria);
    var link = location.href.split("#")[0] + "#producto/" + encodeURIComponent(p.id);
    if (p.estado === "agotado") {
      return "Hola! Avisame si vuelve a entrar: " + p.nombre + ". " + link;
    }
    return "Hola! Me interesa esto de " + G.marca + ": " + p.nombre +
      (c ? " (" + c.nombre + ")" : "") +
      (talle ? ", talle " + talle : "") +
      ". ¿Está disponible? " + link;
  }

  /* En stock, el botón principal agrega al carrito (no navega a
     ningún lado: data-modo lo marca para el click de más abajo) y
     abajo queda un link chico para quien prefiere preguntar antes de
     sumarlo. Agotado, el botón vuelve a ser el "avisame" de siempre. */
  function actualizarCta() {
    if (!actual) return;
    var elegido = ficha.querySelector('input[name="talle"]:checked');
    var cta = $("#fichaCta");
    var texto = $("#fichaCtaTexto");
    var consultar = $("#fichaConsultar");
    var qty = $("#fichaQty");
    $("#fichaAgregado").hidden = true;

    if (actual.estado === "agotado") {
      qty.hidden = true;
      consultar.hidden = true;
      cta.dataset.modo = "avisar";
      texto.textContent = "Avisame si vuelve";
      if (!G.whatsapp(cta, mensaje(actual, elegido ? elegido.value : ""))) {
        cta.href = "#contacto";
        cta.removeAttribute("target");
      }
    } else {
      qty.hidden = false;
      consultar.hidden = false;
      cta.dataset.modo = "carrito";
      cta.href = "#";
      cta.removeAttribute("target");
      texto.textContent = "Agregar al carrito";
      if (!G.whatsapp(consultar, mensaje(actual, elegido ? elegido.value : ""))) {
        consultar.href = "#contacto";
      }
    }
  }

  function abrirFicha(p) {
    if (!ficha || !p) return;
    actual = p;
    var c = cat(p.categoria);
    var img = $("#fichaImg");
    img.src = p.imagen || "data:,";
    img.alt = p.alt || p.nombre;
    $("#fichaCat").textContent = [c ? c.nombre : "", p.tipo].filter(Boolean).join(" · ");
    $("#fichaNombre").textContent = p.nombre;
    var pr = precio(p);
    var precioEl = $("#fichaPrecio");
    precioEl.textContent = p.estado === "agotado" ? "Agotado" : pr || "Precio a consultar";
    precioEl.classList.toggle("is-soft", p.estado === "agotado" || !pr);
    var det = $("#fichaDetalle");
    det.textContent = p.detalle || "";
    det.hidden = !p.detalle;

    var talles = Array.isArray(p.talles) ? p.talles.filter(Boolean) : [];
    var campoTalles = $("#fichaTalles");
    campoTalles.hidden = !talles.length || p.estado === "agotado";
    campoTalles.classList.remove("is-invalid");
    $("#fichaTallesError").hidden = true;
    $("#fichaTallesLista").innerHTML = talles.map(function (t, i) {
      return '<label class="size"><input type="radio" name="talle" value="' + esc(t) + '"' +
        (talles.length === 1 && i === 0 ? " checked" : "") + "><span>" + esc(t) + "</span></label>";
    }).join("");

    cantidadFicha = 1;
    $("#fichaCant").textContent = cantidadFicha;

    actualizarCta();

    if (!ficha.open) {
      if (ficha.showModal) ficha.showModal(); else ficha.setAttribute("open", "");
      bloquear(true);
    }
    ficha.scrollTop = 0;
  }

  function cerrarFichaVisual() {
    if (!ficha || !ficha.open) return;
    if (ficha.close) ficha.close(); else ficha.removeAttribute("open");
  }

  /* Cerrar desde la X, Esc o tocando afuera: si la ficha la abrió un
     click, se vuelve atrás en el historial (y hashchange la cierra);
     si se entró directo por el link, se reemplaza el hash. */
  function pedirCierre() {
    if (/^#producto\//.test(location.hash)) {
      if (desdeLista) { history.back(); return; }
      history.replaceState(null, "", hashDeFiltro());
    }
    cerrarFichaVisual();
  }

  if (ficha) {
    ficha.addEventListener("close", function () { actual = null; desdeLista = false; bloquear(algoAbierto()); });
    ficha.addEventListener("cancel", function (e) { e.preventDefault(); pedirCierre(); });
    ficha.addEventListener("click", function (e) { if (e.target === ficha) pedirCierre(); });
    ficha.addEventListener("change", function (e) {
      if (e.target.name !== "talle") return;
      $("#fichaTalles").classList.remove("is-invalid");
      $("#fichaTallesError").hidden = true;
      actualizarCta();
    });
    $("#cerrarFicha").addEventListener("click", pedirCierre);

    $("#fichaMenos").addEventListener("click", function () {
      cantidadFicha = Math.max(1, cantidadFicha - 1);
      $("#fichaCant").textContent = cantidadFicha;
    });
    $("#fichaMas").addEventListener("click", function () {
      cantidadFicha = Math.min(99, cantidadFicha + 1);
      $("#fichaCant").textContent = cantidadFicha;
    });

    $("#fichaCta").addEventListener("click", function (e) {
      var cta = e.currentTarget;
      if (cta.dataset.modo !== "carrito") {
        /* Modo "avisame": si no hay WhatsApp cargado el href quedó en
           #contacto, así que cerrar la ficha es ir a esa sección. */
        if (cta.getAttribute("href") === "#contacto") pedirCierre();
        return;
      }
      e.preventDefault();
      if (!actual) return;
      var talles = Array.isArray(actual.talles) ? actual.talles.filter(Boolean) : [];
      var elegido = ficha.querySelector('input[name="talle"]:checked');
      if (talles.length > 1 && !elegido) {
        $("#fichaTalles").classList.add("is-invalid");
        $("#fichaTallesError").hidden = false;
        return;
      }
      agregarAlCarrito(actual.id, elegido ? elegido.value : "", cantidadFicha);
      var agregado = $("#fichaAgregado");
      agregado.hidden = false;
      clearTimeout(agregado._tiempo);
      agregado._tiempo = setTimeout(function () { agregado.hidden = true; }, 2200);
    });
    $("#fichaConsultar").addEventListener("click", function (e) {
      if (e.currentTarget.getAttribute("href") === "#contacto") pedirCierre();
    });
  }

  if (grid) {
    grid.addEventListener("click", function (e) {
      if (e.target.closest(".card__link")) desdeLista = true;
    });
  }

  /* ---------- Menú del celular ---------- */

  var menu = $("#menu");
  var abrir = $("#abrirMenu");

  function cerrarMenu() {
    var x = $("#cerrarMenu");
    if (x) x.classList.remove("is-x");
    if (!menu || !menu.open) return;
    if (menu.close) menu.close(); else menu.removeAttribute("open");
  }

  if (menu && abrir) {
    /* Las rayitas se doblan hasta formar la X. La clase se pone un
       cuadro después de mostrar el panel: puesta en el mismo cuadro,
       el navegador no tiene un estado anterior desde donde animar y
       la X aparecería de golpe. */
    var cerrarBtn = $("#cerrarMenu");

    /* La foto de fondo del panel se precarga en un momento libre. Un
       fondo CSS dentro de un <dialog> cerrado no se descarga hasta que
       se muestra: sin esto la foto aparecería de golpe en medio del
       deslizamiento. */
    function precargarFondo() {
      var im = new Image();
      im.src = "img/menu-fondo.jpg";
    }
    if ("requestIdleCallback" in window) requestIdleCallback(precargarFondo, { timeout: 4000 });
    else setTimeout(precargarFondo, 2000);

    /* El grano de la página se esconde mientras el panel se mueve (ver
       html.anima-menu en el CSS). `close` salta apenas se pide cerrar,
       pero el panel sigue saliendo durante --t-menu: la clase se saca
       recién cuando termina, o el grano volvería a pintarse a mitad del
       movimiento y bajaría los cuadros justo ahí. */
    var timerGrano = null;
    function granoFuera(si) {
      clearTimeout(timerGrano);
      if (si) { root.classList.add("anima-menu"); return; }
      var ms = aMs(getComputedStyle(root).getPropertyValue("--t-menu"), 1100) + 150;
      timerGrano = setTimeout(function () { root.classList.remove("anima-menu"); }, ms);
    }

    abrir.addEventListener("click", function () {
      cerrarCarrito();
      granoFuera(true);
      if (menu.showModal) menu.showModal(); else menu.setAttribute("open", "");
      abrir.setAttribute("aria-expanded", "true");
      bloquear(true);
      requestAnimationFrame(function () { cerrarBtn.classList.add("is-x"); });
    });

    menu.addEventListener("close", function () {
      abrir.setAttribute("aria-expanded", "false");
      bloquear(algoAbierto());
      granoFuera(false);
    });

    /* Se saca al pedir cerrar, no al terminar: el panel tarda en
       salir deslizándose y la X se desarma a la vista mientras tanto. */
    menu.addEventListener("cancel", function () { cerrarBtn.classList.remove("is-x"); });
    cerrarBtn.addEventListener("click", cerrarMenu);
    menu.addEventListener("click", function (e) {
      if (e.target.closest('a[href^="#"]:not([data-cat])')) cerrarMenu();
    });
  }

  /* ---------- Secciones del menú (Colecciones / Sobre nosotros) ----------
     <details> abre y cierra de golpe: el navegador no anima el alto de
     algo que pasa de display:none a visible. Por eso se intercepta el
     click del <summary> y se anima a mano el alto y la opacidad del
     envoltorio .fold__panel.

     El atributo `open` va por detrás de la animación (se saca recién al
     terminar de plegar, así el contenido no desaparece antes de tiempo)
     y la clase `is-open` por delante (es lo que mueve el signo +/−). */

  var quietoMenu = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* Duración y curva salen de css/tienda.css (--t-fold, --ease-menu):
     un solo lugar para ajustarlas. Los números de abajo son sólo el
     respaldo si el navegador no resuelve las variables. */
  var estilo = getComputedStyle(document.documentElement);
  function aMs(v, resp) {
    v = String(v).trim();
    var n = parseFloat(v);
    if (!isFinite(n) || n <= 0) return resp;
    return /ms$/.test(v) ? n : n * 1000;
  }
  var DUR_FOLD = aMs(estilo.getPropertyValue("--t-fold"), 900);
  var CURVA_FOLD = estilo.getPropertyValue("--ease-menu").trim() || "cubic-bezier(.5,0,.2,1)";

  Array.prototype.forEach.call(document.querySelectorAll(".fold"), function (det) {
    var cab = det.querySelector("summary");
    var panel = det.querySelector(".fold__panel");
    if (!cab || !panel) return;
    var anim = null;

    function altoActual() { return panel.getBoundingClientRect().height; }

    function correr(desde, hasta, op0, op1, alTerminar) {
      if (anim) anim.cancel();
      if (quietoMenu) { alTerminar(); return; }
      anim = panel.animate(
        [{ height: desde + "px", opacity: op0 }, { height: hasta + "px", opacity: op1 }],
        { duration: DUR_FOLD, easing: CURVA_FOLD, fill: "both" }
      );
      var mia = anim;
      anim.onfinish = function () {
        if (anim !== mia) return;
        alTerminar();
        mia.cancel();
        anim = null;
      };
    }

    cab.addEventListener("click", function (e) {
      e.preventDefault();

      if (!det.classList.contains("is-open")) {
        /* Abrir. Si venía plegándose, sigue desde donde estaba. */
        var desde = anim ? altoActual() : 0;
        var op0 = anim ? parseFloat(getComputedStyle(panel).opacity) : 0;
        det.open = true;
        det.classList.add("is-open");
        correr(desde, panel.scrollHeight, op0, 1, function () {});
      } else {
        /* Cerrar. */
        det.classList.remove("is-open");
        correr(altoActual(), 0, parseFloat(getComputedStyle(panel).opacity) || 1, 0, function () {
          det.open = false;
        });
      }
    });
  });

  /* ---------- Carrito ----------
     Una línea por combinación producto+talle. Vive en localStorage: no
     hay servidor que lo guarde, así que no viaja entre dispositivos ni
     sobrevive a "borrar datos de navegación". Al finalizar el pedido
     arma un único WhatsApp con el detalle; no cobra nada por sí solo. */

  var CLAVE_CARRITO = "gs9_carrito";

  function leerCarrito() {
    try {
      var v = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || "[]");
      return Array.isArray(v)
        ? v.filter(function (l) { return l && l.id && l.cantidad > 0; })
        : [];
    } catch (e) { return []; }
  }

  function guardarCarrito() {
    try { localStorage.setItem(CLAVE_CARRITO, JSON.stringify(lineasCarrito)); } catch (e) {}
  }

  var lineasCarrito = leerCarrito();

  function claveLinea(id, talle) { return id + "|" + (talle || ""); }

  function buscarLinea(id, talle) {
    var k = claveLinea(id, talle);
    for (var i = 0; i < lineasCarrito.length; i++) {
      if (claveLinea(lineasCarrito[i].id, lineasCarrito[i].talle) === k) return lineasCarrito[i];
    }
    return null;
  }

  function agregarAlCarrito(id, talle, cantidad) {
    var linea = buscarLinea(id, talle);
    if (linea) linea.cantidad += cantidad;
    else lineasCarrito.push({ id: id, talle: talle || "", cantidad: cantidad });
    guardarCarrito();
    pintarCarrito();
  }

  function cambiarCantidadLinea(id, talle, delta) {
    var linea = buscarLinea(id, talle);
    if (!linea) return;
    linea.cantidad += delta;
    if (linea.cantidad <= 0) {
      lineasCarrito = lineasCarrito.filter(function (l) { return l !== linea; });
    }
    guardarCarrito();
    pintarCarrito();
  }

  function quitarLinea(id, talle) {
    var k = claveLinea(id, talle);
    lineasCarrito = lineasCarrito.filter(function (l) { return claveLinea(l.id, l.talle) !== k; });
    guardarCarrito();
    pintarCarrito();
  }

  function vaciarCarritoDatos() {
    lineasCarrito = [];
    guardarCarrito();
    pintarCarrito();
  }

  /* Cada línea junto con su producto; una línea cuyo producto ya no
     existe en productos.js (se borró del catálogo) se descarta sola. */
  function itemsCarrito() {
    return lineasCarrito.map(function (l) {
      var p = producto(l.id);
      return p ? { linea: l, producto: p } : null;
    }).filter(Boolean);
  }

  function totalesCarrito(items) {
    var total = 0, hayConsultar = false;
    items.forEach(function (it) {
      var n = Number(it.producto.precio);
      if (it.producto.precio !== "" && it.producto.precio != null && isFinite(n) && n > 0) {
        total += n * it.linea.cantidad;
      } else {
        hayConsultar = true;
      }
    });
    return { total: total, hayConsultar: hayConsultar };
  }

  function mensajeCarrito(items) {
    var renglones = items.map(function (it, i) {
      var p = it.producto, l = it.linea, pr = precio(p);
      return (i + 1) + ") " + p.nombre + (l.talle ? " (talle " + l.talle + ")" : "") +
        " — x" + l.cantidad + (pr ? " — " + pr + " c/u" : " — a consultar");
    });
    var t = totalesCarrito(items);
    var pie = "Total estimado: " + dinero.format(t.total) + (t.hayConsultar ? " + lo que esté a consultar" : "");
    return "Hola! Quiero hacer este pedido de " + G.marca + ":\n\n" + renglones.join("\n") + "\n\n" + pie;
  }

  function renglonCarrito(item) {
    var p = item.producto, l = item.linea;
    var pr = precio(p);
    var sub = pr ? dinero.format(Number(p.precio) * l.cantidad) : "A consultar";
    return '<li class="cart__item">' +
      (p.imagen ? '<img class="cart__item-img" src="' + esc(p.imagen) + '" alt="" width="124" height="164">' : "") +
      '<div class="cart__item-info">' +
      '<p class="cart__item-name">' + esc(p.nombre) + "</p>" +
      (l.talle ? '<p class="cart__item-meta">Talle ' + esc(l.talle) + "</p>" : "") +
      '<div class="cart__item-row">' +
      '<div class="qty" data-id="' + esc(l.id) + '" data-talle="' + esc(l.talle) + '">' +
      '<button class="qty__btn" type="button" data-accion="menos" aria-label="Restar uno">−</button>' +
      '<span class="qty__n">' + l.cantidad + "</span>" +
      '<button class="qty__btn" type="button" data-accion="mas" aria-label="Sumar uno">+</button>' +
      "</div>" +
      '<span class="cart__item-price">' + sub + "</span>" +
      "</div></div>" +
      '<button class="cart__item-quitar" type="button" data-id="' + esc(l.id) + '" data-talle="' + esc(l.talle) + '" aria-label="Quitar ' + esc(p.nombre) + '">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>' +
      "</button></li>";
  }

  function pintarBadge() {
    var n = lineasCarrito.reduce(function (acc, l) { return acc + l.cantidad; }, 0);
    var texto = n > 99 ? "99+" : String(n);

    var badge = $("#carritoN");
    if (badge) { badge.textContent = texto; badge.hidden = !n; }

  }

  function pintarCarrito() {
    pintarBadge();
    var lista = $("#carritoLista");
    if (!lista) return;
    var items = itemsCarrito();
    var hay = items.length > 0;

    lista.innerHTML = items.map(renglonCarrito).join("");
    lista.hidden = !hay;
    $("#carritoVacio").hidden = hay;
    $("#carritoFoot").hidden = !hay;
    if (!hay) return;

    var t = totalesCarrito(items);
    $("#carritoTotal").textContent = dinero.format(t.total);
    $("#carritoNota").hidden = !t.hayConsultar;

    var cta = $("#carritoCta");
    if (!G.whatsapp(cta, mensajeCarrito(items))) cta.href = "#contacto";
  }

  var abrirCarritoBtn = $("#abrirCarrito");

  function abrirCarrito() {
    if (!carrito) return;
    pintarCarrito();
    if (carrito.showModal) carrito.showModal(); else carrito.setAttribute("open", "");
    if (abrirCarritoBtn) abrirCarritoBtn.setAttribute("aria-expanded", "true");
    bloquear(true);
  }

  function cerrarCarrito() {
    if (!carrito || !carrito.open) return;
    if (carrito.close) carrito.close(); else carrito.removeAttribute("open");
  }

  if (carrito && abrirCarritoBtn) {
    abrirCarritoBtn.addEventListener("click", function () {
      cerrarFichaVisual();
      cerrarMenu();
      abrirCarrito();
    });
    carrito.addEventListener("close", function () {
      abrirCarritoBtn.setAttribute("aria-expanded", "false");
      bloquear(algoAbierto());
    });
    carrito.addEventListener("cancel", function () {
      /* Esc: el <dialog> ya se cierra solo; sólo falta el aria-expanded
         y el desbloqueo, que ya hace el listener de "close" de arriba. */
    });
    carrito.addEventListener("click", function (e) {
      if (e.target === carrito) { cerrarCarrito(); return; }

      var qtyBtn = e.target.closest(".qty__btn");
      if (qtyBtn) {
        var caja = qtyBtn.closest(".qty");
        cambiarCantidadLinea(caja.dataset.id, caja.dataset.talle, qtyBtn.dataset.accion === "mas" ? 1 : -1);
        return;
      }
      var quitar = e.target.closest(".cart__item-quitar");
      if (quitar) quitarLinea(quitar.dataset.id, quitar.dataset.talle);
    });
    $("#cerrarCarrito").addEventListener("click", cerrarCarrito);
    $("#vaciarCarrito").addEventListener("click", function () {
      if (lineasCarrito.length && confirm("¿Vaciar el carrito?")) vaciarCarritoDatos();
    });
    $("#carritoVacioCta").addEventListener("click", cerrarCarrito);
    $("#carritoCta").addEventListener("click", function (e) {
      if (e.currentTarget.getAttribute("href") === "#contacto") cerrarCarrito();
    });
  }

  pintarBadge();

  /* ---------- Hash: categoría o producto ---------- */

  function leerHash(inicial) {
    var h = decodeURIComponent(location.hash.slice(1));
    var m = /^producto\/(.+)$/.exec(h);
    if (m) {
      var p = producto(m[1]);
      if (p) {
        if (inicial) { filtrar(p.categoria, ""); irATienda(false); }
        abrirFicha(p);
        return;
      }
    }
    var veniaDeFicha = ficha && ficha.open;
    cerrarFichaVisual();
    if (h === "tienda" || cat(h)) {
      var destino = h === "tienda" ? "todo" : h;
      /* Al volver de una ficha, quedarse donde estaba y con los mismos
         filtros (incluido el de tipo). */
      if (veniaDeFicha && destino === filtro.cat) return;
      filtrar(destino, "");
      if (!veniaDeFicha && h !== "tienda") irATienda(!inicial);
    }
  }

  window.addEventListener("hashchange", function () { leerHash(false); });

  filtrar("todo", "");
  leerHash(true);
})();
