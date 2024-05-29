export const routes = [
  { path: '/media/recent-files', name: 'media.files', component: () => import('./files/FilesListController.vue') },
  { path: '/media/images', name: 'media.images.list', component: () => import('./images/images-list/ImagesListController.vue') },
  { path: '/media/videos', name: 'media.videos.list', component: () => import('./videos/videos-list/VideosListController.vue') },
  { path: '/media/documents', name: 'media.documents.list', component: () => import('./documents/documents-list/DocumentsListController.vue') },

  { path: '/media/images/:id', name: 'media.images.show', component: () => import('./images/image-show/ImageShowController.vue') },
  { path: '/media/videos/:id', name: 'media.videos.show', component: () => import('./videos/video-show/VideoShowController.vue') },
  { path: '/media/documents/:id', name: 'media.documents.show', component: () => import('./documents/document-show/DocumentShowController.vue') },
]
