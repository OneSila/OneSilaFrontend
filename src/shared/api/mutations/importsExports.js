import { gql } from 'graphql-tag';

export const createMappedImportMutation = gql`
  mutation CreateMappedImport($data: MappedImportCreateInput!) {
    createMappedImport(data: $data) {
      id
      name
      status
      percentage
      percentageColor
      type
    }
  }
`;

export const updateMappedImportMutation = gql`
  mutation UpdateMappedImport($data: MappedImportUpdateInput!) {
    updateMappedImport(data: $data) {
      id
      name
      status
      percentage
      percentageColor
      type
    }
  }
`;

export const resyncMappedImportMutation = gql`
  mutation ResyncMappedImport($id: GlobalID!) {
    resyncMappedImport(id: $id) {
      id
      status
      percentage
      percentageColor
    }
  }
`;

export const deleteMappedImportMutation = gql`
  mutation DeleteMappedImport($id: GlobalID!) {
    deleteMappedImport(data: { id: $id }) {
      id
    }
  }
`;

export const deleteMappedImportsMutation = gql`
  mutation DeleteMappedImports($data: [NodeInput!]!) {
    deleteMappedImports(data: $data) {
      id
    }
  }
`;

export const createExportMutation = gql`
  mutation CreateExport($data: ExportCreateInput!) {
    createExport(data: $data) {
      id
      name
      status
      percentage
      percentageColor
      kind
      type
    }
  }
`;

export const updateExportMutation = gql`
  mutation UpdateExport($data: ExportUpdateInput!) {
    updateExport(data: $data) {
      id
      name
      status
      percentage
      percentageColor
      kind
      type
    }
  }
`;

export const resyncExportMutation = gql`
  mutation ResyncExport($id: GlobalID!) {
    resyncExport(id: $id) {
      id
      status
      percentage
      percentageColor
    }
  }
`;

export const deleteExportMutation = gql`
  mutation DeleteExport($id: GlobalID!) {
    deleteExport(data: { id: $id }) {
      id
    }
  }
`;

export const deleteExportsMutation = gql`
  mutation DeleteExports($data: [NodeInput!]!) {
    deleteExports(data: $data) {
      id
    }
  }
`;
