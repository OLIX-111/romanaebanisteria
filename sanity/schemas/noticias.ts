// schemas/noticias.ts

export default {
    name: 'noticias',
    title: 'Noticias',
    type: 'document',
    fields: [
      {
        name: 'publishedAt',
        title: 'Published At',
        type: 'datetime',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'coverImage',
        title: 'Cover Image',
        type: 'image',
        options: {
          hotspot: true,
        },
      },
      {
        name: 'title',
        title: 'Title',
        type: 'object',
        fields: [
          { name: 'en', title: 'English', type: 'string', validation: (Rule: any) => Rule.max(180) },
          { name: 'es', title: 'Spanish', type: 'string', validation: (Rule: any) => Rule.max(180) },
        ],
      },
      {
        name: 'slug',
        title: 'Slug',
        type: 'slug',
        options: {
          source: 'title.en', // Genera el slug a partir del título en inglés
          maxLength: 96,
        },
      },
      {
        name: 'shortDescription',
        title: 'Short Description',
        type: 'object',
        fields: [
          { name: 'en', title: 'English', type: 'string', validation: (Rule: any) => Rule.max(180) },
          { name: 'es', title: 'Spanish', type: 'string', validation: (Rule: any) => Rule.max(180) },
        ],
      },
      {
        name: 'description',
        title: 'Description',
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
    ],
  }
  