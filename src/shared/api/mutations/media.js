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
  mutation deleteMedias($ids: [GlobalID!]!) {
    deleteMedias(data: {ids: $ids}) {
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
  mutation deleteImages($ids: [GlobalID!]!) {
    deleteImages(data: {ids: $ids}) {
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
  mutation deleteFiles($ids: [GlobalID!]!) {
    deleteFiles(data: {ids: $ids}) {
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
  mutation deleteVideos($ids: [GlobalID!]!) {
    deleteVideos(data: {ids: $ids}) {
      id
    }
  }
`;

export const createMediaProductThroughMutation = gql`
  mutation createMediaProductThrough($data: MediaProductThroughInput!) {
    createMediaProductThrough(data: $data) {
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
  mutation updateMediaProductThrough($data: MediaProductThroughPartialInput!) {
    updateMediaProductThrough(data: $data) {
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
  mutation deleteMediaProductThrough($id: GlobalID!) {
    deleteMediaProductThrough(data: {id: $id}) {
      id
    }
  }
`;

export const deleteMediaProductThroughsMutation = gql`
  mutation deleteMediaProductThroughs($ids: [GlobalID!]!) {
    deleteMediaProductThroughs(data: {ids: $ids}) {
      id
    }
  }
`;
