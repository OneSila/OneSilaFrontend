import { gql } from 'graphql-tag';

export const openNotificationMutation = gql`
  mutation OpenNotification($id: GlobalID!) {
    openNotification(data: { id: $id }) {
      id
      opened
      url
      type
      title
      message
    }
  }
`;

export const markAllNotificationsAsViewMutation = gql`
  mutation MarkAllNotificationsAsView {
    markAllNotificationsAsView
  }
`;
