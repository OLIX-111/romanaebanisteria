// schemas/service.js
export default {
    name: 'service',
    title: 'Servicio',
    type: 'document',
    fields: [
      {
        name: 'name',
        title: 'Nombre',
        type: 'string',
        description: 'Nombre del servicio',
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
        description: 'Precio del servicio',
        validation: (Rule: any) =>
          Rule.required().min(0).error('El precio debe ser un número positivo'),
      },
      {
        name: 'category',
        title: 'Categoría',
        type: 'reference',
        to: [{ type: 'category' }],
        description:
          'Categoría del servicio (útil para filtrar)',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'duration',
        title: 'Duración',
        type: 'string',
        description:
          'Tiempo estimado de realización del servicio (ej: "2-4 semanas")',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'availability',
        title: 'Disponibilidad',
        type: 'string',
        description:
          'Modalidad de disponibilidad (ej: "Previa cita", "Inmediata")',
        validation: (Rule: any) => Rule.required(),
      },
      /* {
        name: 'description',
        title: 'Descripción',
        type: 'text',
        description: 'Descripción detallada del servicio',
        validation: (Rule: any) => Rule.required(),
      }, */
      {
        name: 'description',
        title: 'Descripción',
        description: 'Descripción detallada del servicio',
        type: 'array',
        of: [{ type: 'block' }, { type: 'image' }],
      },
      {
        name: 'shortdescription',
        title: 'Short Descripción',
        type: 'text',
        description: 'Descripción corta del servicio',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'image',
        title: 'Imagen',
        type: 'image',
        description: 'Imagen representativa del servicio',
        options: {
          hotspot: true,
        },
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
  