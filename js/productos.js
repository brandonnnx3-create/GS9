/* ============================================================
   G.S.9 — CATÁLOGO
   ------------------------------------------------------------
   Categorías y productos de la tienda. Lo que está entre llaves
   es JSON: comillas dobles y sin coma después del último elemento.

   CATEGORÍAS
     id       palabra corta, sin espacios ni tildes ("zapatillas").
              Es la que va en el link: tusitio/#zapatillas
     nombre   como se muestra ("Zapatillas").
     bajada   una línea opcional debajo del nombre.
   Una categoría sin productos se muestra como "Próximamente", con
   un botón para que te pidan aviso por WhatsApp.

   PRODUCTOS
     id        único, sin espacios ni tildes ("buzo-negro-logo").
               Link directo al producto: tusitio/#producto/buzo-negro-logo
     nombre    como se muestra.
     categoria el id de su categoría.
     tipo      subgrupo dentro de la categoría ("Anillos", "Buzos").
               Con dos tipos o más aparecen como filtro.
     precio    número sin puntos (25000) o "" para "Consultar".
     imagen    ruta de la foto, vertical 3:4 (ej. 825 × 1100).
     alt       qué se ve en la foto, para quien no la ve.
     detalle   texto opcional de la ficha.
     talles    lista opcional: ["S", "M", "L"] o ["40", "41", "42"].
     estado    "" , "nuevo" o "agotado".
   ============================================================ */

const CATALOGO = {
  "categorias": [
    {
      "id": "joyas",
      "nombre": "Joyería",
      "bajada": "Cadenas, dijes, anillos y pulseras"
    },
    {
      "id": "ropa",
      "nombre": "Ropa",
      "bajada": ""
    },
    {
      "id": "zapatillas",
      "nombre": "Zapatillas",
      "bajada": ""
    }
  ],
  "productos": [
    {
      "id": "sellos-surtidos",
      "nombre": "Sellos surtidos",
      "categoria": "joyas",
      "tipo": "Anillos",
      "precio": "",
      "imagen": "img/galeria/anillos-bandeja.jpg",
      "alt": "Bandeja con sellos de distintos diseños",
      "detalle": "Sellos de distintos diseños. Preguntanos por el modelo que te guste y tu medida.",
      "talles": [],
      "estado": ""
    },
    {
      "id": "dije-todo-pasa",
      "nombre": "Dije placa Todo pasa",
      "categoria": "joyas",
      "tipo": "Dijes",
      "precio": "",
      "imagen": "img/galeria/dije-todo-pasa.jpg",
      "alt": "Dije placa con la frase Todo pasa",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "cadena-soga",
      "nombre": "Cadena tejido soga",
      "categoria": "joyas",
      "tipo": "Cadenas",
      "precio": "",
      "imagen": "img/galeria/soga.jpg",
      "alt": "Cadena tejido soga sostenida en la mano",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "set-cadenas-placas",
      "nombre": "Set de cadenas con placas",
      "categoria": "joyas",
      "tipo": "Cadenas",
      "precio": "",
      "imagen": "img/galeria/bustos-tres.jpg",
      "alt": "Tres cadenas de distinto largo con placas y estuche de anillos",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "dije-inicial-m",
      "nombre": "Dije placa inicial M",
      "categoria": "joyas",
      "tipo": "Dijes",
      "precio": "",
      "imagen": "img/galeria/dije-m.jpg",
      "alt": "Dije placa con inicial M",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "duo-pulseras",
      "nombre": "Dúo de pulseras",
      "categoria": "joyas",
      "tipo": "Pulseras",
      "precio": "",
      "imagen": "img/galeria/pulseras-guante.jpg",
      "alt": "Dos pulseras en la muñeca",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "dije-32",
      "nombre": "Dije placa 32",
      "categoria": "joyas",
      "tipo": "Dijes",
      "precio": "",
      "imagen": "img/galeria/dije-32.jpg",
      "alt": "Dije placa con el número 32",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "sellos-piedra",
      "nombre": "Sellos con y sin piedra",
      "categoria": "joyas",
      "tipo": "Anillos",
      "precio": "",
      "imagen": "img/galeria/anillos-pila.jpg",
      "alt": "Sellos apilados con y sin piedra",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "cadenas-en-capas",
      "nombre": "Cadenas en capas",
      "categoria": "joyas",
      "tipo": "Cadenas",
      "precio": "",
      "imagen": "img/galeria/busto-capas.jpg",
      "alt": "Cadenas en capas con anillos y pulsera",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "dije-corona",
      "nombre": "Dije placa corona",
      "categoria": "joyas",
      "tipo": "Dijes",
      "precio": "",
      "imagen": "img/galeria/dije-corona.jpg",
      "alt": "Dije placa con corona grabada",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "estuche-pulseras-aros",
      "nombre": "Pulseras, aros y anillos",
      "categoria": "joyas",
      "tipo": "Pulseras",
      "precio": "",
      "imagen": "img/galeria/bandeja-pulseras.jpg",
      "alt": "Pulseras, aros y anillos en su estuche",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "dije-32-corona",
      "nombre": "Dije placa 32 con corona",
      "categoria": "joyas",
      "tipo": "Dijes",
      "precio": "",
      "imagen": "img/galeria/dije-32-b.jpg",
      "alt": "Dije placa 32 con corona",
      "detalle": "",
      "talles": [],
      "estado": ""
    }
  ]
};
