import { gql } from 'graphql-tag';

const mappedImportFields = `
  id
  proxyId
  name
  type
  status
  percentage
  percentageColor
  language
  createOnly
  updateOnly
  overrideOnly
  skipBrokenRecords
  isPeriodic
  intervalHours
  totalRecords
  processedRecords
  jsonFileUrl
  jsonUrl
  lastRunAt
  createdAt
  updatedAt
  jsonFile {
    name
    url
  }
`;

const exportFields = `
  id
  name
  kind
  type
  status
  percentage
  percentageColor
  language
  totalRecords
  parameters
  columns
  errorTraceback
  isPeriodic
  intervalHours
  lastRunAt
  feedKey
  feedUrl
  fileUrl
  createdAt
  updatedAt
  file {
    name
    url
  }
`;

export const mappedImportsQuery = gql`
  query MappedImports(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: MappedImportOrder
    $filter: MappedImportFilter
  ) {
    mappedImports(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          ${mappedImportFields}
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

export const mappedImportQuery = gql`
  query MappedImport($id: ID!) {
    mappedImport(id: $id) {
      ${mappedImportFields}
    }
  }
`;

export const exportsQuery = gql`
  query Exports(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: ExportOrder
    $filter: ExportFilter
  ) {
    exports(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          ${exportFields}
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

export const exportQuery = gql`
  query Export($id: ID!) {
    export(id: $id) {
      ${exportFields}
    }
  }
`;

export const importBrokenRecordsQuery = gql`
  query ImportBrokenRecords(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: ImportBrokenRecordOrder
    $filter: ImportBrokenRecordFilter
  ) {
    importBrokenRecords(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          record
          createdAt
          updatedAt
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

export const importBrokenRecordQuery = gql`
  query ImportBrokenRecord($id: ID!) {
    importBrokenRecord(id: $id) {
      id
      record
      createdAt
      updatedAt
    }
  }
`;
