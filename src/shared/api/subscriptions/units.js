import { gql } from 'graphql-tag';

export const unitSubscription = gql`
  subscription getUnitSubscription($pk: String!) {
    unit(pk: $pk) {
      id
      name
      unit
    }
  }
`;
