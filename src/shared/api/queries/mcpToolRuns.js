import { gql } from 'graphql-tag';

const assignedViewFields = `
  assignedViews {
    id
    name
    url
  }
`;

const mcpToolRunListFields = `
  id
  proxyId
  name
  userFullName
  toolName
  tool
  totalRecords
  createdAt
`;

const mcpToolRunDetailFields = `
  ${mcpToolRunListFields}
  percentage
  percentageColor
  payloadContent
  responseContent
  errorTraceback
  ${assignedViewFields}
`;

export const mcpToolRunsQuery = gql`
  query McpToolRuns(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: McpToolRunOrder
    $filter: McpToolRunFilter
  ) {
    mcpToolRuns(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          ${mcpToolRunListFields}
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

export const mcpToolRunQuery = gql`
  query McpToolRun($id: ID!) {
    mcpToolRun(id: $id) {
      ${mcpToolRunDetailFields}
    }
  }
`;
