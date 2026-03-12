import { gql } from 'graphql-tag';

export const publicIntegrationTypesQuery = gql`
  query PublicIntegrationTypes($first: Int, $last: Int, $after: String, $before: String, $filter: PublicIntegrationTypeFilter) {
    publicIntegrationTypes(first: $first, last: $last, after: $after, before: $before, filters: $filter) {
      edges {
        node {
          id
          key
          type
          subtype
          category
          active
          isBeta
          supportsOpenAiProductFeed
          sortOrder
          name
          description
          iconSvgUrl
          logoPngUrl
          basedTo {
            id
            key
            type
            subtype
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
