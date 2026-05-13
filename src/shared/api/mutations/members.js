import { gql } from 'graphql-tag';

export const disableMemberMutation = gql`
mutation disableUser($id: ID!) {
  disableUser(data: {id: $id}) {
    id
    isActive
  }
}
`;

export const enableMemberMutation = gql`
mutation enableUser($id: ID!) {
  enableUser(data: {id: $id}) {
    id
    isActive
  }
}`;

export const resendInviteMutation = gql`
mutation resendInvite($id: ID!) {
  resendInvite(data: {id: $id}) {
    id
  }
}`;