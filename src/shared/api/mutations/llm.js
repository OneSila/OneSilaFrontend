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
  mutation generateAiTranslationMutation($data: AITranslationInput!, $salesChannel: SalesChannelPartialInput) {
    generateAiTranslation(instance: $data, sales_channel: $salesChannel) {
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

export const bulkTranslateAiContentMutation = gql`
  mutation bulkTranslateAiContentMutation($data: AIBulkTranslationInput!) {
    bulkTranslateAiContent(instance: $data) {
      ... on AiTaskResponse {
        success
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

export const generateProductAiBulletPointsMutation = gql`
  mutation generateProductAiBulletPointsMutation($data: ProductAiBulletPointsInput!) {
    generateProductBulletPointsAi(instance: $data) {
      ... on AiBulletPoints {
        bulletPoints {
          text
        }
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

export const createBrandCustomPromptMutation = gql`
  mutation createBrandCustomPrompt($data: BrandCustomPromptInput!) {
    createBrandCustomPrompt(data: $data) {
      id
      language
      prompt
      brandValue {
        id
        value
        fullValueName
      }
    }
  }
`;

export const createBrandCustomPromptsMutation = gql`
  mutation createBrandCustomPrompts($data: [BrandCustomPromptInput!]!) {
    createBrandCustomPrompts(data: $data) {
      id
      language
      prompt
      brandValue {
        id
        value
        fullValueName
      }
    }
  }
`;

export const updateBrandCustomPromptMutation = gql`
  mutation updateBrandCustomPrompt($data: BrandCustomPromptPartialInput!) {
    updateBrandCustomPrompt(data: $data) {
      id
      language
      prompt
      brandValue {
        id
        value
        fullValueName
      }
    }
  }
`;

export const deleteBrandCustomPromptMutation = gql`
  mutation deleteBrandCustomPrompt($id: GlobalID!) {
    deleteBrandCustomPrompt(data: { id: $id }) {
      id
    }
  }
`;

export const deleteBrandCustomPromptsMutation = gql`
  mutation deleteBrandCustomPrompts($ids: [GlobalID!]!) {
    deleteBrandCustomPrompts(data: { ids: $ids }) {
      id
    }
  }
`;
