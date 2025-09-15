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

export const createAmazonProductBrowseNodeMutation = gql`
  mutation createAmazonProductBrowseNode($data: AmazonProductBrowseNodeInput!) {
    createAmazonProductBrowseNode(data: $data) {
      id
      recommendedBrowseNodeId
    }
  }
`;

export const updateAmazonProductBrowseNodeMutation = gql`
  mutation updateAmazonProductBrowseNode(
    $data: AmazonProductBrowseNodePartialInput!
  ) {
    updateAmazonProductBrowseNode(data: $data) {
      id
      recommendedBrowseNodeId
    }
  }
`;

export const deleteAmazonProductBrowseNodeMutation = gql`
  mutation deleteAmazonProductBrowseNode($data: NodeInput!) {
    deleteAmazonProductBrowseNode(data: $data) {
      id
    }
  }
`;

export const createAndMapAmazonProductTypeMutation = gql`
  mutation createAndMapAmazonProductType($productTypeCode: String!, $salesChannel: AmazonSalesChannelPartialInput!) {
    createAndMapAmazonProductType(productTypeCode: $productTypeCode, salesChannel: $salesChannel) {
      id
      productTypeCode
    }
  }
`;
