import { gql } from 'graphql-tag';

export const createAmazonVariationThemeMutation = gql`
  mutation createAmazonVariationTheme($data: AmazonVariationThemeInput!) {
    createAmazonVariationTheme(data: $data) {
      id
      theme
      product { id }
      view { id }
    }
  }
`;

export const updateAmazonVariationThemeMutation = gql`
  mutation updateAmazonVariationTheme($data: AmazonVariationThemePartialInput!) {
    updateAmazonVariationTheme(data: $data) {
      id
      theme
      product { id }
      view { id }
    }
  }
`;

export const deleteAmazonVariationThemeMutation = gql`
  mutation deleteAmazonVariationTheme($id: GlobalID!) {
    deleteAmazonVariationTheme(data: { id: $id }) {
      id
    }
  }
`;
