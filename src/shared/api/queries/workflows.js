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
          autoAddOnProduct
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
          autoAddOnProduct
          productAssignments {
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
  query GetWorkflow($id: GlobalID!) {
    workflow(id: $id) {
      id
      name
      description
      code
      sortOrder
      autoAddOnProduct
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
  query WorkflowBoard($id: GlobalID!) {
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
      productAssignments {
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
    }
  }
`;

export const workflowStateTransitionCandidatesQuery = gql`
  query WorkflowStateTransitionCandidates($id: GlobalID!) {
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
