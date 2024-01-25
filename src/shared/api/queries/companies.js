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
  query Companies($filters: CompanyFilter, $order: CompanyOrder) {
    companies(filters: $filters, order: $order) {
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

export const peopleQuery = gql`
query People($first: Int, $last: Int, $after: String, $before: String, $order: PersonOrder) {
  people(first: $first, last: $last, after: $after, before: $before, order: $order) {
    edges {
      node {
        id
        firstName
        lastName
        company {
          name
        }
        phone
        email
        language
      }
      cursor
    }
    totalCount
    pageInfo {
      endCursor
      startCursor
      hasNextPage
      hasPreviousPage
    }
  }
}
`;