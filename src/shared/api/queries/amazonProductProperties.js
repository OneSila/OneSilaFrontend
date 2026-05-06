import { gql } from 'graphql-tag';

export const amazonProductPropertiesQuery = gql`
  query AmazonProductProperties($remoteProductId: ID!) {
    amazonProductProperties(
      filters: { remoteProduct: { id: { exact: $remoteProductId } } }
    ) {
      edges {
        node {
          id
          localInstance {
            id
          }
          remoteSelectValue {
            id
            remoteValue
            remoteName
            amazonProperty {
              id
              name
              code
            }
            salesChannel {
              id
            }
            localInstance {
              id
            }
          }
          remoteSelectValues {
            id
            remoteValue
            remoteName
            amazonProperty {
              id
              name
              code
            }
            salesChannel {
              id
            }
            localInstance {
              id
            }
          }
        }
      }
    }
  }
`;

