import { gql } from 'graphql-tag';

export const createMediaMutation = gql`
  mutation createMedia($data: MediaInput!) {
    createMedia(data: $data) {
      id
      type
      imageWebUrl
    }
  }
`;

export const createMediasMutation = gql`
  mutation createMedias($data: [MediaInput!]!) {
    createMedias(data: $data) {
      id
      type
      imageWebUrl
    }
  }
`;

export const updateMediaMutation = gql`
  mutation updateMedia($data: MediaPartialInput!) {
    updateMedia(data: $data) {
      id
      type
      imageWebUrl
    }
  }
`;

export const deleteMediaMutation = gql`
  mutation deleteMedia($id: GlobalID!) {
    deleteMedia(data: {id: $id}) {
      id
    }
  }
`;

export const deleteMediasMutation = gql`
  mutation deleteMedias($data: [NodeInput!]!) {
    deleteMedias(data: $data) {
      id
    }
  }
`;

export const createImageMutation = gql`
  mutation createImage($data: ImageInput!) {
    createImage(data: $data) {
      id
      imageWebUrl
    }
  }
`;

export const createImagesMutation = gql`
  mutation createImages($data: [ImageInput!]!) {
    createImages(data: $data) {
      id
      imageWebUrl
    }
  }
`;

export const updateImageMutation = gql`
  mutation updateImage($data: ImagePartialInput!) {
    updateImage(data: $data) {
      id
      imageWebUrl
    }
  }
`;

export const deleteImageMutation = gql`
  mutation deleteImage($id: GlobalID!) {
    deleteImage(data: {id: $id}) {
      id
    }
  }
`;

export const deleteImagesMutation = gql`
  mutation deleteImages($data: [NodeInput!]!) {
    deleteImages(data: $data) {
      id
    }
  }
`;

export const createFileMutation = gql`
  mutation createFile($data: FileInput!) {
    createFile(data: $data) {
      id
    }
  }
`;

export const createFilesMutation = gql`
  mutation createFiles($data: [FileInput!]!) {
    createFiles(data: $data) {
      id
    }
  }
`;

export const updateFileMutation = gql`
  mutation updateFile($data: FilePartialInput!) {
    updateFile(data: $data) {
      id
    }
  }
`;

export const deleteFileMutation = gql`
  mutation deleteFile($id: GlobalID!) {
    deleteFile(data: {id: $id}) {
      id
    }
  }
`;

export const deleteFilesMutation = gql`
  mutation deleteFiles($data: [NodeInput!]!) {
    deleteFiles(data: $data) {
      id
    }
  }
`;

export const createVideoMutation = gql`
  mutation createVideo($data: VideoInput!) {
    createVideo(data: $data) {
      id
      videoUrl
    }
  }
`;

export const createVideosMutation = gql`
  mutation createVideos($data: [VideoInput!]!) {
    createVideos(data: $data) {
      id
      videoUrl
    }
  }
`;

export const updateVideoMutation = gql`
  mutation updateVideo($data: VideoPartialInput!) {
    updateVideo(data: $data) {
      id
      videoUrl
    }
  }
`;

export const deleteVideoMutation = gql`
  mutation deleteVideo($id: GlobalID!) {
    deleteVideo(data: {id: $id}) {
      id
    }
  }
`;

export const deleteVideosMutation = gql`
  mutation deleteVideos($data: [NodeInput!]!) {
    deleteVideos(data: $data) {
      id
    }
  }
`;

export const createMediaProductThroughMutation = gql`
  mutation createMediaproducthrough($data: MediaProductThroughInput!) {
    createMediaproducthrough(data: $data) {
      id
      media {
        id
      }
      product {
        id
      }
    }
  }
`;

export const createMediaProductThroughsMutation = gql`
  mutation createMediaProductThroughs($data: [MediaProductThroughInput!]!) {
    createMediaProductThroughs(data: $data) {
      id
      media {
        id
      }
      product {
        id
      }
    }
  }
`;

export const updateMediaProductThroughMutation = gql`
  mutation updateMediaproducthrough($data: MediaProductThroughPartialInput!) {
    updateMediaproducthrough(data: $data) {
      id
      media {
        id
      }
      product {
        id
      }
    }
  }
`;

export const deleteMediaProductThroughMutation = gql`
  mutation deleteMediaproducthrough($id: GlobalID!) {
    deleteMediaproducthrough(data: {id: $id}) {
      id
    }
  }
`;

export const deleteMediaProductThroughsMutation = gql`
  mutation deleteMediaproducthroughs($ids: [GlobalID!]!) {
    deleteMediaproducthroughs(data: {ids: $ids}) {
      id
    }
  }
`;
