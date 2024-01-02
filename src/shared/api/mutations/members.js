import { gql } from 'graphql-tag';

export const disableMemberMutation = gql`
mutation disableUser($id: GlobalID!) {
  disableUser(data: {id: $id}) {
    id
    isActive
  }
}
`;

export const enableMemberMutation = gql`
mutation enableUser($id: GlobalID!) {
  enableUser(data: {id: $id}) {
    id
    isActive
  }
}`;