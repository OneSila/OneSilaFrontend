import { gql } from 'graphql-tag';

export const membersQuery = gql`
  query Users($first: Int, $last: Int, $after: String, $before: String, $order: MultiTenantUserOrder, $filter: MultiTenantUserFilter) {
    users(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
          node {
            id
            fullName
          }
      }
    }
  }
`;

export const hasDemoDataQuery = gql`
  query HasDemoDatas {
    hasDemoData {
      hasDemoData
    }
  }
`;

export const generateUserCredentialsQuery = gql`
  query GenerateUserCredentials($identifier: String) {
    generateUserCredentials(identifier: $identifier) {
      username
      password
    }
  }
`;

export const meQuery = gql`
  query Me {
    me {
      id
      isMultiTenantCompanyOwner
    }
  }
`;

export const myMultiTenantCompanyQuery = gql`
  query MyMultiTenantCompany {
    myMultiTenantCompany {
      id
      name
      multitenantuserSet {
        id
        firstName
        lastName
        email
        isActive
        invitationAccepted
        isMultiTenantCompanyOwner
      }
    }
  }
`;
