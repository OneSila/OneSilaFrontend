import { gql } from 'graphql-tag';

export const createSalesChannelContentTemplateMutation = gql`
  mutation createSalesChannelContentTemplate($data: SalesChannelContentTemplateInput!) {
    createSalesChannelContentTemplate(data: $data) {
      id
      language
      template
    }
  }
`;

export const updateSalesChannelContentTemplateMutation = gql`
  mutation updateSalesChannelContentTemplate($data: SalesChannelContentTemplatePartialInput!) {
    updateSalesChannelContentTemplate(data: $data) {
      id
      language
      template
    }
  }
`;

export const deleteSalesChannelContentTemplateMutation = gql`
  mutation deleteSalesChannelContentTemplate($data: SalesChannelContentTemplatePartialInput!) {
    deleteSalesChannelContentTemplate(data: $data) {
      id
    }
  }
`;

export const checkSalesChannelContentTemplateMutation = gql`
  mutation checkSalesChannelContentTemplate(
    $salesChannel: SalesChannelPartialInput!
    $product: ProductPartialInput!
    $language: String!
    $template: String!
  ) {
    checkSalesChannelContentTemplate(
      salesChannel: $salesChannel
      product: $product
      language: $language
      template: $template
    ) {
      isValid
      renderedContent
      availableVariables
      errors {
        message
        severity
        validationIssue
      }
    }
  }
`;
