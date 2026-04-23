import { gql } from 'graphql-tag';

export const createPublicIssueRequestMutation = gql`
  mutation CreatePublicIssueRequest($data: PublicIssueRequestInput!) {
    createPublicIssueRequest(data: $data) {
      id
      issue
      description
      integrationType {
        id
        key
        type
        subtype
        name
      }
      submissionId
      productSku
    }
  }
`;
