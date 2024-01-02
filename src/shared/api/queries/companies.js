import { gql } from 'graphql-tag';

// export const companiesQuery = gql`
//   query Companies {
//     companies {
//       edges {
//         node {
//           id
//           name
//         }
//       }
//     }
//   }
// `;

export const companiesQuery = gql`
  query Companies($filters: CompanyFilter) {
    companies(filters: $filters) {
      edges {
        node {
          id
          name
          isCustomer
        }
      }
    }
  }
`;