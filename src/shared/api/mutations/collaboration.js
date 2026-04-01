import { gql } from 'graphql-tag';

export const createCollaborationEntryMutation = gql`
  mutation CreateCollaborationEntry(
    $targetId: GlobalID!
    $type: String!
    $comment: String
    $url: String
    $metadata: JSON
    $mentionedUserIds: [GlobalID!]
  ) {
    createCollaborationEntry(
      data: {
        targetId: $targetId
        type: $type
        comment: $comment
        url: $url
        metadata: $metadata
        mentionedUserIds: $mentionedUserIds
      }
    ) {
      id
      type
      comment
      metadata
      createdAt
      createdByMultiTenantUser {
        id
        firstName
        lastName
        email
      }
      thread {
        id
        url
      }
      mentions {
        id
        user {
          id
          firstName
          lastName
          email
        }
      }
    }
  }
`;
