import { gql } from 'graphql-tag';

export const productSubscription = gql`
  subscription getProductSubscription($pk: String!) {
    product(pk: $pk) {
      id
      sku
      active
      type
      taxRate {
        id
        rate
      }
      alwaysOnStock
      // Additional fields as needed
    }
  }
`;

export const bundleProductSubscription = gql`
  subscription getBundleProductSubscription($pk: String!) {
    bundleProduct(pk: $pk) {
      id
      sku
      active
      // Additional fields specific to BundleProduct
    }
  }
`;

export const umbrellaProductSubscription = gql`
  subscription getUmbrellaProductSubscription($pk: String!) {
    umbrellaProduct(pk: $pk) {
      id
      sku
      active
      // Additional fields specific to UmbrellaProduct
    }
  }
`;

export const productVariationSubscription = gql`
  subscription getProductVariationSubscription($pk: String!) {
    productVariation(pk: $pk) {
      id
      sku
      active
      // Additional fields specific to ProductVariation
    }
  }
`;

export const productTranslationSubscription = gql`
  subscription getProductTranslationSubscription($pk: String!) {
    productTranslation(pk: $pk) {
      id
      product {
        id
        sku
      }
      name
      shortDescription
      description
    }
  }
`;

export const umbrellaVariationSubscription = gql`
  subscription getUmbrellaVariationSubscription($pk: String!) {
    umbrellaVariation(pk: $pk) {
      id
      umbrella {
        id
        sku
      }
      variation {
        id
        sku
      }
    }
  }
`;

export const bundleVariationSubscription = gql`
  subscription getBundleVariationSubscription($pk: String!) {
    bundleVariation(pk: $pk) {
      id
      umbrella {
        id
        sku
      }
      variation {
        id
        sku
      }
      quantity
    }
  }
`;
