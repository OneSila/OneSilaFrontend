import { gql } from 'graphql-tag';

export const webhookIntegrationsQuery = gql`
  query WebhookIntegrations($first: Int, $last: Int, $after: String, $before: String, $order: WebhookIntegrationOrder, $filter: WebhookIntegrationFilter) {
    webhookIntegrations(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          hostname
          active
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

export const getWebhookIntegrationQuery = gql`
  query GetWebhookIntegration($id: GlobalID!) {
    webhookIntegration(id: $id) {
      id
      hostname
      active
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

export const webhookOutboxesQuery = gql`
  query WebhookOutboxes($first: Int, $last: Int, $after: String, $before: String, $order: WebhookOutboxOrder, $filter: WebhookOutboxFilter) {
    webhookOutboxes(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          webhookIntegration {
            id
          }
          topic
          action
          subjectType
          subjectId
          sequence
          payload
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

export const getWebhookOutboxQuery = gql`
  query GetWebhookOutbox($id: GlobalID!) {
    webhookOutbox(id: $id) {
      id
      webhookIntegration {
        id
      }
      topic
      action
      subjectType
      subjectId
      sequence
      payload
    }
  }
`;

export const webhookDeliveriesQuery = gql`
  query WebhookDeliveries(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $filter: WebhookDeliveryFilter
  ) {
    webhookDeliveries(
      first: $first
      last: $last
      after: $after
      before: $before
      filters: $filter
    ) {
      edges {
        node {
          id
          status
          attempt
          responseCode
          responseMs
          responseBodySnippet
          sentAt
          errorMessage
          errorTraceback
          outbox {
            id
            topic
            action
            subjectType
            subjectId
            payload
            webhookIntegration {
              hostname
            }
          }
          attempts(order: { number: DESC }) {
            number
            sentAt
            responseCode
            responseMs
            responseBodySnippet
            errorText
            errorTraceback
          }
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

export const getWebhookDeliveryQuery = gql`
  query GetWebhookDelivery($id: GlobalID!) {
    webhookDelivery(id: $id) {
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

export const webhookDeliveryAttemptsQuery = gql`
  query WebhookDeliveryAttempts($first: Int, $last: Int, $after: String, $before: String, $order: WebhookDeliveryAttemptOrder, $filter: WebhookDeliveryAttemptFilter) {
    webhookDeliveryAttempts(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          delivery {
            id
          }
          number
          sentAt
          responseCode
          responseMs
          responseBodySnippet
          errorText
          errorTraceback
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

export const getWebhookDeliveryAttemptQuery = gql`
  query GetWebhookDeliveryAttempt($id: GlobalID!) {
    webhookDeliveryAttempt(id: $id) {
      id
      delivery {
        id
      }
      number
      sentAt
      responseCode
      responseMs
      responseBodySnippet
      errorText
      errorTraceback
    }
  }
`;

