import { gql } from 'graphql-tag';

export const resyncMiraklFeedMutation = gql`
  mutation ResyncMiraklFeed($id: GlobalID!) {
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
