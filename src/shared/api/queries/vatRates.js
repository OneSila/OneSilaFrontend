import { gql } from 'graphql-tag';

export const vatRatesQuery = gql`
  query VatRates($first: Int, $last: Int, $after: String, $before: String, $order: VatRateOrder, $filter: VatRateFilter) {
    vatRates(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          rate
          name
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

export const getVatRateQuery = gql`
  query getVatRate($id: GlobalID!) {
    vatRate(id: $id) {
      id
      rate
      name
    }
  }
`;
