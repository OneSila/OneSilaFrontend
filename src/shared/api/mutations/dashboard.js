import { gql } from 'graphql-tag';

export const createDashboardCardMutation = gql`
  mutation CreateDashboardCard($data: DashboardCardInput!) {
    createDashboardCard(data: $data) {
      id
    }
  }
`;

export const createDashboardSectionMutation = gql`
  mutation CreateDashboardSection($data: DashboardSectionInput!) {
    createDashboardSection(data: $data) {
      id
      title
      description
      sortOrder
    }
  }
`;

export const updateDashboardSectionMutation = gql`
  mutation UpdateDashboardSection($data: DashboardSectionPartialInput!) {
    updateDashboardSection(data: $data) {
      id
      title
      description
      sortOrder
    }
  }
`;

export const deleteDashboardSectionMutation = gql`
  mutation DeleteDashboardSection($id: GlobalID!) {
    deleteDashboardSection(data: { id: $id }) {
      id
    }
  }
`;

export const updateDashboardCardMutation = gql`
  mutation UpdateDashboardCard($data: DashboardCardPartialInput!) {
    updateDashboardCard(data: $data) {
      id
      title
      description
      color
      sortOrder
    }
  }
`;

export const deleteDashboardCardMutation = gql`
  mutation DeleteDashboardCard($id: GlobalID!) {
    deleteDashboardCard(data: { id: $id }) {
      id
    }
  }
`;
