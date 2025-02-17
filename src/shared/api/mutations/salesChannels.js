// salesChannelMutations.ts
import { gql } from 'graphql-tag';

// Sales Channel Mutations
export const createSalesChannelMutation = gql`
  mutation createSalesChannel($data: SalesChannelInput!) {
    createSalesChannel(data: $data) {
      id
      name
      active
      multiTenantCompany {
        id
        name
      }
    }
  }
`;

export const createSalesChannelsMutation = gql`
  mutation createSalesChannels($data: [SalesChannelInput!]!) {
    createSalesChannels(data: $data) {
      id
      name
      active
      multiTenantCompany {
        id
        name
      }
    }
  }
`;

export const updateSalesChannelMutation = gql`
  mutation updateSalesChannel($data: SalesChannelPartialInput!) {
    updateSalesChannel(data: $data) {
      id
      name
      active
      multiTenantCompany {
        id
        name
      }
    }
  }
`;

export const deleteSalesChannelMutation = gql`
  mutation deleteSalesChannel($id: GlobalID!) {
    deleteSalesChannel(data: { id: $id }) {
      id
    }
  }
`;

export const deleteSalesChannelsMutation = gql`
  mutation deleteSalesChannels($ids: [GlobalID!]!) {
    deleteSalesChannels(data: { ids: $ids }) {
      id
    }
  }
`;

// Sales Channel Integration Price List Mutations
export const createSalesChannelIntegrationPricelistMutation = gql`
  mutation createSalesChannelIntegrationPricelist($data: SalesChannelIntegrationPricelistInput!) {
    createSalesChannelIntegrationPricelist(data: $data) {
      id
      name
      active
      multiTenantCompany {
        id
        name
      }
    }
  }
`;

export const createSalesChannelIntegrationPricelistsMutation = gql`
  mutation createSalesChannelIntegrationPricelists($data: [SalesChannelIntegrationPricelistInput!]!) {
    createSalesChannelIntegrationPricelists(data: $data) {
      id
      name
      active
      multiTenantCompany {
        id
        name
      }
    }
  }
`;

export const updateSalesChannelIntegrationPricelistMutation = gql`
  mutation updateSalesChannelIntegrationPricelist($data: SalesChannelIntegrationPricelistPartialInput!) {
    updateSalesChannelIntegrationPricelist(data: $data) {
      id
      name
      active
      multiTenantCompany {
        id
        name
      }
    }
  }
`;

export const deleteSalesChannelIntegrationPricelistMutation = gql`
  mutation deleteSalesChannelIntegrationPricelist($id: GlobalID!) {
    deleteSalesChannelIntegrationPricelist(data: { id: $id }) {
      id
    }
  }
`;

export const deleteSalesChannelIntegrationPricelistsMutation = gql`
  mutation deleteSalesChannelIntegrationPricelists($ids: [GlobalID!]!) {
    deleteSalesChannelIntegrationPricelists(data: { ids: $ids }) {
      id
    }
  }
`;

// Sales Channel View Assign Mutations
export const createSalesChannelViewAssignMutation = gql`
  mutation createSalesChannelViewAssign($data: SalesChannelViewAssignInput!) {
    createSalesChannelViewAssign(data: $data) {
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

export const createSalesChannelViewAssignsMutation = gql`
  mutation createSalesChannelViewAssigns($data: [SalesChannelViewAssignInput!]!) {
    createSalesChannelViewAssigns(data: $data) {
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

export const updateSalesChannelViewAssignMutation = gql`
  mutation updateSalesChannelViewAssign($data: SalesChannelViewAssignPartialInput!) {
    updateSalesChannelViewAssign(data: $data) {
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

export const deleteSalesChannelViewAssignMutation = gql`
  mutation deleteSalesChannelViewAssign($id: GlobalID!) {
    deleteSalesChannelViewAssign(data: { id: $id }) {
      id
    }
  }
`;

export const deleteSalesChannelViewAssignsMutation = gql`
  mutation deleteSalesChannelViewAssigns($ids: [GlobalID!]!) {
    deleteSalesChannelViewAssigns(data: { ids: $ids }) {
      id
    }
  }
`;
