import type { NextApiRequest, NextApiResponse } from 'next'

// Datos estáticos con la nueva estructura (array con un producto de ejemplo)
const PRODUCTS = [
  {
    product_id: "LIBRERO_MOD_001",
    name: "Librero Modular 'Natura'",
    description:
      "Un librero versátil que se adapta a tu espacio. Personaliza la madera, el acabado y las dimensiones para crear tu mueble ideal. El precio mostrado es para la configuración base.",
    category: "Libreros",
    price: 480.0,
    main_image: {
      id: "IMG_MAIN_LIB_01",
      alt_text: "Librero modular de madera clara en una sala de estar",
      image_url: "https://shopflamingo.com.mx/cdn/shop/files/Librero-de-madera-de-parota-tetris.jpg?v=1713206016",
      created_at: "2025-09-03T10:00:00Z",
      product_id: "LIBRERO_MOD_001",
      variant_id: null,
      is_thumbnail: true,
    },
    customization_attributes: [
      {
        attribute_id: "ATTR_WOOD_FINISH",
        attribute_name: "Madera y el Tinte",
        selection_type: "single",
        options: [
          {
            value_id: "VAL_WOOD_PINE",
            name: "Pino",
            price_adjustment: 0.0,
            is_default: true,
    image: null,
            sub_options: [
              {
                value_id: "VAL_PINE_NATURAL",
                name: "Acabado Natural",
                price_adjustment: 0.0,
                is_default: true,
                image: {
                  id: "IMG_PINE_NATURAL",
                  alt_text: "Muestra de madera de pino con acabado natural",
      image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhvAk7rqfQkw1xkDSXfA3P64796wITlo_mfg&s",
                  created_at: "2025-09-03T10:05:00Z",
                },
              },
              {
                value_id: "VAL_PINE_WHITEWASH",
                name: "Acabado Blanqueado",
                price_adjustment: 45.0,
                is_default: false,
                image: {
                  id: "IMG_PINE_WHITE",
                  alt_text: "Muestra de madera de pino con acabado blanqueado",
      image_url: "https://nogalbeat.com/cdn/shop/files/librero-combinado-para-universidad-ofik-elite-216-varios-colores-2-entrepano-5194015.jpg?v=1755058274&width=1445",
                  created_at: "2025-09-03T10:06:00Z",
                },
              },
            ],
          },
          {
            value_id: "VAL_WOOD_OAK",
            name: "Roble",
            price_adjustment: 180.0,
            is_default: false,
            image: null,
            sub_options: [
              {
                value_id: "VAL_OAK_NATURAL",
                name: "Acabado Natural",
                price_adjustment: 0.0,
                is_default: true,
                image: {
                  id: "IMG_OAK_NATURAL",
                  alt_text: "Muestra de madera de roble natural",
      image_url: "https://www.officedepot.com.mx/medias/100075325.jpg-1200ftw?context=bWFzdGVyfHJvb3R8MTY4MzE2fGltYWdlL2pwZWd8YURRMEwyZ3pNUzh4TVRFeU16RXpNemMzTlRrd01pOHhNREF3TnpVek1qVXVhbkJuWHpFeU1EQm1kSGN8ZWViYzMwZTQ2Nzk0NzQ0MWE1M2I4ZjMzNjk3ZDZjNzM5Yjg3ZjlhZjBkNDhmNTUzYzc4ZGU1MGJlYTU1OWU3Mg",
                  created_at: "2025-09-03T10:07:00Z",
                },
              },
              {
                value_id: "VAL_OAK_WENGE",
                name: "Tinte Wengué",
                price_adjustment: 30.0,
                is_default: false,
                image: {
                  id: "IMG_OAK_WENGE",
                  alt_text: "Muestra de madera de roble con tinte wengué oscuro",
      image_url: "https://www.sempresariales.com/spree/products/1176/product/LIBRERO_COMBINADO_ELITE_WENGUE_%284%29.jpg?1565831757",
                  created_at: "2025-09-03T10:08:00Z",
                },
              },
            ],
          },
        ],
      },
      {
        attribute_id: "ATTR_HARDWARE",
        attribute_name: "2. Elige los Tiradores",
        selection_type: "single",
        options: [
          {
            value_id: "VAL_HDW_STEEL",
            name: "Acero Inoxidable",
            price_adjustment: 0.0,
            is_default: true,
    image: { id: "IMG_HDW_STEEL", image_url: "https://static.ikea.com.do/assets/images/020/0602018_PE680085_S4.webp", alt_text: "Tirador de acero" },
          },
          {
            value_id: "VAL_HDW_BRONZE",
            name: "Bronce",
            price_adjustment: 22.0,
            is_default: false,
    image: { id: "IMG_HDW_BRONZE", image_url: "https://m.media-amazon.com/images/I/617SlUWlxRL._UF1000,1000_QL80_.jpg", alt_text: "Tirador de bronce" },
          },
        ],
      },
    ],
  },
  {
    product_id: "PUERTA_CLASICA_001",
    name: "Puerta de Madera Clásica",
    description: "Puerta de madera maciza con acabado natural, ideal para interiores",
    category: "Puertas",
    price: 350.0,
    main_image: {
      id: "IMG_PTA_CLASSIC",
      alt_text: "Puerta de madera clásica",
      image_url: "https://www.puertasyventanasesquivias.com/sites/esquivias/files/styles/medium_330x330/public/productos/510altea.jpg?itok=nD9y-hw7",
      created_at: "2025-09-03T10:10:00Z",
      product_id: "PUERTA_CLASICA_001",
      variant_id: null,
      is_thumbnail: true,
    },
    customization_attributes: [
      {
        attribute_id: "ATTR_WOOD_TYPE",
        attribute_name: "1. Tipo de madera",
        selection_type: "single",
        options: [
          {
            value_id: "VAL_WOOD_PINE",
            name: "Pino",
            price_adjustment: 0,
            is_default: true,
            image: { id: "IMG_W_PINE", image_url: "https://camifer.com/wp-content/uploads/2017/02/puerta-clasica-modelo-202-acabado-pino.jpg", alt_text: "Puerta clásica en pino" },
            sub_options: [
              {
                value_id: "VAL_FIN_NAT",
                name: "Natural",
                price_adjustment: 0,
                is_default: true,
                image: {
                  id: "IMG_PINE_FIN_NAT",
                  image_url: "https://camifer.com/wp-content/uploads/2017/02/puerta-clasica-modelo-202-acabado-pino.jpg",
                  alt_text: "Pino acabado natural",
                },
              },
              {
                value_id: "VAL_FIN_VRN",
                name: "Barnizado",
                price_adjustment: 25,
                is_default: false,
                image: {
                  id: "IMG_PINE_FIN_VRN",
                  image_url: "https://www.cajonerasfama.es/web/files/img/cajonerasfama.es_f2.construccion.sapelly.jpg",
                  alt_text: "Pino acabado barnizado",
                },
              },
              {
                value_id: "VAL_FIN_WHT",
                name: "Lacado blanco",
                price_adjustment: 40,
                is_default: false,
                image: {
                  id: "IMG_PINE_FIN_WHT",
                  image_url: "https://puertasdesegura.com/wp-content/themes/yootheme/cache/32/puerta-provenzal-blanca-3247390b.jpeg",
                  alt_text: "Pino acabado lacado blanco",
                },
              },
            ],
          },
          {
            value_id: "VAL_WOOD_OAK",
            name: "Roble",
            price_adjustment: 180,
            is_default: false,
            image: { id: "IMG_W_OAK", image_url: "https://camifer.com/wp-content/uploads/2017/02/puerta-clasica-roble-modelo-3012rlv.jpg", alt_text: "Puerta clásica en roble" },
            sub_options: [
              {
                value_id: "VAL_FIN_NAT",
                name: "Natural",
                price_adjustment: 0,
                is_default: true,
                image: {
                  id: "IMG_OAK_FIN_NAT",
                  image_url: "https://camifer.com/wp-content/uploads/2017/02/puerta-clasica-roble-modelo-3012rlv.jpg",
                  alt_text: "Roble acabado natural",
                },
              },
              {
                value_id: "VAL_FIN_VRN",
                name: "Barnizado",
                price_adjustment: 25,
                is_default: false,
                image: {
                  id: "IMG_OAK_FIN_VRN",
                  image_url: "https://www.cajonerasfama.es/web/files/imagecache/Rectangulo-Recortado-200-400/img/puerta-estilo-clasico-12m-recta.jpg",
                  alt_text: "Roble acabado barnizado",
                },
              },
              {
                value_id: "VAL_FIN_WHT",
                name: "Lacado blanco",
                price_adjustment: 40,
                is_default: false,
                image: {
                  id: "IMG_OAK_FIN_WHT",
                  image_url: "https://www.puertasirati.com/wp-content/uploads/2022/04/Irati-Puerta-Laminada-Roble-Nordico.jpg",
                  alt_text: "Roble acabado lacado blanco",
                },
              },
            ],
          },
          {
            value_id: "VAL_WOOD_MAH",
            name: "Caoba",
            price_adjustment: 300,
            is_default: false,
            image: { id: "IMG_W_MAH", image_url: "https://grupocasalima.com/wp-content/uploads/2024/07/puerta-de-madera-caoba.webp", alt_text: "Puerta clásica en caoba" },
            sub_options: [
              {
                value_id: "VAL_FIN_NAT",
                name: "Natural",
                price_adjustment: 0,
                is_default: true,
                image: {
                  id: "IMG_MAH_FIN_NAT",
                  image_url: "https://grupocasalima.com/wp-content/uploads/2024/07/puerta-de-madera-caoba.webp",
                  alt_text: "Caoba acabado natural",
                },
              },
              {
                value_id: "VAL_FIN_VRN",
                name: "Barnizado",
                price_adjustment: 25,
                is_default: false,
                image: {
                  id: "IMG_MAH_FIN_VRN",
                  image_url: "https://m.media-amazon.com/images/I/51hS+NYNogL.jpg",
                  alt_text: "Caoba acabado barnizado",
                },
              },
              {
                value_id: "VAL_FIN_WHT",
                name: "Lacado blanco",
                price_adjustment: 40,
                is_default: false,
                image: {
                  id: "IMG_MAH_FIN_WHT",
                  image_url: "https://image.made-in-china.com/202f0j00vLUfwenGnlqV/Glossy-White-Lacquer-Mahogany-Veneer-Wooden-Flush-Doors.webp",
                  alt_text: "Caoba acabado lacado blanco",
                },
              },
            ],
          },
        ],
      },
      {
        attribute_id: "ATTR_FRAME",
        attribute_name: "3. Tipo de marco",
        selection_type: "single",
        options: [
          {
            value_id: "VAL_FRAME_STD",
            name: "Marco sencillo",
            price_adjustment: 0,
            is_default: true,
            image: {
              id: "IMG_FRAME_STD",
              image_url: "https://cr.epaenlinea.com/media/catalog/product/1/0/100002045.jpeg?optimize=medium&bg-color=255,255,255&fit=bounds&height=&width=",
              alt_text: "Marco sencillo",
            },
          },
          {
            value_id: "VAL_FRAME_DEC",
            name: "Marco decorado",
            price_adjustment: 65,
            is_default: false,
            image: {
              id: "IMG_FRAME_DEC",
              image_url: "https://www.shutterstock.com/image-photo/white-door-frame-wall-copy-260nw-2316064375.jpg",
              alt_text: "Marco decorado",
            },
          },
          {
            value_id: "VAL_FRAME_MET",
            name: "Marco metálico",
            price_adjustment: 120,
            is_default: false,
            image: {
              id: "IMG_FRAME_MET",
              image_url: "https://controlaccesosysistemas.com/wp-content/uploads/2022/02/EDSC_4494.jpg",
              alt_text: "Marco metálico",
            },
          },
        ],
      },
      {
        attribute_id: "ATTR_HANDLE",
        attribute_name: "4. Tipo de manilla",
        selection_type: "single",
        options: [
          {
            value_id: "VAL_HDL_ROUND",
            name: "Manilla redonda",
            price_adjustment: 0,
            is_default: true,
            image: { id: "IMG_HDL_ROUND", image_url: "https://m.media-amazon.com/images/I/31OpRfjvpRL.jpg", alt_text: "Manilla redonda" },
          },
          {
            value_id: "VAL_HDL_MODERN",
            name: "Manilla moderna",
            price_adjustment: 10,
            is_default: false,
            image: { id: "IMG_HDL_MODERN", image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTahdvmWo87vFmIPnefgNaEjIYp4jEulZfIcg&s", alt_text: "Manilla moderna" },
          },
        ],
      },
    ],
  },
  {
    product_id: "CLOSET_MOD_001",
    name: "Closet Modular Premium",
    description: "Closet a medida con módulos configurables",
    category: "Closets",
    price: 920.0,
    main_image: {
      id: "IMG_CLOSET_PREMIUM",
      alt_text: "Closet modular premium",
      image_url: "https://shopflamingo.com.mx/cdn/shop/files/Librero-de-madera-de-parota-tetris.jpg?v=1713206016",
      created_at: "2025-09-03T10:11:00Z",
      product_id: "CLOSET_MOD_001",
      variant_id: null,
      is_thumbnail: true,
    },
    customization_attributes: [
      {
        attribute_id: "ATTR_WOOD_TYPE",
        attribute_name: "Tipo de madera",
        selection_type: "single",
        options: [
          {
            value_id: "VAL_WOOD_PINE",
            name: "Pino",
            price_adjustment: 0,
            is_default: true,
            image: null,
            sub_options: [
              { value_id: "VAL_FIN_NAT", name: "Natural", price_adjustment: 0, is_default: true, image: null },
              { value_id: "VAL_FIN_WAL", name: "Nogal", price_adjustment: 60, is_default: false, image: null },
              { value_id: "VAL_FIN_WHT", name: "Lacado blanco", price_adjustment: 80, is_default: false, image: null },
            ],
          },
          {
            value_id: "VAL_WOOD_OAK",
            name: "Roble",
            price_adjustment: 220,
            is_default: false,
            image: null,
            sub_options: [
              { value_id: "VAL_FIN_NAT", name: "Natural", price_adjustment: 0, is_default: true, image: null },
              { value_id: "VAL_FIN_WAL", name: "Nogal", price_adjustment: 60, is_default: false, image: null },
              { value_id: "VAL_FIN_WHT", name: "Lacado blanco", price_adjustment: 80, is_default: false, image: null },
            ],
          },
        ],
      },
      {
        attribute_id: "ATTR_DOORS",
        attribute_name: "Puertas",
        selection_type: "single",
        options: [
          { value_id: "VAL_DOOR_SWING", name: "Abatibles", price_adjustment: 0, is_default: true, image: null },
          { value_id: "VAL_DOOR_SLIDE", name: "Corredizas", price_adjustment: 140, is_default: false, image: null },
        ],
      },
    ],
  },
  {
    product_id: "COCINA_MOD_001",
    name: "Mueble de Cocina Modular",
    description: "Módulos de cocina personalizables y resistentes",
    category: "Cocina",
    price: 1450.0,
    main_image: {
      id: "IMG_KITCHEN_MOD",
      alt_text: "Mueble de cocina modular",
      image_url: "https://i.pinimg.com/736x/2b/0b/6f/2b0b6f7c2c6f2e0e6a2f707b4b0b4a37.jpg",
      created_at: "2025-09-03T10:12:00Z",
      product_id: "COCINA_MOD_001",
      variant_id: null,
      is_thumbnail: true,
    },
    customization_attributes: [
      {
        attribute_id: "ATTR_COUNTERTOP",
        attribute_name: "Top de cocina",
        selection_type: "single",
        options: [
          { value_id: "VAL_TOP_LAM", name: "Laminado", price_adjustment: 0, is_default: true, image: null },
          { value_id: "VAL_TOP_QUZ", name: "Cuarzo", price_adjustment: 260, is_default: false, image: null },
          { value_id: "VAL_TOP_GRN", name: "Granito", price_adjustment: 190, is_default: false, image: null },
        ],
      },
      {
        attribute_id: "ATTR_CAB_COLOR",
        attribute_name: "Color de gabinetes",
        selection_type: "single",
        options: [
          { value_id: "VAL_COL_WHT", name: "Blanco", price_adjustment: 0, is_default: true, image: null },
          { value_id: "VAL_COL_GRY", name: "Gris", price_adjustment: 40, is_default: false, image: null },
          { value_id: "VAL_COL_BLU", name: "Azul", price_adjustment: 55, is_default: false, image: null },
        ],
      },
      {
        attribute_id: "ATTR_HANDLE",
        attribute_name: "Tipo de manilla",
        selection_type: "single",
        options: [
          { value_id: "VAL_HDL_EDGE", name: "Perfil oculto", price_adjustment: 0, is_default: true, image: null },
          { value_id: "VAL_HDL_BAR", name: "Barra", price_adjustment: 30, is_default: false, image: null },
        ],
      },
    ],
  },
  {
    product_id: "MESA_CENTRO_ROBLE",
    name: "Mesa de Centro en Roble",
    description: "Mesa de centro contemporánea en roble",
    category: "Salas",
    price: 280.0,
    main_image: {
      id: "IMG_MESA_ROBLE",
      alt_text: "Mesa de centro en roble",
      image_url: "https://i.pinimg.com/736x/0c/9d/9f/0c9d9f2f3f3a0cfb6e1d3f9ad44a7f37.jpg",
      created_at: "2025-09-03T10:13:00Z",
      product_id: "MESA_CENTRO_ROBLE",
      variant_id: null,
      is_thumbnail: true,
    },
    customization_attributes: [
      {
        attribute_id: "ATTR_SIZE",
        attribute_name: "Tamaño",
        selection_type: "single",
        options: [
          { value_id: "VAL_90", name: "90 cm", price_adjustment: 0, is_default: true, image: null },
          { value_id: "VAL_120", name: "120 cm", price_adjustment: 45, is_default: false, image: null },
        ],
      },
      {
        attribute_id: "ATTR_LEGS",
        attribute_name: "Tipo de patas",
        selection_type: "single",
        options: [
          { value_id: "VAL_LEG_WOOD", name: "Madera", price_adjustment: 0, is_default: true, image: null },
          { value_id: "VAL_LEG_METAL", name: "Metal", price_adjustment: 35, is_default: false, image: null },
        ],
      },
      {
        attribute_id: "ATTR_FINISH",
        attribute_name: "Acabado",
        selection_type: "single",
        options: [
          { value_id: "VAL_FIN_NAT", name: "Natural", price_adjustment: 0, is_default: true, image: null },
          { value_id: "VAL_FIN_DARK", name: "Oscuro", price_adjustment: 20, is_default: false, image: null },
        ],
      },
    ],
  },
  {
    product_id: "VANITY_BANO_MINI",
    name: "Vanity de Baño Minimalista",
    description: "Vanity compacto con superficie resistente a la humedad",
    category: "Baños",
    price: 390.0,
    main_image: {
      id: "IMG_VANITY_MINI",
      alt_text: "Vanity de baño minimalista",
      image_url: "https://i.pinimg.com/736x/79/9d/9c/799d9c9e3e1c2b99d54f8f5a5c3e8f3b.jpg",
      created_at: "2025-09-03T10:14:00Z",
      product_id: "VANITY_BANO_MINI",
      variant_id: null,
      is_thumbnail: true,
    },
    customization_attributes: [
      {
        attribute_id: "ATTR_SINK",
        attribute_name: "Tipo de lavamanos",
        selection_type: "single",
        options: [
          { value_id: "VAL_SINK_OVER", name: "Sobrepuesto", price_adjustment: 0, is_default: true, image: null },
          { value_id: "VAL_SINK_UNDER", name: "Bajo tope", price_adjustment: 35, is_default: false, image: null },
        ],
      },
      {
        attribute_id: "ATTR_TOP",
        attribute_name: "Material del tope",
        selection_type: "single",
        options: [
          { value_id: "VAL_TOP_RESIN", name: "Resina", price_adjustment: 0, is_default: true, image: null },
          { value_id: "VAL_TOP_QUZ", name: "Cuarzo", price_adjustment: 120, is_default: false, image: null },
        ],
      },
      {
        attribute_id: "ATTR_FINISH",
        attribute_name: "Acabado del mueble",
        selection_type: "single",
        options: [
          { value_id: "VAL_FIN_MAT", name: "Mate", price_adjustment: 0, is_default: true, image: null },
          { value_id: "VAL_FIN_GLS", name: "Gloss", price_adjustment: 25, is_default: false, image: null },
        ],
      },
    ],
  },
  {
    product_id: "PANEL_DECOR_001",
    name: "Panel Decorativo de Madera",
    description: "Panel con textura para paredes interiores",
    category: "Decoración",
    price: 160.0,
    main_image: {
      id: "IMG_PANEL_DECOR",
      alt_text: "Panel decorativo de madera",
      image_url: "https://i.pinimg.com/736x/32/b8/90/32b8907f21dc6a4f9f9b3a3bcf67c3a1.jpg",
      created_at: "2025-09-03T10:15:00Z",
      product_id: "PANEL_DECOR_001",
      variant_id: null,
      is_thumbnail: true,
    },
    customization_attributes: [
      {
        attribute_id: "ATTR_PATTERN",
        attribute_name: "Patrón",
        selection_type: "single",
        options: [
          { value_id: "VAL_PATT_LINE", name: "Lineal", price_adjustment: 0, is_default: true, image: null },
          { value_id: "VAL_PATT_WAVE", name: "Ondas", price_adjustment: 18, is_default: false, image: null },
        ],
      },
      {
        attribute_id: "ATTR_FINISH",
        attribute_name: "Acabado",
        selection_type: "single",
        options: [
          { value_id: "VAL_FIN_NAT", name: "Natural", price_adjustment: 0, is_default: true, image: null },
          { value_id: "VAL_FIN_DARK", name: "Oscuro", price_adjustment: 12, is_default: false, image: null },
        ],
      },
    ],
  },
  {
    product_id: "ESTANTERIA_FLOT_001",
    name: "Estantería Flotante",
    description: "Estantería flotante en acabado natural",
    category: "Almacenaje",
    price: 95.0,
    main_image: {
      id: "IMG_ESTANT_FLOT",
      alt_text: "Estantería flotante",
      image_url: "https://i.pinimg.com/736x/29/49/2c/29492cd7ebc1b1b9c7a5849d02b1f0c7.jpg",
      created_at: "2025-09-03T10:16:00Z",
      product_id: "ESTANTERIA_FLOT_001",
      variant_id: null,
      is_thumbnail: true,
    },
    customization_attributes: [
      {
        attribute_id: "ATTR_LENGTH",
        attribute_name: "Largo",
        selection_type: "single",
        options: [
          { value_id: "VAL_LEN_60", name: "60 cm", price_adjustment: 0, is_default: true, image: null },
          { value_id: "VAL_LEN_90", name: "90 cm", price_adjustment: 12, is_default: false, image: null },
          { value_id: "VAL_LEN_120", name: "120 cm", price_adjustment: 22, is_default: false, image: null },
        ],
      },
      {
        attribute_id: "ATTR_FINISH",
        attribute_name: "Acabado",
        selection_type: "single",
        options: [
          { value_id: "VAL_FIN_NAT", name: "Natural", price_adjustment: 0, is_default: true, image: null },
          { value_id: "VAL_FIN_WHT", name: "Blanco", price_adjustment: 10, is_default: false, image: null },
        ],
      },
    ],
  },
  {
    product_id: "PUERTA_CORREDIZA_001",
    name: "Puerta Corrediza de Granero",
    description: "Puerta corrediza estilo granero con herrajes",
    category: "Puertas",
    price: 520.0,
    main_image: {
      id: "IMG_PTA_GRANERO",
      alt_text: "Puerta corrediza estilo granero",
  image_url: "https://forjaferreatienda.com/wp-content/uploads/2022/05/Screenshot_20220619-1829172.png",
      created_at: "2025-09-03T10:17:00Z",
      product_id: "PUERTA_CORREDIZA_001",
      variant_id: null,
      is_thumbnail: true,
    },
    customization_attributes: [
      {
        attribute_id: "ATTR_WOOD_TYPE",
        attribute_name: "Tipo de madera",
        selection_type: "single",
        options: [
          {
            value_id: "VAL_WOOD_PINE",
            name: "Pino",
            price_adjustment: 0,
            is_default: true,
            image: { id: "IMG_BARN_PINE", image_url: "https://naturshome.es/wp-content/uploads/2023/11/puerta-corredera-pino-naturshome2.jpg", alt_text: "Puerta de granero en pino" },
            sub_options: [
              {
                value_id: "VAL_FIN_NAT",
                name: "Natural",
                price_adjustment: 0,
                is_default: true,
                image: {
                  id: "IMG_BARN_PINE_FIN_NAT",
                  image_url: "https://naturshome.es/wp-content/uploads/2023/11/puerta-corredera-pino-naturshome2.jpg",
                  alt_text: "Pino acabado natural",
                },
              },
              {
                value_id: "VAL_FIN_WHT",
                name: "Lacado blanco",
                price_adjustment: 40,
                is_default: false,
                image: {
                  id: "IMG_BARN_PINE_FIN_WHT",
                  image_url: "https://maderahogar.com/wp-content/uploads/puerta-corredera-de-granero-blanca-tbc840.jpg",
                  alt_text: "Pino lacado blanco",
                },
              },
            ],
          },
          {
            value_id: "VAL_WOOD_OAK",
            name: "Roble",
            price_adjustment: 180,
            is_default: false,
            image: null,
            sub_options: [
              { value_id: "VAL_FIN_NAT", name: "Natural", price_adjustment: 0, is_default: true, image: null },
              {
                value_id: "VAL_FIN_DARK",
                name: "Oscuro",
                price_adjustment: 30,
                is_default: false,
                image: {
                  id: "IMG_BARN_OAK_FIN_DARK",
                  image_url: "https://maderahogar.com/wp-content/uploads/puerta-corredera-gris-laminada-lisa.jpg",
                  alt_text: "Puerta granero en roble oscuro",
                },
              },
            ],
          },
        ],
      },
      {
        attribute_id: "ATTR_HANDLE",
        attribute_name: "Tipo de agarradera",
        selection_type: "single",
        options: [
          {
            value_id: "VAL_GRIP_REG",
            name: "Agarradera regular",
            price_adjustment: 0,
            is_default: true,
            image: {
              id: "IMG_GRIP_REG",
              image_url: "https://m.media-amazon.com/images/I/51p-f4mJnzL._UF894,1000_QL80_.jpg",
              alt_text: "Agarradera regular",
            },
          },
          {
            value_id: "VAL_GRIP_RECESS",
            name: "Agarradera de hundidura",
            price_adjustment: 10,
            is_default: false,
            image: {
              id: "IMG_GRIP_RECESS",
              image_url: "https://m.media-amazon.com/images/I/61dOC8ubZmL.jpg",
              alt_text: "Agarradera de hundidura",
            },
          },
        ],
      },
    ],
  },
  {
    product_id: "ESCRITORIO_WORK_001",
    name: "Escritorio de Trabajo",
    description: "Escritorio amplio con pasacables y opción de gavetas",
    category: "Oficina",
    price: 430.0,
    main_image: {
      id: "IMG_DESK_WORK",
      alt_text: "Escritorio de trabajo",
      image_url: "https://i.pinimg.com/736x/83/7d/2b/837d2b5a7e0d4857cb9980d4e1c6d2da.jpg",
      created_at: "2025-09-03T10:18:00Z",
      product_id: "ESCRITORIO_WORK_001",
      variant_id: null,
      is_thumbnail: true,
    },
    customization_attributes: [
      {
        attribute_id: "ATTR_SIZE",
        attribute_name: "Tamaño",
        selection_type: "single",
        options: [
          { value_id: "VAL_120", name: "120 cm", price_adjustment: 0, is_default: true, image: null },
          { value_id: "VAL_160", name: "160 cm", price_adjustment: 70, is_default: false, image: null },
          { value_id: "VAL_180", name: "180 cm", price_adjustment: 120, is_default: false, image: null },
        ],
      },
      {
        attribute_id: "ATTR_FINISH",
        attribute_name: "Acabado",
        selection_type: "single",
        options: [
          { value_id: "VAL_FIN_NAT", name: "Natural", price_adjustment: 0, is_default: true, image: null },
          { value_id: "VAL_FIN_WAL", name: "Nogal", price_adjustment: 35, is_default: false, image: null },
        ],
      },
      {
        attribute_id: "ATTR_FRAME_COLOR",
        attribute_name: "Color estructura",
        selection_type: "single",
        options: [
          { value_id: "VAL_FRM_BLK", name: "Negra", price_adjustment: 0, is_default: true, image: null },
          { value_id: "VAL_FRM_WHT", name: "Blanca", price_adjustment: 10, is_default: false, image: null },
        ],
      },
    ],
  },
  {
    product_id: "MUEBLE_TV_001",
    name: "Mueble para TV",
    description: "Mueble para TV con compartimentos abiertos y puertas",
    category: "Salas",
    price: 510.0,
    main_image: {
      id: "IMG_MUEBLE_TV",
      alt_text: "Mueble para TV",
      image_url: "https://i.pinimg.com/736x/1f/4b/80/1f4b803c9d95d83f6a2d98a75c1212dd.jpg",
      created_at: "2025-09-03T10:19:00Z",
      product_id: "MUEBLE_TV_001",
      variant_id: null,
      is_thumbnail: true,
    },
    customization_attributes: [
      {
        attribute_id: "ATTR_WOOD_TYPE",
        attribute_name: "Tipo de madera",
        selection_type: "single",
        options: [
          {
            value_id: "VAL_WOOD_PINE",
            name: "Pino",
            price_adjustment: 0,
            is_default: true,
            image: null,
            sub_options: [
              { value_id: "VAL_FIN_NAT", name: "Natural", price_adjustment: 0, is_default: true, image: null },
              { value_id: "VAL_FIN_WHT", name: "Lacado blanco", price_adjustment: 40, is_default: false, image: null },
            ],
          },
          {
            value_id: "VAL_WOOD_OAK",
            name: "Roble",
            price_adjustment: 120,
            is_default: false,
            image: null,
            sub_options: [
              { value_id: "VAL_FIN_NAT", name: "Natural", price_adjustment: 0, is_default: true, image: null },
              { value_id: "VAL_FIN_WHT", name: "Lacado blanco", price_adjustment: 40, is_default: false, image: null },
            ],
          },
        ],
      },
      {
        attribute_id: "ATTR_DOORS",
        attribute_name: "Puertas",
        selection_type: "single",
        options: [
          { value_id: "VAL_DOOR_NONE", name: "Sin puertas", price_adjustment: 0, is_default: true, image: null },
          { value_id: "VAL_DOOR_2", name: "2 puertas", price_adjustment: 35, is_default: false, image: null },
        ],
      },
    ],
  },
  {
    product_id: "LIBRERO_MINI_002",
    name: "Librero Compacto",
    description: "Librero compacto de dos niveles ideal para espacios pequeños",
    category: "Libreros",
    price: 220.0,
    main_image: {
      id: "IMG_LIBRERO_MINI",
      alt_text: "Librero compacto",
      image_url: "https://www.keideamuebles.es/19752-large_default/librero-1c-calcuta.jpg",
      created_at: "2025-09-03T10:20:00Z",
      product_id: "LIBRERO_MINI_002",
      variant_id: null,
      is_thumbnail: true,
    },
    customization_attributes: [
      {
        attribute_id: "ATTR_SHELVES",
        attribute_name: "Número de niveles",
        selection_type: "single",
        options: [
          {
            value_id: "VAL_SHELF_2",
            name: "2 niveles",
            price_adjustment: 0,
            is_default: true,
            image: {
              id: "IMG_LIBRERO_SHELF2",
              image_url: "https://normo.mx/wp-content/uploads/2021/03/Librero-a-piso-2-niveles-LIB2N-370x370.png",
              alt_text: "Librero compacto 2 niveles",
            },
          },
          {
            value_id: "VAL_SHELF_3",
            name: "3 niveles",
            price_adjustment: 18,
            is_default: false,
            image: {
              id: "IMG_LIBRERO_SHELF3",
              image_url: "https://walmartni.vtexassets.com/arquivos/ids/484432/5842_01.jpg?v=638636807212470000",
              alt_text: "Librero compacto 3 niveles",
            },
          },
        ],
      },
      {
        attribute_id: "ATTR_FINISH",
        attribute_name: "Acabado",
        selection_type: "single",
        options: [
          { value_id: "VAL_FIN_NAT", name: "Natural", price_adjustment: 0, is_default: true, image: null },
          {
            value_id: "VAL_FIN_WAL",
            name: "Nogal",
            price_adjustment: 15,
            is_default: false,
            image: {
              id: "IMG_LIBRERO_FIN_WAL",
              image_url: "https://easycl.vteximg.com.br/arquivos/ids/4925745/1315297-0000-001.jpg?v=638738886778300000",
              alt_text: "Librero compacto acabado Nogal",
            },
          },
        ],
      },
    ],
  },
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await new Promise((r) => setTimeout(r, 250))
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' })

  const { name, category } = req.query
  let data = PRODUCTS
  if (name && typeof name === 'string') {
    const q = name.toLowerCase()
    data = data.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
  }
  if (category && typeof category === 'string') {
    data = data.filter((p) => (p.category || '').toLowerCase() === category.toLowerCase())
  }
  return res.status(200).json({ data, meta: { total: data.length } })
}
