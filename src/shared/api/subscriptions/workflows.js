import { gql } from 'graphql-tag';

export const workflowSubscription = gql`
  subscription WorkflowSubscription($pk: String!) {
    workflow(pk: $pk) {
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
          createdAt
          thumbnailUrl
        }
      }
    }
  }
`;
