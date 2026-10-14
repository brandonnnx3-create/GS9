/* ============================================================
   G.S.9 — CATÁLOGO
   Arma el índice de categorías, los filtros, la grilla de
   productos, la página de cada uno y el menú del celular, todo a
   partir de js/productos.js.

   Links que entiende la página:
     #joyas                   la tienda filtrada por esa categoría
     #producto/<id>           la página de ese producto
   Así se puede pasar por Instagram el link de una categoría o de
   un producto puntual. Entrar a un producto suma un paso al
   historial: el botón "atrás" del celular vuelve a la tienda.

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

  function tallesDe(p) {
    return Array.isArray(p.talles) ? p.talles.filter(Boolean) : [];
  }

  /* conAgregar suma el botón "+ Agregar" (lo usa "Seguí descubriendo").
     Agotado no lleva botón; con más de un talle tampoco, porque hay
     que elegirlo adentro del producto. */
  function tarjeta(p, i, conAgregar) {
    var c = cat(p.categoria);
    var etiqueta = p.estado === "agotado" ? "Agotado" : p.estado === "nuevo" ? "Nuevo" : "";
    var meta = [filtro.cat === "todo" && c ? c.nombre : "", p.tipo].filter(Boolean).join(" · ");
    var agregar = conAgregar && p.estado !== "agotado" && tallesDe(p).length < 2
      ? '<button class="card__add" type="button" data-agregar="' + esc(p.id) + '">+ Agregar</button>'
      : "";
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
      "</div></a>" + agregar + "</article>";
  }

  function pintarGrilla() {
    if (!grid) return;
    var lista = deCat(filtro.cat).filter(function (p) { return !filtro.tipo || p.tipo === filtro.tipo; });
    grid.innerHTML = lista.map(function (p, i) { return tarjeta(p, i); }).join("");
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
    /* replaceState no dispara hashchange: si se viene de un producto,
       hay que salir de esa página a mano antes de bajar a la tienda. */
    var deProducto = enProducto();
    if (deProducto) salirProducto("", true);
    filtrar(a.dataset.cat, "");
    history.replaceState(null, "", hashDeFiltro());
    if (deProducto) sinDeslizar(function () { irATienda(false); });
    else irATienda(true);
  });

  /* ---------- Página de producto ----------
     #producto/<id> muestra la página del producto en lugar del resto
     (html.ver-producto esconde las otras secciones; header y footer
     quedan). Al volver, la tienda reaparece donde estaba el cliente.

     Entrar desde una tarjeta de la tienda deja una sola entrada en el
     historial: el "atrás" del celular y el link "Tienda" vuelven a la
     grilla. Pasar de un producto a otro desde "Seguí descubriendo"
     reemplaza esa entrada en vez de apilar una por cada uno. */

  var ficha = $("#ficha");
  var carrito = $("#carrito");
  var pista = $("#fichaGaleria");
  var miniaturas = $("#fichaMiniaturas");
  var actual = null;
  var desdeLista = false;     // la abrió un click en la tienda: volver = atrás en el historial
  var posicionLista = null;   // dónde estaba la página antes de entrar al producto
  var focoPrevio = null;
  var cantidadFicha = 1;
  var tiempoAgregado = null;
  var tituloBase = document.title;

  function bloquear(si) { root.classList.toggle("bloqueado", si); }

  /* Menú y carrito son <dialog>: sólo se desbloquea el scroll cuando
     ninguno de los dos queda abierto. */
  function algoAbierto() {
    return !!((menu && menu.open) || (carrito && carrito.open));
  }

  function enProducto() { return root.classList.contains("ver-producto"); }

  /* El html tiene scroll-behavior: smooth para los links internos. Al
     pasar entre la tienda y un producto el salto tiene que ser
     instantáneo: deslizar toda la página hasta donde estaba se vería
     como un mareo, no como volver. */
  function sinDeslizar(fn) {
    var antes = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    fn();
    root.style.scrollBehavior = antes;
  }

  /* Después del salto, un cuadro más tarde se confirma que la página
     siga ahí: un deslizamiento suave que venía en curso (por ejemplo
     de un link interno tocado justo antes) o el propio navegador
     restaurando el scroll al ir "atrás" pueden moverla después. */
  function fijarScroll() {
    var y = window.pageYOffset || root.scrollTop;
    requestAnimationFrame(function () {
      if (Math.abs((window.pageYOffset || root.scrollTop) - y) > 1) {
        sinDeslizar(function () { window.scrollTo(0, y); });
      }
    });
  }

  function entrarProducto(guardarPosicion) {
    if (enProducto()) return;
    posicionLista = guardarPosicion ? (window.pageYOffset || root.scrollTop) : null;
    focoPrevio = document.activeElement;
    root.classList.add("ver-producto");
    ficha.hidden = false;
  }

  /* h: el hash nuevo, sin "#". Si apunta a una sección (ej. #contacto
     desde el menú) se va ahí; si no, a donde estaba la tienda; y si se
     entró directo por el link del producto, al principio de la tienda.
     sinScroll lo usa quien se ocupa del scroll por su cuenta. */
  function salirProducto(h, sinScroll) {
    if (!enProducto()) return;
    root.classList.remove("ver-producto");
    ficha.hidden = true;
    document.title = tituloBase;
    actual = null;
    desdeLista = false;
    var pos = posicionLista;
    posicionLista = null;
    if (!sinScroll) {
      var destino = h && h !== "tienda" && !cat(h) ? document.getElementById(h) : null;
      sinDeslizar(function () {
        if (destino) destino.scrollIntoView({ block: "start" });
        else if (pos !== null) window.scrollTo(0, pos);
        else irATienda(false);
      });
      fijarScroll();
    }
    if (focoPrevio && focoPrevio.focus && document.contains(focoPrevio)) focoPrevio.focus({ preventScroll: true });
    focoPrevio = null;
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
    clearTimeout(tiempoAgregado);
    $("#fichaAgregado").textContent = "";

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

  /* Fotos: la principal (imagen) más las extra (fotos), si las hay.
     Con una sola foto no aparecen miniaturas. */
  function pintarGaleria(p) {
    var fotos = [p.imagen].concat(Array.isArray(p.fotos) ? p.fotos : []).filter(Boolean);
    var alt = p.alt || p.nombre;
    pista.innerHTML = fotos.map(function (src, i) {
      return '<div class="pdp__slide"><img src="' + esc(src) + '" alt="' +
        esc(i ? alt + " (foto " + (i + 1) + ")" : alt) + '" width="825" height="1100"' +
        (i ? ' loading="lazy"' : "") + "></div>";
    }).join("");
    pista.scrollLeft = 0;
    miniaturas.hidden = fotos.length < 2;
    miniaturas.innerHTML = fotos.length < 2 ? "" : fotos.map(function (src, i) {
      return '<button class="pdp__mini" type="button" data-i="' + i + '" aria-label="Ver foto ' + (i + 1) + '"' +
        (i ? "" : ' aria-current="true"') + '><img src="' + esc(src) + '" alt="" width="825" height="1100" loading="lazy"></button>';
    }).join("");
  }

  /* Los consejos de la sección "Cómo cuidar las joyas", copiados de
     ahí una sola vez: si se cambian en el HTML, cambian en los dos
     lados. */
  function pintarCuidados() {
    var items = $$(".care__item");
    var lista = $("#fichaCuidadosLista");
    if (!items.length || !lista) return;
    lista.innerHTML = items.map(function (li) {
      var h = li.querySelector(".care__h");
      var t = li.querySelector(".care__p");
      return "<li><b>" + esc(h ? h.textContent.trim() : "") + ".</b> " + esc(t ? t.textContent.trim() : "") + "</li>";
    }).join("");
    $("#fichaCuidados").hidden = false;
  }

  /* Hasta cuatro, primero los del mismo tipo y arrancando por los que
     siguen a este en el catálogo: así cada producto muestra otros
     distintos y no siempre los mismos cuatro primeros. Si del mismo
     tipo hay menos, se completa con el resto. */
  function relacionadosDe(p) {
    var i = prods.indexOf(p);
    var orden = prods.slice(i + 1).concat(prods.slice(0, i));
    return orden.filter(function (x) { return x.tipo === p.tipo; })
      .concat(orden.filter(function (x) { return x.tipo !== p.tipo; }))
      .slice(0, 4);
  }

  function abrirFicha(p, inicial) {
    if (!ficha || !p) return;
    actual = p;
    var c = cat(p.categoria);
    var agotado = p.estado === "agotado";

    pintarGaleria(p);
    $("#fichaCat").textContent = unaCategoria
      ? (p.tipo || (c ? c.nombre : ""))
      : [c ? c.nombre : "", p.tipo].filter(Boolean).join(" · ");
    $("#fichaNombre").textContent = p.nombre;

    var det = $("#fichaDetalle");
    det.textContent = p.detalle || "";
    det.hidden = !p.detalle;

    var estado = $("#fichaEstado");
    estado.textContent = agotado ? "Agotado" : "Disponible";
    estado.classList.toggle("is-out", agotado);

    var pr = precio(p);
    var precioEl = $("#fichaPrecio");
    precioEl.textContent = pr || "A consultar";
    precioEl.classList.toggle("is-soft", !pr);

    $("#fichaLargo").hidden = !p.largo;
    $("#fichaLargoValor").textContent = p.largo || "";

    var talles = tallesDe(p);
    var campoTalles = $("#fichaTalles");
    campoTalles.hidden = !talles.length || agotado;
    campoTalles.classList.remove("is-invalid");
    $("#fichaTallesError").hidden = true;
    $("#fichaTallesLista").innerHTML = talles.map(function (t, i) {
      return '<label class="size"><input type="radio" name="talle" value="' + esc(t) + '"' +
        (talles.length === 1 && i === 0 ? " checked" : "") + "><span>" + esc(t) + "</span></label>";
    }).join("");

    cantidadFicha = 1;
    $("#fichaCant").textContent = cantidadFicha;
    actualizarCta();

    var relacionados = relacionadosDe(p);
    $("#fichaSimilares").hidden = !relacionados.length;
    $("#fichaSimilaresGrid").innerHTML = relacionados.map(function (x, i) { return tarjeta(x, i, true); }).join("");

    entrarProducto(!inicial);
    document.title = p.nombre + " — " + G.marca;
    sinDeslizar(function () { window.scrollTo(0, 0); });
    fijarScroll();
    $("#fichaNombre").focus({ preventScroll: true });
  }

  /* Link "Tienda" de arriba: si se entró tocando una tarjeta, es lo
     mismo que el "atrás" del celular (y hashchange hace el resto); si
     se entró directo por un link, se reemplaza el hash y se baja a la
     tienda. */
  function pedirCierre(e) {
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0)) return;
    if (e) e.preventDefault();
    if (/^#producto\//.test(location.hash)) {
      if (desdeLista) { history.back(); return; }
      history.replaceState(null, "", hashDeFiltro());
    }
    salirProducto(location.hash.slice(1));
  }

  if (ficha) {
    pintarCuidados();

    ficha.addEventListener("change", function (e) {
      if (e.target.name !== "talle") return;
      $("#fichaTalles").classList.remove("is-invalid");
      $("#fichaTallesError").hidden = true;
      actualizarCta();
    });
    $("#cerrarFicha").addEventListener("click", pedirCierre);

    /* Al deslizar las fotos, la miniatura marcada sigue a la que se ve. */
    var pendienteGaleria = false;
    pista.addEventListener("scroll", function () {
      if (pendienteGaleria || miniaturas.hidden) return;
      pendienteGaleria = true;
      requestAnimationFrame(function () {
        pendienteGaleria = false;
        var i = Math.round(pista.scrollLeft / Math.max(pista.clientWidth, 1));
        $$(".pdp__mini", miniaturas).forEach(function (b, j) {
          if (j === i) b.setAttribute("aria-current", "true");
          else b.removeAttribute("aria-current");
        });
      });
    }, { passive: true });

    miniaturas.addEventListener("click", function (e) {
      var b = e.target.closest(".pdp__mini");
      if (!b) return;
      pista.scrollTo({ left: Number(b.dataset.i) * pista.clientWidth, behavior: quieto ? "auto" : "smooth" });
    });

    $("#fichaSimilaresGrid").addEventListener("click", function (e) {
      var boton = e.target.closest(".card__add");
      if (boton) {
        var q = producto(boton.dataset.agregar);
        if (!q) return;
        var t = tallesDe(q);
        agregarAlCarrito(q.id, t.length === 1 ? t[0] : "", 1);
        boton.textContent = "Agregado ✓";
        boton.classList.add("is-ok");
        clearTimeout(boton._tiempo);
        boton._tiempo = setTimeout(function () {
          boton.textContent = "+ Agregar";
          boton.classList.remove("is-ok");
        }, 1800);
        return;
      }
      var a = e.target.closest(".card__link");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
      e.preventDefault();
      var p = producto(decodeURIComponent(a.getAttribute("href").replace(/^#producto\//, "")));
      if (!p) return;
      abrirFicha(p);
      history.replaceState(null, "", "#producto/" + encodeURIComponent(p.id));
    });

    $("#fichaMenos").addEventListener("click", function () {
      cantidadFicha = Math.max(1, cantidadFicha - 1);
      $("#fichaCant").textContent = cantidadFicha;
    });
    $("#fichaMas").addEventListener("click", function () {
      cantidadFicha = Math.min(99, cantidadFicha + 1);
      $("#fichaCant").textContent = cantidadFicha;
    });

    /* Modo "avisame" sin WhatsApp cargado: el href quedó en #contacto y
       el propio link lleva ahí (hashchange sale del producto). */
    $("#fichaCta").addEventListener("click", function (e) {
      if (e.currentTarget.dataset.modo !== "carrito") return;
      e.preventDefault();
      if (!actual) return;
      var talles = tallesDe(actual);
      var elegido = ficha.querySelector('input[name="talle"]:checked');
      if (talles.length > 1 && !elegido) {
        $("#fichaTalles").classList.add("is-invalid");
        $("#fichaTallesError").hidden = false;
        return;
      }
      agregarAlCarrito(actual.id, elegido ? elegido.value : "", cantidadFicha);
      var texto = $("#fichaCtaTexto");
      texto.textContent = "Agregado ✓";
      $("#fichaAgregado").textContent = "Agregado al carrito";
      clearTimeout(tiempoAgregado);
      tiempoAgregado = setTimeout(function () {
        texto.textContent = "Agregar al carrito";
        $("#fichaAgregado").textContent = "";
      }, 1800);
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
    /* El carrito se abre encima de lo que haya, incluida la página de
       un producto: al cerrarlo se sigue ahí mismo. */
    abrirCarritoBtn.addEventListener("click", function () {
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
        if (inicial) filtrar(p.categoria, "");
        abrirFicha(p, inicial);
        return;
      }
    }
    var veniaDeProducto = enProducto();
    salirProducto(h);
    if (h === "tienda" || cat(h)) {
      var destino = h === "tienda" ? "todo" : h;
      /* Al volver de un producto, quedarse donde estaba y con los
         mismos filtros (incluido el de tipo). */
      if (veniaDeProducto && destino === filtro.cat) return;
      filtrar(destino, "");
      if (!veniaDeProducto && h !== "tienda") irATienda(!inicial);
    }
  }

  window.addEventListener("hashchange", function () { leerHash(false); });

  filtrar("todo", "");
  leerHash(true);
})();
