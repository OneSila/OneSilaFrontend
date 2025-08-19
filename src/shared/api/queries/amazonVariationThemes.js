import { gql } from 'graphql-tag';

export const amazonVariationThemesQuery = gql`
  query AmazonVariationThemes($filter: AmazonVariationThemeFilter) {
    amazonVariationThemes(filters: $filter) {
      edges {
        node {
          id
          theme
          product {
            id
          }
          view {
            id
          }
        }
      }
    }
  }
`;
