import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const PopupBanner: GlobalConfig = {
  slug: 'popupBanner',
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'titleTH',
      type: 'text',
    },
    {
      name: 'messageTH',
      type: 'textarea',
    },
    {
      name: 'ctaLabel',
      type: 'text',
    },
    {
      name: 'ctaHref',
      type: 'text',
    },
    {
      name: 'ctaNewTab',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'promo',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Promo', value: 'promo' },
        { label: 'Urgent', value: 'urgent' },
      ],
    },
    {
      name: 'startAt',
      type: 'date',
    },
    {
      name: 'endAt',
      type: 'date',
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Legacy single image (deprecated, use slides instead)',
      },
    },
    {
      name: 'slides',
      type: 'array',
      admin: {
        description: 'Carousel slides - supports multiple images',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Slide title',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Slide description text',
          },
        },
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'Slide image',
          },
        },
        {
          name: 'ctaLabel',
          type: 'text',
          admin: {
            description: 'Button text',
          },
        },
        {
          name: 'ctaHref',
          type: 'text',
          admin: {
            description: 'Button link URL',
          },
        },
        {
          name: 'ctaNewTab',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Open link in new tab',
          },
        },
      ],
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        description: 'Optional. Use YouTube/Vimeo/Facebook URL.',
      },
    },
    {
      name: 'targeting',
      type: 'select',
      hasMany: true,
      defaultValue: ['all'],
      options: [
        { label: 'All pages', value: 'all' },
        { label: 'Home', value: 'home' },
        { label: 'Promotion', value: 'promotion' },
        { label: 'Models', value: 'models' },
        { label: 'Blog', value: 'blog' },
      ],
    },
  ],
  versions: {
    drafts: true,
  },
}
