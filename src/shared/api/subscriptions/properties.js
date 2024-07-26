import { gql } from 'graphql-tag';

// Property Subscription
export const getPropertySubscription = gql`
  subscription getPropertySubscription($pk: String!) {
    property(pk: $pk) {
      id
      name
      type
      isPublicInformation
      addToFilters
      isProductType
      internalName
      valueValidator
    }
  }
`;

// Property Translation Subscription
export const getPropertyTranslationSubscription = gql`
  subscription getPropertyTranslationSubscription($pk: String!) {
    propertyTranslation(pk: $pk) {
      id
      name
      language
    }
  }
`;

// Property Select Value Subscription
export const getPropertySelectValueSubscription = gql`
  subscription getPropertySelectValueSubscription($pk: String!) {
    propertySelectValue(pk: $pk) {
      id
      value
      property {
        id
        name
        isProductType
      }
    }
  }
`;

// Product Property Subscription
export const getProductPropertySubscription = gql`
  subscription getProductPropertySubscription($pk: String!) {
    productProperty(pk: $pk) {
      id
      product {
        id
        name
      }
      property {
        id
        name
      }
    }
  }
`;

// Product Property Text Translation Subscription
export const getProductPropertyTextTranslationSubscription = gql`
  subscription getProductPropertyTextTranslationSubscription($pk: String!) {
    productPropertyTextTranslation(pk: $pk) {
      id
      valueText
      valueDescription
      language
      productProperty {
        id
        product {
          id
          name
        }
        property {
          id
          name
        }
      }
    }
  }
`;

// Property Select Value Translation Subscription
export const getPropertySelectValueTranslationSubscription = gql`
  subscription getPropertySelectValueTranslationSubscription($pk: String!) {
    propertySelectValueTranslation(pk: $pk) {
      id
      value
      language
      propertySelectValue {
        id
        property {
          id
          name
        }
      }
    }
  }
`;

// Product Property Rule
export const getProductPropertiesRuleSubscription = gql`
  subscription getProductPropertiesRuleSubscription($pk: String!) {
    productPropertiesRule(pk: $pk) {
      id
      productType {
        id
        value
      }
    }
  }
`;