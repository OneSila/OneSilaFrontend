import { gql } from 'graphql-tag';

export const createWorkflowMutation = gql`
  mutation CreateWorkflow($data: WorkflowInput!) {
    createWorkflow(data: $data) {
      id
      name
      description
      code
      sortOrder
      autoAddOnProduct
    }
  }
`;

export const updateWorkflowMutation = gql`
  mutation UpdateWorkflow($data: WorkflowPartialInput!) {
    updateWorkflow(data: $data) {
      id
      name
      description
      code
      sortOrder
      autoAddOnProduct
    }
  }
`;

export const deleteWorkflowMutation = gql`
  mutation DeleteWorkflow($id: GlobalID!) {
    deleteWorkflow(data: { id: $id }) {
      id
    }
  }
`;

export const createWorkflowStateMutation = gql`
  mutation CreateWorkflowState($data: WorkflowStateInput!) {
    createWorkflowState(data: $data) {
      id
      value
      code
      sortOrder
      isDefault
      workflow {
        id
      }
    }
  }
`;

export const updateWorkflowStateMutation = gql`
  mutation UpdateWorkflowState($data: WorkflowStatePartialInput!) {
    updateWorkflowState(data: $data) {
      id
      value
      code
      sortOrder
      isDefault
      workflow {
        id
      }
    }
  }
`;

export const deleteWorkflowStateMutation = gql`
  mutation DeleteWorkflowState($id: GlobalID!) {
    deleteWorkflowState(data: { id: $id }) {
      id
    }
  }
`;

export const createWorkflowProductAssignmentMutation = gql`
  mutation CreateWorkflowProductAssignment($data: WorkflowProductAssignmentInput!) {
    createWorkflowProductAssignment(data: $data) {
      id
      workflow {
        id
        code
      }
      workflowState {
        id
        code
        value
      }
      product {
        id
        name
        sku
      }
    }
  }
`;

export const updateWorkflowProductAssignmentMutation = gql`
  mutation UpdateWorkflowProductAssignment($data: WorkflowProductAssignmentPartialInput!) {
    updateWorkflowProductAssignment(data: $data) {
      id
      workflowState {
        id
        code
        value
      }
      product {
        id
        name
        sku
      }
    }
  }
`;

export const deleteWorkflowProductAssignmentMutation = gql`
  mutation DeleteWorkflowProductAssignment($id: GlobalID!) {
    deleteWorkflowProductAssignment(data: { id: $id }) {
      id
    }
  }
`;

export const bulkAssignWorkflowStateMutation = gql`
  mutation BulkAssignWorkflowState($workflowState: WorkflowStatePartialInput!, $products: [ProductPartialInput!]!) {
    bulkAssignWorkflowState(workflowState: $workflowState, products: $products) {
      id
    }
  }
`;
