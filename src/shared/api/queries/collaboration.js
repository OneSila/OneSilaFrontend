import { gql } from 'graphql-tag';

export const collaborationThreadByTargetQuery = gql`
  query CollaborationThreadByTarget($targetId: ID!) {
    collaborationThreadByTarget(targetId: $targetId) {
      id
      url
      targetId
      entries {
        id
        type
        comment
        metadata
        createdAt
        updatedAt
        createdByMultiTenantUser {
          id
          firstName
          lastName
          email
          avatarResizedFullUrl
        }
        mentions {
          id
          user {
            id
            firstName
            lastName
            email
            avatarResizedFullUrl
          }
        }
      }
    }
  }
`;
