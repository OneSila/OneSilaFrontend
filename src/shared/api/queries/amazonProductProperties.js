import { gql } from 'graphql-tag';

export const amazonProductPropertiesQuery = gql`
  query AmazonProductProperties($remoteProductId: GlobalID!) {
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
            localInstance {
              id
            }
          }
          remoteSelectValues {
            id
            remoteValue
            remoteName
            localInstance {
              id
            }
          }
        }
      }
    }
  }
`;

