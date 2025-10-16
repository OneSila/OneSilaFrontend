import { gql } from 'graphql-tag';

export const salesChannelContentTemplateQuery = gql`
  query salesChannelContentTemplate($salesChannelId: GlobalID!, $languageCode: String!) {
    salesChannelContentTemplates(
      first: 1
      filters: {
        salesChannel: { id: { exact: $salesChannelId } }
        language: { exact: $languageCode }
      }
    ) {
      edges {
        node {
          id
          language
          template
          addAsIframe
        }
      }
    }
  }
`;
