import { gql } from 'graphql-tag';

export const resyncMiraklFeedMutation = gql`
  mutation ResyncMiraklFeed($id: ID!) {
    resyncMiraklFeed(instance: { id: $id }) {
      id
      status
      remoteId
      productType {
        id
        name
        templateUrl
      }
    }
  }
`;
