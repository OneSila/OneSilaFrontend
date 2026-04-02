export const routes = [
  {
    path: '/imports_exports/mapped-imports',
    name: 'importsExports.mappedImports.list',
    meta: { title: 'importsExports.mappedImports.title' },
    component: () => import('./mapped-imports/mapped-imports-list/MappedImportsListController.vue'),
  },
  {
    path: '/imports_exports/mapped-imports/new',
    name: 'importsExports.mappedImports.create',
    meta: { title: 'importsExports.mappedImports.create.title' },
    component: () => import('./mapped-imports/mapped-import-create/MappedImportCreateController.vue'),
  },
  {
    path: '/imports_exports/mapped-imports/:id',
    name: 'importsExports.mappedImports.show',
    meta: { title: 'importsExports.mappedImports.show.title' },
    component: () => import('./mapped-imports/mapped-import-show/MappedImportShowController.vue'),
  },
  {
    path: '/imports_exports/mapped-imports/:id/edit',
    name: 'importsExports.mappedImports.edit',
    meta: { title: 'importsExports.mappedImports.edit.title' },
    component: () => import('./mapped-imports/mapped-import-edit/MappedImportEditController.vue'),
  },
  {
    path: '/imports_exports/exports',
    name: 'importsExports.exports.list',
    meta: { title: 'importsExports.exports.title' },
    component: () => import('./exports/exports-list/ExportsListController.vue'),
  },
  {
    path: '/imports_exports/exports/new',
    name: 'importsExports.exports.create',
    meta: { title: 'importsExports.exports.create.title' },
    component: () => import('./exports/export-create/ExportCreateController.vue'),
  },
  {
    path: '/imports_exports/exports/:id',
    name: 'importsExports.exports.show',
    meta: { title: 'importsExports.exports.show.title' },
    component: () => import('./exports/export-show/ExportShowController.vue'),
  },
  {
    path: '/imports_exports/exports/:id/edit',
    name: 'importsExports.exports.edit',
    meta: { title: 'importsExports.exports.edit.title' },
    component: () => import('./exports/export-edit/ExportEditController.vue'),
  },
];
