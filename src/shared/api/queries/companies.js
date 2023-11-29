import { gql } from 'graphql-tag';

export const companiesQuery = gql`
  query Companies {
    companies {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;
