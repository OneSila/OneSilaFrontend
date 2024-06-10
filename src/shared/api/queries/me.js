import { gql } from 'graphql-tag';

export const membersQuery = gql`
  query Users {
    users {
      firstName
      lastName
    }
  }
`;