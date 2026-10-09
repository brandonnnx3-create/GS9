/* ============================================================
   G.S.9 — CATÁLOGO
   ------------------------------------------------------------
   Categorías y productos de la tienda. Lo que está entre llaves
   es JSON: comillas dobles y sin coma después del último elemento.

   CATEGORÍAS
     id       palabra corta, sin espacios ni tildes ("joyas").
              Es la que va en el link: tusitio/#joyas
     nombre   como se muestra ("Joyería").
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
      "bajada": "Cadenas, dijes y anillos"
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
      "id": "dije-inicial-m",
      "nombre": "Dije placa inicial personalizada",
      "categoria": "joyas",
      "tipo": "Dijes",
      "precio": 18000,
      "imagen": "img/galeria/dije-m.jpg",
      "alt": "Dije placa con inicial personalizada",
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
      "id": "cadena-caracol-aplastada",
      "nombre": "Cadena caracol aplastada",
      "categoria": "joyas",
      "tipo": "Cadenas finas",
      "precio": 18000,
      "imagen": "img/galeria/cadena-caracol-aplastada.jpg",
      "alt": "Cadena caracol aplastada en maniquí",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "cadena-destello-3x1",
      "nombre": "Cadena destello 3x1",
      "categoria": "joyas",
      "tipo": "Cadenas finas",
      "precio": 20000,
      "imagen": "img/galeria/cadena-destello-3x1.jpg",
      "alt": "Cadena destello 3x1 en maniquí",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "cadena-enrollado-fino",
      "nombre": "Cadena enrollado fino",
      "categoria": "joyas",
      "tipo": "Cadenas finas",
      "precio": 18000,
      "imagen": "img/galeria/cadena-enrollado-fino.jpg",
      "alt": "Cadena enrollado fino en maniquí",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "cadena-groumet-fina",
      "nombre": "Cadena groumet fina",
      "categoria": "joyas",
      "tipo": "Cadenas finas",
      "precio": 20000,
      "imagen": "img/galeria/cadena-groumet-fina.jpg",
      "alt": "Cadena groumet fina en maniquí",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "cadena-singapur-fina",
      "nombre": "Cadena singapur fina",
      "categoria": "joyas",
      "tipo": "Cadenas finas",
      "precio": 18000,
      "imagen": "img/galeria/cadena-singapur-fina.jpg",
      "alt": "Cadena singapur fina en maniquí",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "cadena-tourbillon-fina",
      "nombre": "Cadena tourbillon fina",
      "categoria": "joyas",
      "tipo": "Cadenas finas",
      "precio": 18000,
      "imagen": "img/galeria/cadena-tourbillon-fina.jpg",
      "alt": "Cadena tourbillon fina en maniquí",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "dije-cuadrado-jesus",
      "nombre": "Dije cuadrado Jesús",
      "categoria": "joyas",
      "tipo": "Dijes",
      "precio": 10000,
      "imagen": "img/galeria/dije-cuadrado-jesus.jpg",
      "alt": "Dije placa cuadrada con imagen de Jesús grabada",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "dije-virgen-milagrosa",
      "nombre": "Dije enchapado Virgen Milagrosa",
      "categoria": "joyas",
      "tipo": "Dijes",
      "precio": 10000,
      "imagen": "img/galeria/dije-virgen-milagrosa.jpg",
      "alt": "Medalla ovalada de la Virgen Milagrosa",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "dije-gauchito-gil",
      "nombre": "Dije placa Gauchito Gil",
      "categoria": "joyas",
      "tipo": "Dijes",
      "precio": 16500,
      "imagen": "img/galeria/dije-gauchito-gil.jpg",
      "alt": "Dije placa con imagen de Gauchito Gil grabada",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "dije-solo-plata-no-amores",
      "nombre": "Dije placa Solo plata y no amores",
      "categoria": "joyas",
      "tipo": "Dijes",
      "precio": 16500,
      "imagen": "img/galeria/dije-solo-plata-no-amores.jpg",
      "alt": "Dije placa con la frase Solo plata y no amores",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "dije-vamos-por-todo",
      "nombre": "Dije placa Vamos por todo",
      "categoria": "joyas",
      "tipo": "Dijes",
      "precio": 16500,
      "imagen": "img/galeria/dije-vamos-por-todo.jpg",
      "alt": "Dije placa con la frase Vamos por todo",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "dije-sol",
      "nombre": "Dije sol",
      "categoria": "joyas",
      "tipo": "Dijes",
      "precio": 10000,
      "imagen": "img/galeria/dije-sol.jpg",
      "alt": "Dije con forma de sol y piedra central",
      "detalle": "",
      "talles": [],
      "estado": ""
    },
    {
      "id": "dije-trebol-blanco",
      "nombre": "Dije Van Cleef blanco",
      "categoria": "joyas",
      "tipo": "Dijes",
      "precio": 10000,
      "imagen": "img/galeria/dije-trebol-blanco.jpg",
      "alt": "Dije con forma de trébol de cuatro hojas, detalle blanco",
      "detalle": "",
      "talles": [],
      "estado": ""
    }
  ]
};
