import { gql } from 'graphql-tag';

export const createSheinProductCategoryMutation = gql`
  mutation createSheinProductCategory($data: SheinProductCategoryInput!) {
    createSheinProductCategory(data: $data) {
      id
      remoteId
    }
  }
`;

export const updateSheinProductCategoryMutation = gql`
  mutation updateSheinProductCategory($data: SheinProductCategoryPartialInput!) {
    updateSheinProductCategory(data: $data) {
      id
      remoteId
    }
  }
`;

export const deleteSheinProductCategoryMutation = gql`
  mutation deleteSheinProductCategory($data: NodeInput!) {
    deleteSheinProductCategory(data: $data) {
      id
    }
  }
`;

export const createSheinProductMutation = gql`
  mutation createSheinProduct(
    $product: ProductPartialInput!
    $salesChannel: SheinSalesChannelPartialInput!
  ) {
    createSheinProduct(product: $product, salesChannel: $salesChannel)
  }
`;
