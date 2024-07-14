import { gql } from 'graphql-tag';

export const currenciesQuery = gql`
  query Currencies($first: Int, $last: Int, $after: String, $before: String, $order: CurrencyOrder, $filter: CurrencyFilter) {
    currencies(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          isoCode
          name
          symbol
          inheritsFrom {
            id
            name
          }
          exchangeRate
          exchangeRateOfficial
          followOfficialRate
          roundPricesUpTo
          isDefaultCurrency
          comment
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

export const getCurrencyQuery = gql`
  query getCurrency($id: GlobalID!) {
    currency(id: $id) {
      id
      isoCode
      name
      symbol
      inheritsFrom {
        id
        name
      }
      exchangeRate
      exchangeRateOfficial
      followOfficialRate
      roundPricesUpTo
      isDefaultCurrency
      comment
    }
  }
`;



export const publicCurrenciesQuery = gql`
query PublicCurrency {
    publicCurrencies {
      edges {
        node {
          id
          name
          isoCode
          symbol
        }
      }
    }
  }
`;
