import type { MetaUISchema } from '@/types/meta';

/**
 * Default schema used when the editor is initialized.
 */
export const defaultSchema: MetaUISchema = {
  version: '1.0.0',
  appName: 'Demo CRM',
  pages: [
    {
      id: 'page_main',
      name: 'MainPage',
      route: '/main',
      layout: {},
      settings: {},
      dataSources: [
        {
          id: 'ds_contacts',
          name: 'Contacts',
          type: 'static',
          config: {
            staticData: {
              contacts: [
                { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
                { id: 2, name: 'Bob Smith', email: 'bob@example.com' }
              ],
            },
          },
        },
      ],
      events: [],
      components: [
        {
          id: 'cmp_card_1',
          type: 'Card',
          name: 'WelcomeCard',
          layout: { x: 32, y: 32, w: 360, h: 160 },
          props: {
            header: 'Welcome to the CRM',
          },
          bindings: [],
          styles: {
            classes: 'shadow-lg bg-white rounded-lg',
          },
          children: [
            {
              id: 'cmp_text_1',
              type: 'Text',
              props: { text: 'Select a contact on the left to view details.' },
              layout: { x: 0, y: 0, w: 320, h: 40 },
              styles: {
                classes: 'text-slate-600',
              },
            },
            {
              id: 'cmp_button_1',
              type: 'Button',
              props: { label: 'Add Contact', severity: 'primary' },
              layout: { x: 0, y: 56, w: 140, h: 40 },
              events: [
                {
                  event: 'onClick',
                  actions: [
                    {
                      id: 'act_notify',
                      type: 'notification',
                      params: { message: 'Add contact clicked' },
                    },
                  ],
                },
              ],
              styles: {
                classes: 'mt-4',
              },
            },
          ],
        },
        {
          id: 'cmp_table',
          type: 'DataTable',
          props: {
            value: '@data.Contacts.contacts',
            columns: [
              { field: 'name', header: 'Name' },
              { field: 'email', header: 'Email' }
            ],
          },
          layout: { x: 32, y: 220, w: 640, h: 320 },
          styles: {
            classes: 'bg-white rounded-lg shadow-md p-4',
          },
        },
      ],
    },
  ],
  globals: {
    variables: {
      selectedContactId: null,
    },
    theme: {
      id: 'theme_default',
      name: 'Default',
      primePreset: 'aura',
      tailwindPresets: ['rounded', 'shadow'],
      tokens: {
        primary: '#3b82f6',
        secondary: '#64748b',
      },
    },
  },
};
