import { gql } from 'graphql-tag';

export const currencySubscription = gql`
  subscription getCurrencySubscription($pk: String!) {
    currency(pk: $pk) {
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
