import { gql } from 'graphql-tag';

// Sales Channel Queries
export const salesChannelsQuery = gql`
  query SalesChannels($first: Int, $last: Int, $after: String, $before: String, $order: SalesChannelOrder, $filter: SalesChannelFilter) {
    salesChannels(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          active
          multiTenantCompany {
            id
            name
          }
        }
        cursor
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const getSalesChannelQuery = gql`
  query getSalesChannel($id: GlobalID!) {
    salesChannel(id: $id) {
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

// Sales Channel Integration Pricelist Queries
export const salesChannelIntegrationPricelistsQuery = gql`
  query SalesChannelIntegrationPricelists($first: Int, $last: Int, $after: String, $before: String, $order: SalesChannelIntegrationPricelistOrder, $filter: SalesChannelIntegrationPricelistFilter) {
    salesChannelIntegrationPricelists(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          active
          multiTenantCompany {
            id
            name
          }
        }
        cursor
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const getSalesChannelIntegrationPricelistQuery = gql`
  query getSalesChannelIntegrationPricelist($id: GlobalID!) {
    salesChannelIntegrationPricelist(id: $id) {
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

// Sales Channel View Assign Queries
export const salesChannelViewAssignsQuery = gql`
  query SalesChannelViewAssigns($first: Int, $last: Int, $after: String, $before: String, $order: SalesChannelViewAssignOrder, $filter: SalesChannelViewAssignFilter) {
    salesChannelViewAssigns(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          remoteUrl
          product {
            id
            name
          }
          salesChannelView {
            id
            name
            active
          }
        }
        cursor
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const getSalesChannelViewAssignQuery = gql`
  query getSalesChannelViewAssign($id: GlobalID!) {
    salesChannelViewAssign(id: $id) {
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

// Sales Channel View Queries
export const salesChannelViewsQuery = gql`
  query SalesChannelViews($first: Int, $last: Int, $after: String, $before: String, $order: SalesChannelViewOrder, $filter: SalesChannelViewFilter) {
    salesChannelViews(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          active
          salesChannel {
            id
 
          }
        }
        cursor
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const getSalesChannelViewQuery = gql`
  query getSalesChannelView($id: GlobalID!) {
    salesChannelView(id: $id) {
      id
      name
      active
      salesChannel {
        id
      }
    }
  }
`;