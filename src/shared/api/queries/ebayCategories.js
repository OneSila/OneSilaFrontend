import { gql } from 'graphql-tag';

export const ebayCategoriesQuery = gql`
  query EbayCategories($filter: EbayCategoryFilter) {
    ebayCategories(filters: $filter) {
      remoteId
      name
      marketplaceDefaultTreeId
    }
  }
`;
