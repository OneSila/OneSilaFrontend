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
      hasParents
      productpropertySet {
          id
          property {
            id
            name
            type
            isProductType
          }
          valueSelect {
            id
            value
            productpropertiesruleSet {
                id
            }
          }
          valueMultiSelect {
             id
             value
          }
          valueBoolean
          valueInt
          valueFloat
          valueDate
          valueDatetime
      }
      aliasParentProduct {
        id
        name
        sku
        type
      }
      aliasProducts {
        id
        name
        type
        sku
        active
        thumbnailUrl
        inspectorStatus
      }
      inspector {
        id
        hasMissingInformation
      }
      vatRate {
        id
        rate
        name
      }
      allowBackorder
      saleschannelviewassignSet {
          id
          remoteId
          remoteUrl
          remoteProductPercentage
          integrationType
          product {
            id
            name
          }
          salesChannelView {
            id
            name
            active
          }
          remoteProduct {
            id
            hasErrors
          }
        }
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
