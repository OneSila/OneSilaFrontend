export const routes = [
  { path: '/medias/files', name: 'media.files', component: () => import('./files/FilesListController.vue') },
  { path: '/medias/images', name: 'media.images.list', component: () => import('./images/images-list/ImagesListController.vue') },
  { path: '/medias/videos', name: 'media.videos.list', component: () => import('./videos/videos-list/VideosListController.vue') },
  { path: '/medias/documents', name: 'media.documents.list', component: () => import('./documents/documents-list/DocumentsListController.vue') },

  { path: '/medias/images/:id', name: 'media.images.show', component: () => import('./images/image-show/ImageShowController.vue') },
  { path: '/medias/videos/:id', name: 'media.videos.show', component: () => import('./videos/video-show/VideoShowController.vue') },
  { path: '/medias/documents/:id', name: 'media.documents.show', component: () => import('./documents/document-show/DocumentShowController.vue') },
]
