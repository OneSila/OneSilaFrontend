export const routes = [
    {path: '/medias/files', name: 'media.files', component: () => import('./files/FilesListController.vue')},
    {
        path: '/medias/images',
        name: 'media.images.list',
        meta: { title: 'media.images.title' },
        component: () => import('./images/images-list/ImagesListController.vue')
    },
    {
        path: '/medias/videos',
        name: 'media.videos.list',
        meta: { title: 'media.videos.title' },
        component: () => import('./videos/videos-list/VideosListController.vue')
    },
    {
        path: '/medias/documents',
        name: 'media.documents.list',
        meta: { title: 'media.documents.title' },
        component: () => import('./documents/documents-list/DocumentsListController.vue')
    },

    {
        path: '/medias/images/:id',
        name: 'media.images.show',
        meta: { title: 'media.images.show.title' },
        component: () => import('./images/image-show/ImageShowController.vue')
    },
    {
        path: '/medias/videos/:id',
        name: 'media.videos.show',
        meta: { title: 'media.videos.show.title' },
        component: () => import('./videos/video-show/VideoShowController.vue')
    },
    {
        path: '/medias/documents/:id',
        name: 'media.documents.show',
        meta: { title: 'media.documents.show.title' },
        component: () => import('./documents/document-show/DocumentShowController.vue')
    },
]
