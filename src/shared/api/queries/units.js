import { gql } from 'graphql-tag';

export const unitsQuery = gql`
  query Units($first: Int, $last: Int, $after: String, $before: String, $order: UnitOrder, $filter: UnitFilter) {
    units(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          unit
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

export const getUnitQuery = gql`
  query getUnit($id: GlobalID!) {
    unit(id: $id) {
      id
      name
      unit
    }
  }
`;
