import { gql } from 'graphql-tag';

export const refreshAmazonProductIssuesMutation = gql`
  mutation refreshAmazonProductIssues(
    $remoteProduct: AmazonProductPartialInput!
    $view: AmazonSalesChannelViewPartialInput!
  ) {
    refreshAmazonLatestIssues(remoteProduct: $remoteProduct, view: $view) {
      id
    }
  }
`;

export const resyncAmazonProductMutation = gql`
  mutation resyncAmazonProduct(
    $remoteProduct: AmazonProductPartialInput!
    $view: AmazonSalesChannelViewPartialInput!
    $forceValidationOnly: Boolean!
  ) {
    resyncAmazonProduct(
      remoteProduct: $remoteProduct
      view: $view
      forceValidationOnly: $forceValidationOnly
    ) {
      id
    }
  }
`;
