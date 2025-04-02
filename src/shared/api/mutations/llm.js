import {gql} from "graphql-tag";

export const generateProductAiContentMutation = gql`
mutation generateProductAiContentMutation($data: ProductAiContentInput!) {
  generateProductAiContent(instance: $data) {
    ... on AiContent {
      content
      points
    }
    ... on OperationInfo {
      messages {
        kind
        message
        field
        code
      }
    }
  }
}
`;

export const generateAiTranslationMutation = gql`
  mutation generateAiTranslationMutation($data: AITranslationInput!) {
    generateAiTranslation(instance: $data) {
      ... on AiContent {
        content
        points
      }
      ... on OperationInfo {
          messages {
            kind
            message
            field
            code
          }
        }
    }
  }
`;

export const detectRemoteValidPropertiesMutation = gql`
  mutation detectRemoteValidPropertiesMutation($data: SalesChannelPartialInput!) {
    detectRemoteValidProperties(instance: $data) {
      ... on AiContent {
        content
        points
      }
      ... on OperationInfo {
        messages {
          kind
          message
          field
          code
        }
      }
    }
  }
`;
