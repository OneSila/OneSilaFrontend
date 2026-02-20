import { gql } from 'graphql-tag';

export const createDocumentTypeMutation = gql`
  mutation createDocumentType($data: DocumentTypeInput!) {
    createDocumentType(data: $data) {
      id
      name
      code
      description
    }
  }
`;

export const createDocumentTypesMutation = gql`
  mutation createDocumentTypes($data: [DocumentTypeInput!]!) {
    createDocumentTypes(data: $data) {
      id
      name
      code
      description
    }
  }
`;

export const updateDocumentTypeMutation = gql`
  mutation updateDocumentType($data: DocumentTypePartialInput!) {
    updateDocumentType(data: $data) {
      id
      name
      code
      description
    }
  }
`;

export const deleteDocumentTypeMutation = gql`
  mutation deleteDocumentType($id: GlobalID!) {
    deleteDocumentType(data: { id: $id }) {
      id
    }
  }
`;

export const deleteDocumentTypesMutation = gql`
  mutation deleteDocumentTypes($data: [NodeInput!]!) {
    deleteDocumentTypes(data: $data) {
      id
    }
  }
`;
