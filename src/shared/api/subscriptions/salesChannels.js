import { gql } from 'graphql-tag';

// Sales Channel Subscription
export const salesChannelSubscription = gql`
  subscription getSalesChannelSubscription($pk: String!) {
    salesChannel(pk: $pk) {
      id
      active
      isImporting
      saleschannelimportSet {
        id
        status
        percentage
        createdAt
      }
      amazonImports {
        id
        proxyId
        type
        status
        percentage
        createdAt
      }
    }
  }
`;

export const salesChannelIntegrationPricelistSubscription = gql`
  subscription getSalesChannelIntegrationPricelistSubscription($pk: String!) {
    salesChannelIntegrationPricelist(pk: $pk) {
      id
      name
      active
    }
  }
`;

export const salesChannelViewAssignSubscription = gql`
  subscription getSalesChannelViewAssignSubscription($pk: String!) {
    salesChannelViewAssign(pk: $pk) {
      id
      integrationType
      product {
        id
        name
      }
      salesChannelView {
        id
        name
      }
    }
  }
`;

// Amazon Property Subscription
export const getAmazonPropertySubscription = gql`
  subscription getAmazonPropertySubscription($pk: String!) {
    amazonProperty(pk: $pk) {
      id
      mappedLocally
      mappedRemotely
      code
      name
      type
      allowsUnmappedValues
      localInstance {
        id
        name
      }
    }
  }
`;

// Amazon Property Select Value Subscription
export const getAmazonPropertySelectValueSubscription = gql`
  subscription getAmazonPropertySelectValueSubscription($pk: String!) {
    amazonPropertySelectValue(pk: $pk) {
      id
      mappedLocally
      mappedRemotely
      amazonProperty {
        id
        name
      }
      marketplace {
        id
        name
      }
      remoteValue
      remoteName
      localInstance {
        id
        value
      }
    }
  }
`;

// Amazon Product Type Subscription
export const getAmazonProductTypeSubscription = gql`
  subscription getAmazonProductTypeSubscription($pk: String!) {
    amazonProductType(pk: $pk) {
      id
      mappedLocally
      mappedRemotely
      productTypeCode
      name
      localInstance {
        id
        productType {
          id
          value
        }
      }
    }
  }
`;
