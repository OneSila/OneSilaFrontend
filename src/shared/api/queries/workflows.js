import { gql } from 'graphql-tag';

export const workflowsQuery = gql`
  query Workflows($first: Int, $last: Int, $after: String, $before: String, $order: WorkflowOrder, $filter: WorkflowFilter) {
    workflows(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          code
          sortOrder
          autoAddConfigurableProducts
          autoAddSimpleProducts
          autoAddBundleProducts
          autoAddAliasProducts
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

export const workflowsOverviewQuery = gql`
  query WorkflowsOverview($first: Int, $last: Int, $after: String, $before: String, $order: WorkflowOrder, $filter: WorkflowFilter) {
    workflows(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          autoAddConfigurableProducts
          autoAddSimpleProducts
          autoAddBundleProducts
          autoAddAliasProducts
          productsCount
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

export const workflowsQuerySelector = gql`
  query WorkflowsSelector($first: Int, $last: Int, $after: String, $before: String, $order: WorkflowOrder, $filter: WorkflowFilter) {
    workflows(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
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

export const workflowAssignmentOptionsQuery = gql`
  query WorkflowAssignmentOptions($first: Int, $last: Int, $after: String, $before: String, $order: WorkflowOrder, $filter: WorkflowFilter) {
    workflows(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          sortOrder
          states {
            id
            value
            sortOrder
            isDefault
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

export const workflowStatesQuerySelector = gql`
  query WorkflowStatesSelector($first: Int, $last: Int, $after: String, $before: String, $order: WorkflowStateOrder, $filter: WorkflowStateFilter) {
    workflowStates(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          fullName
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

export const getWorkflowQuery = gql`
  query GetWorkflow($id: ID!) {
    workflow(id: $id) {
      id
      name
      description
      code
      sortOrder
      autoAddConfigurableProducts
      autoAddSimpleProducts
      autoAddBundleProducts
      autoAddAliasProducts
      states {
        id
        value
        code
        sortOrder
        isDefault
        assignments {
          id
        }
      }
      productAssignments {
        id
      }
    }
  }
`;

export const workflowBoardQuery = gql`
  query WorkflowBoard($id: ID!) {
    workflow(id: $id) {
      id
      name
      description
      states {
        id
        value
        sortOrder
        isDefault
      }
    }
  }
`;

export const workflowProductAssignmentsQuery = gql`
  query WorkflowProductAssignments($first: Int, $last: Int, $after: String, $before: String, $order: WorkflowProductAssignmentOrder, $filter: WorkflowProductAssignmentFilter) {
    workflowProductAssignments(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          workflowState {
            id
          }
          product {
            id
            name
            sku
            type
            active
            createdAt
            thumbnailUrl
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

export const workflowStateTransitionCandidatesQuery = gql`
  query WorkflowStateTransitionCandidates($id: ID!) {
    workflow(id: $id) {
      id
      productAssignments {
        id
        createdAt
        workflowState {
          id
        }
        product {
          id
        }
      }
    }
  }
`;

export const workflowAssignableProductsQuery = gql`
  query WorkflowAssignableProducts($first: Int, $last: Int, $after: String, $before: String, $order: ProductOrder, $filter: ProductFilter) {
    products(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          sku
          thumbnailUrl
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
