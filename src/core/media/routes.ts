export const routes = [
  { path: '/media/recent-files', name: 'media.files', component: () => import('./files/FilesListController.vue') },
  { path: '/media/images', name: 'media.images.list', component: () => import('./images/images-list/ImagesListController.vue') },
  { path: '/media/videos', name: 'media.videos.list', component: () => import('./videos/videos-list/VideosListController.vue') },
  { path: '/media/documents', name: 'media.documents.list', component: () => import('./documents/documents-list/DocumentsListController.vue') },

]
