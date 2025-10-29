import { gql } from 'graphql-tag';

export const ebayProductCategoriesQuery = gql`
  query EbayProductCategories($filter: EbayProductCategoryFilter) {
    ebayProductCategories(filters: $filter) {
      edges {
        node {
          id
          remoteId
          view {
            id
            defaultCategoryTreeId
            salesChannel {
              id
              hostname
            }
          }
        }
      }
    }
  }
`;
