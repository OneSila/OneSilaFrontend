import { gql } from 'graphql-tag';

export const eanCodesQuery = gql`
  query EanCodes($first: Int, $last: Int, $after: String, $before: String, $order: EanCodeOrder, $filter: EanCodeFilter) {
    eanCodes(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          eanCode
          product {
            id
            ... on ProductType {
              sku
            }
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

export const getEanCodeQuery = gql`
  query getEanCode($id: GlobalID!) {
    eanCode(id: $id) {
      id
      eanCode
      product {
        id
        ... on ProductType {
          sku
        }
      }
    }
  }
`;
