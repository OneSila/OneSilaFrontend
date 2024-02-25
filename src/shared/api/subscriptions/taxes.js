import { gql } from 'graphql-tag';

export const taxSubscription = gql`
  subscription getTaxSubscription($pk: String!) {
    tax(pk: $pk) {
      id
      rate
      name
    }
  }
`;
