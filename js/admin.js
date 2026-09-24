/* ============================================================
   G.S.9 — PANEL
   Edita js/textos.js (las frases) y js/config.js (el contacto) y
   los publica como commits en el repositorio, con la API de
   GitHub y el token de quien administra. GitHub Pages redespliega
   solo en cada commit.

   No hay servidor: la única llave es el token. Una contraseña en
   una página estática no protege nada (se saltea desde el
   navegador), por eso no hay una.
   ============================================================ */

(function () {
  "use strict";

  var REPO = { owner: "brandonnnx3-create", name: "GS9" };
  var ARCHIVOS = {
    textos: { ruta: "js/textos.js", variable: "TEXTOS", mensaje: "Panel: actualizar frases" },
    config: { ruta: "js/config.js", variable: "CONFIG", mensaje: "Panel: actualizar contacto" },
  };
  var CLAVE_TOKEN = "gs9_panel_token";

  var CAMPOS_FRASES = [
    { k: "heroTitulo", label: "Título principal", tipo: "lineas", max: 16,
      ayuda: "La frase más grande de la página. Un renglón por línea." },
    { k: "heroSobre", label: "Texto chico arriba del título", tipo: "texto" },
    { k: "heroBajada", label: "Bajada del título", tipo: "area" },
    { k: "frase", label: "Frase de la franja", tipo: "area",
      ayuda: "La frase grande que aparece sola, entre la portada y la galería." },
    { k: "galeriaTitulo", label: "Título de la galería", tipo: "texto" },
    { k: "contactoTitulo", label: "Título del contacto", tipo: "lineas", max: 18,
      ayuda: "Un renglón por línea." },
    { k: "contactoTexto", label: "Texto del contacto", tipo: "area" },
    { k: "footerFrase", label: "Frase del footer", tipo: "texto" },
    { k: "cinta", label: "Cinta que se mueve", tipo: "lista",
      ayuda: "Una frase por renglón. Pasan en bucle debajo de la portada." },
  ];

  var CAMPOS_CONTACTO = [
    { k: "whatsapp", label: "WhatsApp", tipo: "texto", modo: "tel",
      ayuda: "Sólo números: 54 + 9 + característica sin el 0 + número sin el 15. Ej: 5491123456789.",
      limpiar: function (v) { return v.replace(/\D/g, ""); },
      validar: function (v) { return !v || /^549\d{8,11}$/.test(v) ? "" : "Tiene que empezar con 549 y tener entre 11 y 14 números."; } },
    { k: "instagram", label: "Instagram", tipo: "texto",
      ayuda: "El usuario, sin @. Vacío = no se muestra.",
      limpiar: function (v) {
        return v.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/\/.*$/, "");
      },
      validar: function (v) { return !v || /^[A-Za-z0-9._]{1,30}$/.test(v) ? "" : "Sólo letras, números, punto y guion bajo."; } },
    { k: "email", label: "Email", tipo: "texto", modo: "email",
      ayuda: "Vacío = no se muestra.",
      limpiar: function (v) { return v.trim(); },
      validar: function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Revisá el email: falta el @ o el punto."; } },
    { k: "ciudad", label: "Ciudad", tipo: "texto" },
  ];

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Estado ---------- */

  var token = "";
  var rama = "";
  var datos = { textos: null, config: null };        // lo que está publicado
  var editado = { textos: null, config: null };      // lo que hay en pantalla
  var sha = { textos: "", config: "" };
  var encabezado = { textos: "", config: "" };
  var publicando = false;

  /* ---------- GitHub ---------- */

  function gh(ruta, opciones) {
    var o = opciones || {};
    return fetch("https://api.github.com" + ruta, {
      method: o.method || "GET",
      cache: "no-store",
      headers: Object.assign({
        "Accept": "application/vnd.github+json",
        "Authorization": "Bearer " + token,
        "X-GitHub-Api-Version": "2022-11-28",
      }, o.body ? { "Content-Type": "application/json" } : {}),
      body: o.body ? JSON.stringify(o.body) : undefined,
    }).then(function (r) {
      if (r.ok) return r.json();
      return r.json().catch(function () { return {}; }).then(function (j) {
        var e = new Error(j.message || ("HTTP " + r.status));
        e.status = r.status;
        throw e;
      });
    });
  }

  function mensajeError(e) {
    if (!e || !e.status) return "No hay conexión con GitHub. Revisá internet y probá de nuevo.";
    if (e.status === 401) return "El token no es válido o ya venció. Sacá uno nuevo.";
    if (e.status === 403 || e.status === 404) {
      return "El token no tiene acceso a GS9. Revisá que tenga elegido el repositorio GS9 y el permiso Contents: Read and write.";
    }
    if (e.status === 409 || e.status === 422) {
      return "El archivo cambió en GitHub mientras editabas. Recargá la página y volvé a hacer el cambio.";
    }
    return "GitHub respondió un error (" + e.status + "): " + e.message;
  }

  /* UTF-8 ⇄ base64, que es como la API manda y recibe los archivos. */
  function aBase64(texto) {
    var bytes = new TextEncoder().encode(texto);
    var bin = "";
    for (var i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin);
  }

  function deBase64(b64) {
    var bin = atob(b64.replace(/\s/g, ""));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  /* Los archivos son `const NOMBRE = {JSON};` con un comentario arriba.
     Se conserva el comentario tal cual y se reescribe sólo el JSON. */
  function separar(texto, variable) {
    var inicio = texto.indexOf("const " + variable);
    if (inicio < 0) throw new Error("No encuentro " + variable + " en el archivo.");
    var a = texto.indexOf("{", inicio);
    var b = texto.lastIndexOf("}");
    try {
      return { encabezado: texto.slice(0, inicio), datos: JSON.parse(texto.slice(a, b + 1)) };
    } catch (err) {
      throw new Error("El archivo de " + variable + " tiene un error de formato (¿se editó a mano?).");
    }
  }

  function armar(clave) {
    var f = ARCHIVOS[clave];
    return encabezado[clave] + "const " + f.variable + " = " + JSON.stringify(editado[clave], null, 2) + ";\n";
  }

  function leer(clave) {
    var f = ARCHIVOS[clave];
    return gh("/repos/" + REPO.owner + "/" + REPO.name + "/contents/" + f.ruta + "?ref=" + encodeURIComponent(rama))
      .then(function (r) {
        var partes = separar(deBase64(r.content), f.variable);
        sha[clave] = r.sha;
        encabezado[clave] = partes.encabezado;
        datos[clave] = partes.datos;
        editado[clave] = JSON.parse(JSON.stringify(partes.datos));
      });
  }

  function escribir(clave) {
    var f = ARCHIVOS[clave];
    return gh("/repos/" + REPO.owner + "/" + REPO.name + "/contents/" + f.ruta, {
      method: "PUT",
      body: { message: f.mensaje, content: aBase64(armar(clave)), sha: sha[clave], branch: rama },
    }).then(function (r) {
      sha[clave] = r.content.sha;
      datos[clave] = JSON.parse(JSON.stringify(editado[clave]));
    });
  }

  /* ---------- Conexión ---------- */

  function guardarToken(t, recordar) {
    try {
      sessionStorage.removeItem(CLAVE_TOKEN);
      localStorage.removeItem(CLAVE_TOKEN);
      (recordar ? localStorage : sessionStorage).setItem(CLAVE_TOKEN, t);
    } catch (e) {}
  }

  function tokenGuardado() {
    try { return localStorage.getItem(CLAVE_TOKEN) || sessionStorage.getItem(CLAVE_TOKEN) || ""; }
    catch (e) { return ""; }
  }

  function olvidarToken() {
    try { localStorage.removeItem(CLAVE_TOKEN); sessionStorage.removeItem(CLAVE_TOKEN); } catch (e) {}
  }

  function conectar(t, recordar) {
    token = t.trim();
    var msg = $("#msgConexion");
    msg.className = "p-msg";
    msg.textContent = "Conectando…";
    $("#conectar").disabled = true;

    return gh("/repos/" + REPO.owner + "/" + REPO.name)
      .then(function (repo) {
        if (!repo.permissions || !repo.permissions.push) {
          var e = new Error("sin permiso de escritura"); e.status = 403; throw e;
        }
        rama = repo.default_branch;
        return Promise.all([leer("textos"), leer("config")]);
      })
      .then(function () {
        if (recordar !== undefined) guardarToken(token, recordar);
        msg.textContent = "";
        abrirEditor();
      })
      .catch(function (e) {
        token = "";
        msg.className = "p-msg p-msg--error";
        /* Errores de red (TypeError) y de GitHub van traducidos; los de
           formato del archivo ya vienen en castellano. */
        msg.textContent = e.status || e.name === "TypeError" || !e.message ? mensajeError(e) : e.message;
        if (e.status === 401 || e.status === 403 || e.status === 404) olvidarToken();
      })
      .then(function () { $("#conectar").disabled = false; });
  }

  /* ---------- Formularios ---------- */

  function valorEnCampo(campo, valor) {
    if (campo.tipo === "lista") return (valor || []).join("\n");
    return valor == null ? "" : String(valor);
  }

  function valorDeCampo(campo, texto) {
    if (campo.tipo === "lista") {
      return texto.split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
    }
    if (campo.tipo === "lineas") {
      return texto.split("\n").map(function (l) { return l.trim(); }).filter(Boolean).join("\n");
    }
    var v = campo.limpiar ? campo.limpiar(texto) : texto.trim();
    return v;
  }

  function crearCampos(contenedor, campos, clave) {
    contenedor.textContent = "";
    campos.forEach(function (campo) {
      var id = "f_" + campo.k;
      var envoltura = document.createElement("div");
      envoltura.className = "p-field";

      var label = document.createElement("label");
      label.className = "p-label";
      label.htmlFor = id;
      label.textContent = campo.label;
      envoltura.appendChild(label);

      var multilinea = campo.tipo === "area" || campo.tipo === "lineas" || campo.tipo === "lista";
      var input = document.createElement(multilinea ? "textarea" : "input");
      input.className = "p-input";
      input.id = id;
      if (multilinea) {
        input.rows = campo.tipo === "lista" ? 5 : campo.tipo === "lineas" ? 2 : 3;
      } else {
        input.type = campo.modo === "email" ? "email" : "text";
        if (campo.modo === "tel") input.inputMode = "numeric";
      }
      input.value = valorEnCampo(campo, editado[clave][campo.k]);
      envoltura.appendChild(input);

      var ayuda = document.createElement("p");
      ayuda.className = "p-hint";
      ayuda.textContent = campo.ayuda || "";
      envoltura.appendChild(ayuda);

      var aviso = document.createElement("p");
      aviso.className = "p-warn";
      aviso.setAttribute("aria-live", "polite");
      envoltura.appendChild(aviso);

      input.addEventListener("input", function () {
        editado[clave][campo.k] = valorDeCampo(campo, input.value);
        revisarCampo(campo, input, aviso, clave);
        actualizarPrevia();
        actualizarBarra();
      });
      input.addEventListener("blur", function () {
        /* Al salir del campo se muestra el valor ya limpio (ej. sin @). */
        if (campo.limpiar) input.value = valorEnCampo(campo, editado[clave][campo.k]);
      });

      revisarCampo(campo, input, aviso, clave);
      contenedor.appendChild(envoltura);
    });
  }

  function revisarCampo(campo, input, aviso, clave) {
    var v = editado[clave][campo.k];
    var error = campo.validar ? campo.validar(v) : "";
    var advertencia = "";
    if (!error && campo.max && typeof v === "string") {
      var larga = v.split("\n").filter(function (l) { return l.length > campo.max; })[0];
      if (larga) advertencia = "“" + larga + "” es un renglón largo: en el celular puede partirse en dos. Probá cortarlo.";
    }
    var vacio = Array.isArray(v) ? !v.length : !String(v || "").trim();
    if (!error && clave === "textos" && vacio) {
      advertencia = "Vacío: la página va a mostrar el texto de respaldo.";
    }
    aviso.textContent = error || advertencia;
    aviso.className = "p-warn" + (error ? " p-warn--error" : "");
    input.setAttribute("aria-invalid", String(!!error));
    campo._error = !!error;
  }

  /* ---------- Vista previa ----------
     Usa las mismas clases que la página, así el cromo y la letra
     son los reales. Todo entra como texto, nunca como HTML. */

  function renglones(el, texto) {
    el.textContent = "";
    String(texto || "").split("\n").forEach(function (l, i) {
      if (i) el.appendChild(document.createElement("br"));
      el.appendChild(document.createTextNode(l));
    });
  }

  function actualizarPrevia() {
    var t = editado.textos || {};
    $$("[data-prev]").forEach(function (el) {
      var k = el.dataset.prev;
      if (k === "heroTitulo") {
        el.textContent = "";
        String(t[k] || "").split("\n").filter(Boolean).forEach(function (l) {
          var caja = document.createElement("span");
          caja.className = "hero__line";
          var s = document.createElement("span");
          s.textContent = l;
          caja.appendChild(s);
          el.appendChild(caja);
        });
      } else {
        renglones(el, t[k]);
      }
    });
  }

  /* ---------- Cambios y publicación ---------- */

  function cambios(clave) {
    if (!datos[clave]) return 0;
    var n = 0;
    var a = datos[clave], b = editado[clave];
    Object.keys(Object.assign({}, a, b)).forEach(function (k) {
      if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) n++;
    });
    return n;
  }

  function hayErrores() {
    return CAMPOS_CONTACTO.concat(CAMPOS_FRASES).some(function (c) { return c._error; });
  }

  function actualizarBarra(texto) {
    var n = cambios("textos") + cambios("config");
    var estado = $("#estado");
    estado.className = "p-bar__status";
    if (texto) {
      estado.textContent = texto;
    } else if (hayErrores()) {
      estado.textContent = "Hay un dato para corregir antes de publicar.";
      estado.className += " p-bar__status--error";
    } else {
      estado.textContent = n ? (n === 1 ? "1 cambio sin publicar" : n + " cambios sin publicar") : "Sin cambios";
    }
    $("#publicar").disabled = publicando || !n || hayErrores();
    $("#descartar").disabled = publicando || !n;
  }

  function publicar() {
    var pendientes = ["textos", "config"].filter(function (c) { return cambios(c) > 0; });
    if (!pendientes.length || hayErrores()) return;
    publicando = true;
    actualizarBarra("Publicando…");

    /* Uno después del otro: dos commits simultáneos sobre la misma rama
       se pisan y el segundo falla. */
    pendientes.reduce(function (p, clave) {
      return p.then(function () { return escribir(clave); });
    }, Promise.resolve())
      .then(function () {
        publicando = false;
        actualizarBarra("Publicado. La página se actualiza en 1 o 2 minutos.");
        var estado = $("#estado");
        estado.className = "p-bar__status p-bar__status--ok";
      })
      .catch(function (e) {
        publicando = false;
        actualizarBarra(e.status || e.name === "TypeError" ? mensajeError(e) : e.message);
        $("#estado").className = "p-bar__status p-bar__status--error";
      });
  }

  function descartar() {
    editado.textos = JSON.parse(JSON.stringify(datos.textos));
    editado.config = JSON.parse(JSON.stringify(datos.config));
    crearCampos($("#camposFrases"), CAMPOS_FRASES, "textos");
    crearCampos($("#camposContacto"), CAMPOS_CONTACTO, "config");
    actualizarPrevia();
    actualizarBarra();
  }

  /* ---------- Pantallas ---------- */

  function abrirEditor() {
    $("#conexion").hidden = true;
    $("#editor").hidden = false;
    $("#barra").hidden = false;
    $("#salir").hidden = false;
    crearCampos($("#camposFrases"), CAMPOS_FRASES, "textos");
    crearCampos($("#camposContacto"), CAMPOS_CONTACTO, "config");
    actualizarPrevia();
    actualizarBarra();
  }

  function elegirPestana(cual) {
    var frases = cual === "frases";
    $("#tabFrases").setAttribute("aria-selected", String(frases));
    $("#tabContacto").setAttribute("aria-selected", String(!frases));
    $("#panelFrases").hidden = !frases;
    $("#panelContacto").hidden = frases;
  }

  $("#formToken").addEventListener("submit", function (e) {
    e.preventDefault();
    var t = $("#token").value;
    if (t.trim()) conectar(t, $("#recordar").checked);
  });

  $("#tabFrases").addEventListener("click", function () { elegirPestana("frases"); });
  $("#tabContacto").addEventListener("click", function () { elegirPestana("contacto"); });
  $("#publicar").addEventListener("click", publicar);
  $("#descartar").addEventListener("click", descartar);

  $("#salir").addEventListener("click", function () {
    if ((cambios("textos") + cambios("config")) && !confirm("Hay cambios sin publicar. ¿Desconectar igual?")) return;
    olvidarToken();
    location.reload();
  });

  window.addEventListener("beforeunload", function (e) {
    if (!publicando && !(datos.textos && (cambios("textos") + cambios("config")))) return;
    e.preventDefault();
    e.returnValue = "";
  });

  /* Si ya había un token guardado, entra directo. */
  var previo = tokenGuardado();
  if (previo) conectar(previo);
})();
