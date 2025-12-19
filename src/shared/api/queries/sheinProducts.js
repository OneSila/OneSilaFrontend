import { gql } from 'graphql-tag';

export const sheinProductCategoriesQuery = gql`
  query SheinProductCategories($filter: SheinProductCategoryFilter) {
    sheinProductCategories(filters: $filter) {
      edges {
        node {
          id
          remoteId
          salesChannel {
            id
            hostname
          }
        }
      }
    }
  }
`;

