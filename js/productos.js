/* ============================================================
   G.S.9 — CATÁLOGO
   ------------------------------------------------------------
   Categorías y productos de la tienda. Lo que está entre llaves
   es JSON: comillas dobles y sin coma después del último elemento.

   CATEGORÍAS
     id       palabra corta, sin espacios ni tildes ("perfumes").
              Es la que va en el link: tusitio/#perfumes
     nombre   como se muestra ("Perfumes").
     bajada   una línea opcional debajo del nombre.
   Una categoría sin productos se muestra como "Próximamente", con
   un botón para que te pidan aviso por WhatsApp.

   PRODUCTOS
     id        único, sin espacios ni tildes ("9pm-night-out").
               Link directo al producto: tusitio/#producto/9pm-night-out
     nombre    como se muestra.
     categoria el id de su categoría.
     tipo      subgrupo dentro de la categoría (la marca: "Armaf").
               Con dos tipos o más aparecen como filtro.
     precio    número sin puntos (25000) o "" para "Consultar".
     imagen    ruta de la foto, vertical 3:4 (ej. 825 × 1100).
     fotos     opcional: más fotos del mismo producto, misma medida.
               ["img/galeria/x-2.jpg", "img/galeria/x-3.jpg"]
               Con una o más, la página del producto muestra
               miniaturas y se pueden deslizar.
     alt       qué se ve en la foto, para quien no la ve.
     detalle   texto opcional de la página del producto.
     largo     opcional: "50 cm aprox." — aparece como "Largo: …" (no se usa en perfumes).
     talles    lista opcional: ["S", "M", "L"] o ["40", "41", "42"].
     estado    "" (disponible), "nuevo" o "agotado".
   ============================================================ */

const CATALOGO = {
  "categorias": [
    {
      "id": "perfumes",
      "nombre": "Perfumes",
      "bajada": "Perfumes originales, elegidos para durar más que la noche"
    }
  ],
  "productos": [
    {
      "id": "9pm-night-out",
      "nombre": "Afnan 9pm Night Out",
      "categoria": "perfumes",
      "tipo": "Afnan",
      "precio": "",
      "imagen": "img/galeria/9pm-night-out.jpg",
      "alt": "Frasco y caja del perfume 9pm Night Out de Afnan",
      "detalle": "Extrait de Parfum · 100 ml",
      "talles": [],
      "estado": ""
    },
    {
      "id": "club-de-nuit-intense-man",
      "nombre": "Armaf Club de Nuit Intense Man",
      "categoria": "perfumes",
      "tipo": "Armaf",
      "precio": "",
      "imagen": "img/galeria/club-de-nuit-intense-man.jpg",
      "alt": "Frasco y caja del perfume Club de Nuit Intense Man de Armaf",
      "detalle": "Eau de Toilette · 105 ml",
      "talles": [],
      "estado": ""
    },
    {
      "id": "amber-oud-black-edition",
      "nombre": "Al Haramain Amber Oud Black Edition",
      "categoria": "perfumes",
      "tipo": "Al Haramain",
      "precio": "",
      "imagen": "img/galeria/amber-oud-black-edition.jpg",
      "alt": "Frasco y caja del perfume Amber Oud Black Edition de Al Haramain",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "odyssey-mandarin-sky",
      "nombre": "Armaf Odyssey Mandarin Sky",
      "categoria": "perfumes",
      "tipo": "Armaf",
      "precio": "",
      "imagen": "img/galeria/odyssey-mandarin-sky.jpg",
      "alt": "Frasco y caja del perfume Odyssey Mandarin Sky de Armaf",
      "detalle": "Eau de Parfum · Edición limitada",
      "talles": [],
      "estado": ""
    },
    {
      "id": "erba-pura",
      "nombre": "Xerjoff Erba Pura",
      "categoria": "perfumes",
      "tipo": "Xerjoff",
      "precio": "",
      "imagen": "img/galeria/erba-pura.jpg",
      "alt": "Frasco y caja del perfume Erba Pura de Xerjoff",
      "detalle": "Eau de Parfum · 100 ml",
      "talles": [],
      "estado": ""
    },
    {
      "id": "le-male-elixir",
      "nombre": "Jean Paul Gaultier Le Male Elixir",
      "categoria": "perfumes",
      "tipo": "Jean Paul Gaultier",
      "precio": "",
      "imagen": "img/galeria/le-male-elixir.jpg",
      "alt": "Frasco y caja del perfume Le Male Elixir de Jean Paul Gaultier",
      "detalle": "",
      "talles": [],
      "estado": ""
    }
  ]
};
