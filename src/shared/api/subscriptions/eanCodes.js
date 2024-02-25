import { gql } from 'graphql-tag';

export const eanCodeSubscription = gql`
  subscription getEanCodeSubscription($pk: String!) {
    eanCode(pk: $pk) {
      id
      eanCode
      product {
        id
        sku
        // Additional fields as needed for Product
      }
    }
  }
`;
