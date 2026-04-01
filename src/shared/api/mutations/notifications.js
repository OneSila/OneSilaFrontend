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

export const markNotificationAsUnreadMutation = gql`
  mutation MarkNotificationAsUnread($id: GlobalID!) {
    markNotificationAsUnread(data: { id: $id }) {
      id
      opened
      url
    }
  }
`;

export const markAllNotificationsAsViewMutation = gql`
  mutation MarkAllNotificationsAsView {
    markAllNotificationsAsView
  }
`;
