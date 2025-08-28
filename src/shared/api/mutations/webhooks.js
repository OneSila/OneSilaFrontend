import { gql } from 'graphql-tag';

export const createWebhookIntegrationMutation = gql`
  mutation createWebhookIntegration($data: WebhookIntegrationInput!) {
    createWebhookIntegration(data: $data) {
      id
      topic
      version
      url
      secret
      userAgent
      timeoutMs
      mode
      extraHeaders
      config
      retentionPolicy
      requestsPerMinute
      maxRetries
    }
  }
`;

export const createWebhookIntegrationsMutation = gql`
  mutation createWebhookIntegrations($data: [WebhookIntegrationInput!]!) {
    createWebhookIntegrations(data: $data) {
      id
      topic
      version
      url
      secret
      userAgent
      timeoutMs
      mode
      extraHeaders
      config
      retentionPolicy
      requestsPerMinute
      maxRetries
    }
  }
`;

export const updateWebhookIntegrationMutation = gql`
  mutation updateWebhookIntegration($data: WebhookIntegrationPartialInput!) {
    updateWebhookIntegration(data: $data) {
      id
      topic
      version
      url
      secret
      userAgent
      timeoutMs
      mode
      extraHeaders
      config
      retentionPolicy
      requestsPerMinute
      maxRetries
    }
  }
`;

export const regenerateWebhookIntegrationSecretMutation = gql`
  mutation regenerateWebhookIntegrationSecret($data: WebhookIntegrationPartialInput!) {
    regenerateWebhookIntegrationSecret(data: $data) {
      id
      topic
      version
      url
      secret
      userAgent
      timeoutMs
      mode
      extraHeaders
      config
      retentionPolicy
      requestsPerMinute
      maxRetries
    }
  }
`;

export const deleteWebhookIntegrationMutation = gql`
  mutation deleteWebhookIntegration($id: GlobalID!) {
    deleteWebhookIntegration(data: {id: $id}) {
      id
    }
  }
`;

export const deleteWebhookIntegrationsMutation = gql`
  mutation deleteWebhookIntegrations($ids: [GlobalID!]!) {
    deleteWebhookIntegrations(data: {ids: $ids}) {
      id
    }
  }
`;

export const retryWebhookDeliveryMutation = gql`
  mutation retryWebhookDelivery($data: WebhookDeliveryPartialInput!) {
    retryWebhookDelivery(data: $data) {
      id
      outbox {
        id
      }
      webhookIntegration {
        id
      }
      status
      attempt
      responseCode
      responseMs
      responseBodySnippet
      sentAt
      errorMessage
      errorTraceback
    }
  }
`;

