import { gql } from 'graphql-tag';

export const registerMutation = gql`
  mutation Register($username: String!, $password: String!, $language: String!) {
    registerUser(data: {username: $username, password: $password, language: $language}) {
      multiTenantCompany {
        id
      }
      username
      language
      firstName
      lastName
    }
  }
`;

export const loginMutation = gql`
mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    username
    firstName
    lastName
    language
    isMultiTenantCompanyOwner
    isActive
    multiTenantCompany {
      id
    }
  }
}`;

export const authenticateTokenMutation = gql`
mutation authenticateToken($token: String!) {
  authenticateToken(token: $token) {
    username
    firstName
    lastName
    language
    isMultiTenantCompanyOwner
    isActive
    multiTenantCompany {
      id
    }
  }
}`;

export const acceptUserInvitationMutation = gql`
mutation acceptUserInvitation($language: String!, $password: String!) {
  acceptUserInvitation(data: {language: $language, password: $password}){
    username
    firstName
    lastName
    language
    isMultiTenantCompanyOwner
    isActive
    multiTenantCompany {
      id
    }
  }
}`;

export const registerCompanyMutation = gql`
  mutation RegisterCompany($country: String!, $name: String!, $language: String!, $phoneNumber: String!) {
    registerMyMultiTenantCompany(data: {
      country: $country,
      name: $name,
      language: $language,
      phoneNumber: $phoneNumber
    }) {
      id
      name
    }
  }
`;

export const inviteMemberMutation = gql`
  mutation inviteMember($username: String!, $language: String!, $firstName: String!, $lastName: String!) {
    inviteUser(data: {
      username: $username,
      language: $language,
      firstName: $firstName,
      lastName: $lastName
    }) {
      firstName
      lastName
    }
  }
`;

export const requestLoginLinkMutation = gql`
  mutation recoveryToken($username: String!) {
    recoveryToken(data: { username: $username }) {
        id
        createdAt
        expiresAt
    }
  }
`;