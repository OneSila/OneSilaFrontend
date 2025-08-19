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
  mutation createAmazonProductBrowseNode($input: AmazonProductBrowseNodeInput!) {
    createAmazonProductBrowseNode(input: $input) {
      id
      recommendedBrowseNodeId
    }
  }
`;

export const updateAmazonProductBrowseNodeMutation = gql`
  mutation updateAmazonProductBrowseNode(
    $id: GlobalID!
    $input: AmazonProductBrowseNodePartialInput!
  ) {
    updateAmazonProductBrowseNode(id: $id, input: $input) {
      id
      recommendedBrowseNodeId
    }
  }
`;

export const deleteAmazonProductBrowseNodeMutation = gql`
  mutation deleteAmazonProductBrowseNode($id: GlobalID!) {
    deleteAmazonProductBrowseNode(id: $id) {
      id
    }
  }
`;
