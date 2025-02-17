import { gql } from 'graphql-tag';

// Sales Channel Subscription
export const salesChannelSubscription = gql`
  subscription getSalesChannelSubscription($pk: String!) {
    salesChannel(pk: $pk) {
      id
      name
      active
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
