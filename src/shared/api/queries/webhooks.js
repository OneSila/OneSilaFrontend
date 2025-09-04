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
          timeoutMs
          mode
          extraHeaders
          config
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
      timeoutMs
      mode
      extraHeaders
      config
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
          status
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
            createdAt
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
      createdAt
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
          createdAt
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
      createdAt
      responseCode
      responseMs
      responseBodySnippet
      errorText
      errorTraceback
    }
  }
`;

export const webhookDeliveryStatsQuery = gql`
  query WebhookDeliveryStats($filter: WebhookDeliveryFilter) {
    webhookDeliveryStats(filters: $filter) {
      deliveries
      delivered
      failed
      successRate
      medianLatency
      p95Latency
      rate429
      queueDepth
    }
  }
`;

export const webhookReportsKpiQuery = gql`
  query WebhookReportsKpi($filter: WebhookDeliveryFilter) {
    webhookReportsKpi(filters: $filter) {
      deliveries
      delivered
      failed
      successRate
      p50Latency
      p95Latency
      p99Latency
      rate429
      rate5xx
      avgAttempts
      avgSolveMs
    }
  }
`;

export const webhookReportsSeriesQuery = gql`
  query WebhookReportsSeries(
    $filter: WebhookDeliveryFilter
    $bucket: String
  ) {
    webhookReportsSeries(
      filters: $filter
      bucket: $bucket
    ) {
      deliveryOutcomeBuckets {
        timestamp
        delivered
        failed
        pending
        sending
      }
      latencyBuckets {
        timestamp
        p50
        p95
      }
      topicsBreakdown {
        topic
        deliveries
        delivered
        failed
        successRate
      }
      responseCodesBreakdown {
        codeBucket
        count
      }
      retriesDistribution {
        attempts
        count
      }
      heatmap {
        weekday
        hour
        failures
        medianLatency
      }
      topOffenders {
        integrationId
        integrationHostname
        failureRate
        latencyP95
      }
    }
  }
`;
