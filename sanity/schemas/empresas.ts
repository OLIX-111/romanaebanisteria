// schemas/empresas.ts

export default {
  name: 'empresas',
  title: 'Empresas',
  type: 'document',
  fields: [
    {
      name: 'portada',
      title: 'Portada',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Empresa', value: 'empresa' },
          { title: 'Marca', value: 'marca' },
          { title: 'Proyecto', value: 'proyecto' },
          { title: 'Extra', value: 'extra' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'empresa',
    },
    {
      name: 'sectorImg',
      title: 'Sector Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'sector',
      title: 'Sector',
      type: 'object',
      fields: [
        { name: 'en', title: 'English', type: 'string' },
        { name: 'es', title: 'Spanish', type: 'string' },
      ],
    },
    {
      name: 'nombreEmpresa',
      title: 'Nombre de Empresa',
      type: 'object',
      fields: [
        { name: 'en', title: 'English', type: 'string' },
        { name: 'es', title: 'Spanish', type: 'string' },
      ],
    },
    {
      name: 'tituloLargo',
      title: 'Título Largo',
      type: 'object',
      fields: [
        { name: 'en', title: 'English', type: 'string' },
        { name: 'es', title: 'Spanish', type: 'string' },
      ],
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'nombreEmpresa.en', // Genera el slug desde el nombre en inglés
        maxLength: 96,
      },
    },
    {
      name: 'descripcionCorta',
      title: 'Descripción Corta',
      type: 'object',
      fields: [
        { name: 'en', title: 'English', type: 'string', validation: (Rule: any) => Rule.max(180) },
        { name: 'es', title: 'Spanish', type: 'string', validation: (Rule: any) => Rule.max(180) },
      ],
    },
    {
      name: 'descripcionDetallada',
      title: 'Descripción Detallada',
      type: 'object',
      fields: [
        {
          name: 'en',
          title: 'English',
          type: 'array',
          of: [{ type: 'block' }, { type: 'image' }],
        },
        {
          name: 'es',
          title: 'Spanish',
          type: 'array',
          of: [{ type: 'block' }, { type: 'image' }],
        },
      ],
    },
    {
      name: 'website',
      title: 'Website',
      type: 'url',
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
    },
  ],
};
