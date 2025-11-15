# UIDesigner

UI Designer is a Vue 3 + PrimeVue + Tailwind CSS based low-code editor that allows building responsive application interfaces without writing code.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` – start Vite dev server.
- `npm run build` – build production bundle.
- `npm run preview` – preview production build.
- `npm run test` – run unit tests with Vitest.
- `npm run cypress` – run Cypress e2e tests.

## Features

- Drag-and-drop canvas with resize and snap-to-grid.
- Component palette, templates, and hierarchical tree.
- Dynamic properties editor with Tailwind styling controls.
- Data sources manager with REST and static bindings.
- Event-action system with runtime execution.
- JSON schema serialization, import/export, and history.
- Preview renderer executing bindings and actions.
- Pinia-powered stores with undo/redo and theme settings.

## Testing

Vitest covers Pinia stores while Cypress ensures the editor shell loads correctly.
