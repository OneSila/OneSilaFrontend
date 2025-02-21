import { gql } from 'graphql-tag';

export const productSubscription = gql`
  subscription getProductSubscription($pk: String!) {
    product(pk: $pk) {
      id
      sku
      active
      type
      proxyId
      name
      thumbnailUrl
      inspector {
        id
      }
      vatRate {
        id
        rate
        name
      }
      allowBackorder
    }
  }
`;

export const inspectorSubscription = gql`
  subscription getInspectorSubscription($pk: String!) {
    inspector(pk: $pk) {
      id
      hasMissingInformation
      hasMissingOptionalInformation
      errors
    }
  }
`;

export const bundleProductSubscription = gql`
  subscription getBundleProductSubscription($pk: String!) {
    bundleProduct(pk: $pk) {
      id
      sku
      active
    }
  }
`;

export const configurableProductSubscription = gql`
  subscription getConfigurableProductSubscription($pk: String!) {
    configurableProduct(pk: $pk) {
      id
      sku
      active
    }
  }
`;

export const productVariationSubscription = gql`
  subscription getProductVariationSubscription($pk: String!) {
    productVariation(pk: $pk) {
      id
      sku
      active
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

export const configurableVariationSubscription = gql`
  subscription getConfigurableVariationSubscription($pk: String!) {
    configurableVariation(pk: $pk) {
      id
      parent {
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
      parent {
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
