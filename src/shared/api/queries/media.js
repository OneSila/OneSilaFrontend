import { gql } from 'graphql-tag';

export const mediaQuery = gql`
  query Media($first: Int, $last: Int, $after: String, $before: String, $order: MediaOrder, $filter: MediaFilter) {
    medias(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          type
          imageWebUrl
        }
        cursor
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const getMediaQuery = gql`
  query getMedia($id: GlobalID!) {
    media(id: $id) {
      id
      type
      imageWebUrl
    }
  }
`;

export const imageQuery = gql`
  query Images($first: Int, $last: Int, $after: String, $before: String, $order: ImageOrder, $filter: ImageFilter) {
    images(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          imageWebUrl
        }
        cursor
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const getImageQuery = gql`
  query getImage($id: GlobalID!) {
    image(id: $id) {
      id
      imageWebUrl
    }
  }
`;

export const videoQuery = gql`
  query Videos($first: Int, $last: Int, $after: String, $before: String, $order: VideoOrder, $filter: VideoFilter) {
    videos(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          videoUrl
        }
        cursor
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const getVideoQuery = gql`
  query getVideo($id: GlobalID!) {
    video(id: $id) {
      id
      videoUrl
    }
  }
`;

export const fileQuery = gql`
  query Files($first: Int, $last: Int, $after: String, $before: String, $order: FileOrder, $filter: FileFilter) {
    files(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
        }
        cursor
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const getFileQuery = gql`
  query getFile($id: GlobalID!) {
    file(id: $id) {
      id
    }
  }
`;

export const mediaProductThroughQuery = gql`
  query MediaProductThroughs($first: Int, $last: Int, $after: String, $before: String, $order: MediaProductThroughOrder, $filter: MediaProductThroughFilter) {
    mediaProductThroughs(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          media {
            id
            type
          }
          product {
            id
            name
          }
        }
        cursor
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const getMediaProductThroughQuery = gql`
  query getMediaProductThrough($id: GlobalID!) {
    mediaProductThrough(id: $id) {
      id
      media {
        id
        type
      }
      product {
        id
        name
      }
    }
  }
`;

