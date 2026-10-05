/* ============================================================
   G.S.9 — CATÁLOGO
   Arma el índice de categorías, los filtros, la grilla de
   productos, la ficha de cada uno y el menú del celular, todo a
   partir de js/productos.js.

   Links que entiende la página:
     #joyas, #ropa…           la tienda filtrada por esa categoría
     #producto/<id>           la ficha de ese producto, abierta
   Así se puede pasar por Instagram el link de una categoría o de
   un producto puntual. La ficha suma un paso al historial: el
   botón "atrás" del celular la cierra.
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
    return '<li><a class="index__row' + (n ? "" : " is-soon") + '" href="#' + esc(c.id) + '" data-cat="' + esc(c.id) + '"' +
      (c.imagen ? ' data-img="' + esc(c.imagen) + '"' : "") + ">" +
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
      '<span class="index__meta">' + cuantos(prods.length) + "</span>" + flecha + "</a></li>" +
      '<li><a class="index__row" href="#contacto">' +
      '<span class="index__n">' + dosCifras(cats.length + 2) + "</span>" +
      '<span class="index__main"><span class="index__name">Contacto</span></span>' +
      '<span class="index__meta"></span>' + flecha + "</a></li>";
  }

  /* ---------- Foto que asoma en el índice ----------
     Sólo con mouse: sigue al puntero mientras está sobre una categoría
     que tiene foto. En pantallas táctiles no aparece. */

  var peek = $("#catsPeek");
  var finoMQ = window.matchMedia ? window.matchMedia("(hover: hover) and (pointer: fine)") : null;
  if (peek && catsLista && finoMQ) {
    var peekImg = peek.querySelector("img");
    catsLista.addEventListener("pointerover", function (e) {
      if (!finoMQ.matches) return;
      var fila = e.target.closest(".index__row");
      if (!fila || !fila.dataset.img) { peek.classList.remove("is-on"); return; }
      if (peekImg.getAttribute("src") !== fila.dataset.img) peekImg.src = fila.dataset.img;
      peek.classList.add("is-on");
    });
    catsLista.addEventListener("pointerleave", function () { peek.classList.remove("is-on"); });
    catsLista.addEventListener("pointermove", function (e) {
      if (!finoMQ.matches) return;
      var r = peek.parentNode.getBoundingClientRect();
      peek.style.setProperty("--x", (e.clientX - r.left) + "px");
      peek.style.setProperty("--y", (e.clientY - r.top) + "px");
    });
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

  function pintarChips() {
    if (!chipsCat) return;
    chipsCat.innerHTML = chip("todo", "Todo", filtro.cat === "todo", prods.length) +
      cats.map(function (c) {
        var n = deCat(c.id).length;
        return chip(c.id, c.nombre, filtro.cat === c.id, n || "Pronto");
      }).join("");

    var t = filtro.cat === "todo" ? [] : tipos(deCat(filtro.cat));
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
  var actual = null;
  var desdeLista = false;   // si la abrió un click, cerrar = volver atrás

  function bloquear(si) { root.classList.toggle("bloqueado", si); }

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

  function actualizarCta() {
    if (!actual) return;
    var elegido = ficha.querySelector('input[name="talle"]:checked');
    var cta = $("#fichaCta");
    var texto = $("#fichaCtaTexto");
    texto.textContent = actual.estado === "agotado" ? "Avisame si vuelve" : "Consultar por WhatsApp";
    if (!G.whatsapp(cta, mensaje(actual, elegido ? elegido.value : ""))) {
      cta.href = "#contacto";
      cta.removeAttribute("target");
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
    $("#fichaTalles").hidden = !talles.length || p.estado === "agotado";
    $("#fichaTallesLista").innerHTML = talles.map(function (t, i) {
      return '<label class="size"><input type="radio" name="talle" value="' + esc(t) + '"' +
        (talles.length === 1 && i === 0 ? " checked" : "") + "><span>" + esc(t) + "</span></label>";
    }).join("");
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
    ficha.addEventListener("close", function () { actual = null; desdeLista = false; bloquear(false); });
    ficha.addEventListener("cancel", function (e) { e.preventDefault(); pedirCierre(); });
    ficha.addEventListener("click", function (e) { if (e.target === ficha) pedirCierre(); });
    ficha.addEventListener("change", function (e) { if (e.target.name === "talle") actualizarCta(); });
    $("#cerrarFicha").addEventListener("click", pedirCierre);
    $("#fichaCta").addEventListener("click", function () {
      if ($("#fichaCta").getAttribute("href") === "#contacto") pedirCierre();
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
    if (!menu || !menu.open) return;
    if (menu.close) menu.close(); else menu.removeAttribute("open");
  }

  if (menu && abrir) {
    abrir.addEventListener("click", function () {
      if (menu.showModal) menu.showModal(); else menu.setAttribute("open", "");
      abrir.setAttribute("aria-expanded", "true");
      bloquear(true);
    });
    menu.addEventListener("close", function () {
      abrir.setAttribute("aria-expanded", "false");
      if (!ficha || !ficha.open) bloquear(false);
    });
    $("#cerrarMenu").addEventListener("click", cerrarMenu);
    menu.addEventListener("click", function (e) {
      if (e.target.closest('a[href^="#"]:not([data-cat])')) cerrarMenu();
    });
    /* Si la pantalla se agranda con el menú abierto, el header vuelve a
       mostrar los links: el menú sobra. */
    var anchoMQ = window.matchMedia ? window.matchMedia("(min-width: 961px)") : null;
    if (anchoMQ && anchoMQ.addEventListener) {
      anchoMQ.addEventListener("change", function (e) { if (e.matches) cerrarMenu(); });
    }
  }

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
