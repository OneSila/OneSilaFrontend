import { gql } from 'graphql-tag';

export const brandCustomPromptsQuery = gql`
  query BrandCustomPrompts($first: Int, $last: Int, $after: String, $before: String, $order: BrandCustomPromptOrder, $filter: BrandCustomPromptFilter) {
    brandCustomPrompts(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          language
          prompt
          brandValue {
            id
            value
            fullValueName
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

export const getBrandCustomPromptQuery = gql`
  query getBrandCustomPrompt($id: GlobalID!) {
    brandCustomPrompt(id: $id) {
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
