import { gql } from 'graphql-tag';

export const mediaQuery = gql`
  query Media($first: Int, $last: Int, $after: String, $before: String, $order: MediaOrder, $filter: MediaFilter) {
    medias(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          proxyId
          type
          updatedAt
          image {
            size
            name
            url
          }
          file {
            name
            size
            url
          }
          owner {
            firstName
            lastName
          }
          imageWebUrl
          fileWebUrl
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

export const getMediaQuery = gql`
  query getMedia($id: GlobalID!) {
    media(id: $id) {
          id
          proxyId
          type
          image {
            size
            name
            url
          }
          file {
            name
            size
            url
          }
          imageWebUrl
          fileWebUrl
          videoUrl
    }
  }
`;

export const imageQuery = gql`
  query Images($first: Int, $last: Int, $after: String, $before: String, $order: ImageOrder, $filter: ImageFilter) {
    images(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          type
          updatedAt
          image {
            size
            name
            url
          }
          owner {
            firstName
            lastName
          }
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
          proxyId
          type
          image {
            size
            name
            url
          }
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
          type
          updatedAt
          videoUrl
          owner {
            firstName
            lastName
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

export const getVideoQuery = gql`
  query getVideo($id: GlobalID!) {
    video(id: $id) {
      id
      type
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
          type
          fileWebUrl
          updatedAt
          file {
            name
            size
            url
          }
          owner {
            firstName
            lastName
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

export const getFileQuery = gql`
  query getFile($id: GlobalID!) {
    file(id: $id) {
      id
      fileWebUrl
    }
  }
`;

export const mediaProductThroughQuery = gql`
  query MediaProductThroughs($first: Int, $last: Int, $after: String, $before: String, $order: MediaProductThroughOrder, $filter: MediaProductThroughFilter) {
    mediaProductThroughs(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          productId
          active
          productType
          media {
              id
              proxyId
              type
              updatedAt
              image {
                size
                name
                url
              }
              file {
                name
                size
                url
              }
              owner {
                firstName
                lastName
              }
              imageWebUrl
              fileWebUrl
              videoUrl
          }
          product {
            id
            name
            active
            type
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

export const imagesCnt = gql`
  query ImagesCnt {
    medias(filters: {type: {exact: "IMAGE"}}) {
      totalCount
    }
  }
`;

export const videosCnt = gql`
  query VideosCnt {
    medias(filters: {type: {exact: "VIDEO"}}) {
      totalCount
    }
  }
`;

export const filesCnt = gql`
  query FilesCnt {
    medias(filters: {type: {exact: "FILE"}}) {
      totalCount
    }
  }
`;