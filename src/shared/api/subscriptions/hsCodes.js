import { gql } from 'graphql-tag';

export const hsCodeSubscription = gql`
  subscription getHsCodeSubscription($pk: String!) {
    hsCode(pk: $pk) {
      id
      name
      code
      product {
        id
        name
      }
    }
  }
`;
