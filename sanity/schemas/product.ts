// schemas/product.js
export default {
    name: 'product',
    title: 'Producto',
    type: 'document',
    fields: [
      {
        name: 'name',
        title: 'Nombre',
        type: 'string',
        description: 'Nombre del producto',
        validation: (Rule: any) =>
          Rule.required().error('El nombre es obligatorio'),
      },
      {
        name: 'slug',
        title: 'Slug',
        type: 'slug',
        options: {
          source: 'name',
          maxLength: 96,
        },
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'price',
        title: 'Precio',
        type: 'number',
        description: 'Precio del producto',
        validation: (Rule: any) =>
          Rule.required().min(0).error('El precio debe ser un número positivo'),
      },
      {
        name: 'category',
        title: 'Categoría',
        type: 'reference',
        to: [{ type: 'category' }],
        description:
          'Categoría a la que pertenece el producto (útil para filtrar)',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'material',
        title: 'Material',
        type: 'reference',
        to: [{ type: 'material' }],
        description:
          'Material con el que está fabricado el producto (útil para filtrar)',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'finish',
        title: 'Acabado',
        type: 'reference',
        to: [{ type: 'finish' }],
        description:
          'Tipo de acabado del producto (útil para filtrar)',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'color',
        title: 'Color',
        type: 'string',
        description: 'Color principal del producto',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'dimensions',
        title: 'Dimensiones',
        type: 'object',
        description: 'Dimensiones del producto',
        fields: [
          {
            name: 'width',
            title: 'Ancho',
            type: 'number',
            description: 'Ancho en centímetros',
            validation: (Rule: any) => Rule.required().min(0),
          },
          {
            name: 'height',
            title: 'Alto',
            type: 'number',
            description: 'Alto en centímetros',
            validation: (Rule: any) => Rule.required().min(0),
          },
          {
            name: 'depth',
            title: 'Profundidad',
            type: 'number',
            description: 'Profundidad en centímetros',
            validation: (Rule: any) => Rule.required().min(0),
          },
        ],
      },
      {
        name: 'availability',
        title: 'Disponibilidad',
        type: 'string',
        description:
          'Estado de disponibilidad (por ejemplo, "En stock", "A pedido")',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'customizable',
        title: 'Personalizable',
        type: 'boolean',
        description: 'Indica si el producto es personalizable',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'deliveryTime',
        title: 'Tiempo de entrega',
        type: 'string',
        description:
          'Tiempo estimado de entrega (ej: "2-3 semanas")',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'image',
        title: 'Imagen',
        type: 'image',
        description: 'Imagen representativa del producto',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'description',
        title: 'Descripción',
        type: 'text',
        description: 'Descripción detallada del producto',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: "gallery",
        title: "Galería de Imágenes",
        type: "array",
        of: [{ type: "image", options: { hotspot: true } }],
        validation: (Rule: any) => Rule.min(0).max(10),
      },
    ],
  }
  