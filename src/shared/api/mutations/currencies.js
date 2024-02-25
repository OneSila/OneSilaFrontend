import { gql } from 'graphql-tag';

export const createCurrencyMutation = gql`
  mutation createCurrency($data: CurrencyInput!) {
    createCurrency(data: $data) {
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

export const createCurrenciesMutation = gql`
  mutation createCurrencies($data: [CurrencyInput!]!) {
    createCurrencies(data: $data) {
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

export const updateCurrencyMutation = gql`
  mutation updateCurrency($data: CurrencyPartialInput!) {
    updateCurrency(data: $data) {
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

export const deleteCurrencyMutation = gql`
  mutation deleteCurrency($id: GlobalID!) {
    deleteCurrency(data: {id: $id}) {
      id
    }
  }
`;

export const deleteCurrenciesMutation = gql`
  mutation deleteCurrencies($ids: [GlobalID!]!) {
    deleteCurrencies(data: {ids: $ids}) {
      id
    }
  }
`;
