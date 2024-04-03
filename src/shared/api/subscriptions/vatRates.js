import { gql } from 'graphql-tag';

export const vatRateSubscription = gql`
  subscription getVatRateSubscription($pk: String!) {
    vatRate(pk: $pk) {
      id
      rate
      name
    }
  }
`;
