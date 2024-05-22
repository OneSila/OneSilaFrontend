import { gql } from 'graphql-tag';

export const hsCodesQuery = gql`
  query HsCodes($first: Int, $last: Int, $after: String, $before: String, $order: HsCodeOrder, $filter: HsCodeFilter) {
    hsCodes(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          code
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

export const getHsCodeQuery = gql`
  query getHsCode($id: GlobalID!) {
    hsCode(id: $id) {
      id
      name
      code
      product {
        id
        ... on ProductType {
          sku
          name
        }
      }
    }
  }
`;
