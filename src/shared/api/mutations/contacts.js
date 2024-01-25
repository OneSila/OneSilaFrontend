import { gql } from 'graphql-tag';

export const deletePersonMutation = gql`
  mutation deletePerson($id: GlobalID!,) {
    deletePerson(data: {id: $id}) {
        id
    }
  }
`;