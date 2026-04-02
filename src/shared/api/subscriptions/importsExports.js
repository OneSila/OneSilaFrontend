import { gql } from 'graphql-tag';

export const mappedImportSubscription = gql`
  subscription MappedImportSubscription($pk: String!) {
    mappedImport(pk: $pk) {
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
      totalRecords
      processedRecords
      brokenRecords
      cleanedErrors
      isPeriodic
      intervalHours
      lastRunAt
      jsonFileUrl
      jsonUrl
      createdAt
      updatedAt
      jsonFile {
        name
        url
      }
    }
  }
`;

export const exportSubscription = gql`
  subscription ExportSubscription($pk: String!) {
    export(pk: $pk) {
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
    }
  }
`;
