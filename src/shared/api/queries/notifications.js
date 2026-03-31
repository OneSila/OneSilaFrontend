import { gql } from 'graphql-tag';

export const notificationsQuery = gql`
  query Notifications(
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    notifications(first: $first, last: $last, after: $after, before: $before) {
      edges {
        node {
          id
          title
          message
          url
          opened
          createdAt
        }
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
