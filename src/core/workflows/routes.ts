export const routes = [
  {
    path: '/workflows',
    name: 'workflows.list',
    meta: { title: 'products.workflows.title' },
    component: () => import('./workflows-list/WorkflowsListController.vue')
  },
  {
    path: '/workflows/:id',
    name: 'workflows.kanban',
    meta: { title: 'products.workflows.title' },
    component: () => import('../products/workflows/ProductWorkflowsController.vue')
  },
];
