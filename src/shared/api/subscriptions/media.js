import { gql } from 'graphql-tag';

export const mediaSubscription = gql`
  subscription getMediaSubscription($pk: String!) {
    media(pk: $pk) {
      id
      type
      imageWebUrl
    }
  }
`;

export const imageSubscription = gql`
  subscription getImageSubscription($pk: String!) {
    image(pk: $pk) {
      id
      imageType
      imageWebUrl
      imageUrl
      title
      description
      type
      image {
        size
        name
      }
    }
  }
`;
export const fileSubscription = gql`
  subscription getFileSubscription($pk: String!) {
    file(pk: $pk) {
      id
      fileUrl
      title
      description
      documentLanguage
      documentType {
        id
        name
        code
      }
      file {
        size
        name
        url
      }
    }
  }
`;

export const videoSubscription = gql`
  subscription getVideoSubscription($pk: String!) {
    video(pk: $pk) {
      id
      videoUrl
      title
      description
    }
  }
`;
