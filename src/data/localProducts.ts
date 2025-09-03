// Productos locales para presupuesto/tienda sin llamadas a la API

export interface LocalProduct {
  id: number
  name: string
  image: string
  price: number
  description: string
  type: string
  vendor: string
  status?: string
  track_stock?: boolean
  total_qty?: number
}

export const localProducts: LocalProduct[] = [
  {
    id: 101,
    name: "Puerta de Madera Clásica",
    image: "/projects/romana_ebanisteria_grupo_chavon2.png",
    price: 8500,
    description: "Puerta elaborada en madera maciza con acabado natural.",
    type: "Puertas",
    vendor: "Romana",
    status: "available",
    track_stock: true,
    total_qty: 4,
  },
  {
    id: 102,
    name: "Mueble de Cocina Modular",
    image: "/projects/romana_ebanisteria_grupo_chavon10.png",
    price: 32500,
    description: "Módulos de cocina personalizables y resistentes.",
    type: "Cocina",
    vendor: "Chavón",
    status: "available",
    track_stock: false,
  },
  {
    id: 103,
    name: "Closet Empotrado Premium",
    image: "/projects/romana_ebanisteria_grupo_chavon18.png",
    price: 28900,
    description: "Closet a medida con optimización de espacio.",
    type: "Closets",
    vendor: "Romana",
    status: "available",
    track_stock: true,
    total_qty: 7,
  },
  {
    id: 104,
    name: "Vanity de Baño Minimalista",
    image: "/projects/romana_ebanisteria_grupo_chavon24.png",
    price: 14500,
    description: "Vanity con superficie resistente a la humedad.",
    type: "Baños",
    vendor: "Romana",
    status: "available",
    track_stock: true,
    total_qty: 2,
  },
  {
    id: 105,
    name: "Mesa de Centro en Roble",
    image: "/projects/romana_ebanisteria_grupo_chavon31.png",
    price: 9800,
    description: "Mesa de centro de estilo contemporáneo en roble.",
    type: "Salas",
    vendor: "Chavón",
    status: "available",
    track_stock: false,
  },
  {
    id: 106,
    name: "Panel Decorativo de Madera",
    image: "/projects/romana_ebanisteria_grupo_chavon20.png",
    price: 6200,
    description: "Panel con textura para paredes interiores.",
    type: "Decoración",
    vendor: "Romana",
    status: "available",
    track_stock: true,
    total_qty: 15,
  },
  {
    id: 107,
    name: "Estantería Flotante",
    image: "/projects/romana_ebanisteria_grupo_chavon26.png",
    price: 3500,
    description: "Estantería flotante en acabado natural.",
    type: "Almacenaje",
    vendor: "Romana",
    status: "available",
    track_stock: true,
    total_qty: 0, // sin stock (no se mostrará por regla de tienda)
  },
  {
    id: 108,
    name: "Puerta Corrediza de Granero",
    image: "/projects/romana_ebanisteria_grupo_chavon28.png",
    price: 12400,
    description: "Puerta corrediza estilo granero con herrajes.",
    type: "Puertas",
    vendor: "Chavón",
    status: "available",
    track_stock: true,
    total_qty: 5,
  },
]
