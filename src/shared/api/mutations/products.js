import { gql } from 'graphql-tag';

export const createProductMutation = gql`
  mutation createProduct($data: ProductInput!) {
    createProduct(data: $data) {
      id
      sku
      active
      type
      taxRate {
        id
        rate
      }
      alwaysOnStock
    }
  }
`;

export const createProductsMutation = gql`
  mutation createProducts($data: [ProductInput!]!) {
    createProducts(data: $data) {
      id
      sku
      active
      type
    }
  }
`;

export const updateProductMutation = gql`
  mutation updateProduct($data: ProductPartialInput!) {
    updateProduct(data: $data) {
      id
      sku
      active
      type
    }
  }
`;

export const deleteProductMutation = gql`
  mutation deleteProduct($id: GlobalID!) {
    deleteProduct(data: {id: $id}) {
      id
    }
  }
`;

export const deleteProductsMutation = gql`
  mutation deleteProducts($ids: [GlobalID!]!) {
    deleteProducts(data: {ids: $ids}) {
      id
    }
  }
`;

export const createBundleProductMutation = gql`
  mutation createBundleProduct($data: BundleProductInput!) {
    createBundleProduct(data: $data) {
      id
      sku
      active
    }
  }
`;

export const createBundleProductsMutation = gql`
  mutation createBundleProducts($data: [BundleProductInput!]!) {
    createBundleProducts(data: $data) {
      id
      sku
      active
    }
  }
`;

export const updateBundleProductMutation = gql`
  mutation updateBundleProduct($data: BundleProductPartialInput!) {
    updateBundleProduct(data: $data) {
      id
      sku
      active
    }
  }
`;

export const deleteBundleProductMutation = gql`
  mutation deleteBundleProduct($id: GlobalID!) {
    deleteBundleProduct(data: {id: $id}) {
      id
    }
  }
`;

export const deleteBundleProductsMutation = gql`
  mutation deleteBundleProducts($ids: [GlobalID!]!) {
    deleteBundleProducts(data: {ids: $ids}) {
      id
    }
  }
`;

export const createUmbrellaProductMutation = gql`
  mutation createUmbrellaProduct($data: UmbrellaProductInput!) {
    createUmbrellaProduct(data: $data) {
      id
      sku
      active
    }
  }
`;

export const createUmbrellaProductsMutation = gql`
  mutation createUmbrellaProducts($data: [UmbrellaProductInput!]!) {
    createUmbrellaProducts(data: $data) {
      id
      sku
      active
    }
  }
`;

export const updateUmbrellaProductMutation = gql`
  mutation updateUmbrellaProduct($data: UmbrellaProductPartialInput!) {
    updateUmbrellaProduct(data: $data) {
      id
      sku
      active
    }
  }
`;

export const deleteUmbrellaProductMutation = gql`
  mutation deleteUmbrellaProduct($id: GlobalID!) {
    deleteUmbrellaProduct(data: {id: $id}) {
      id
    }
  }
`;

export const deleteUmbrellaProductsMutation = gql`
  mutation deleteUmbrellaProducts($ids: [GlobalID!]!) {
    deleteUmbrellaProducts(data: {ids: $ids}) {
      id
    }
  }
`;

export const createProductVariationMutation = gql`
  mutation createProductVariation($data: ProductVariationInput!) {
    createProductVariation(data: $data) {
      id
      sku
      active
    }
  }
`;

export const createProductVariationsMutation = gql`
  mutation createProductVariations($data: [ProductVariationInput!]!) {
    createProductVariations(data: $data) {
      id
      sku
      active
    }
  }
`;

export const updateProductVariationMutation = gql`
  mutation updateProductVariation($data: ProductVariationPartialInput!) {
    updateProductVariation(data: $data) {
      id
      sku
      active
    }
  }
`;

export const deleteProductVariationMutation = gql`
  mutation deleteProductVariation($id: GlobalID!) {
    deleteProductVariation(data: {id: $id}) {
      id
    }
  }
`;

export const deleteProductVariationsMutation = gql`
  mutation deleteProductVariations($ids: [GlobalID!]!) {
    deleteProductVariations(data: {ids: $ids}) {
      id
    }
  }
`;

export const createProductTranslationMutation = gql`
  mutation createProductTranslation($data: ProductTranslationInput!) {
    createProductTranslation(data: $data) {
      id
      product {
        id
        sku
      }
      name
      shortDescription
      description
    }
  }
`;

export const createProductTranslationsMutation = gql`
  mutation createProductTranslations($data: [ProductTranslationInput!]!) {
    createProductTranslations(data: $data) {
      id
      product {
        id
        sku
      }
      name
      shortDescription
      description
    }
  }
`;

export const updateProductTranslationMutation = gql`
  mutation updateProductTranslation($data: ProductTranslationPartialInput!) {
    updateProductTranslation(data: $data) {
      id
      product {
        id
        sku
      }
      name
      shortDescription
      description
    }
  }
`;

export const deleteProductTranslationMutation = gql`
  mutation deleteProductTranslation($id: GlobalID!) {
    deleteProductTranslation(data: {id: $id}) {
      id
    }
  }
`;

export const deleteProductTranslationsMutation = gql`
  mutation deleteProductTranslations($ids: [GlobalID!]!) {
    deleteProductTranslations(data: {ids: $ids}) {
      id
    }
  }
`;

export const createUmbrellaVariationMutation = gql`
  mutation createUmbrellaVariation($data: UmbrellaVariationInput!) {
    createUmbrellaVariation(data: $data) {
      id
      umbrella {
        id
        sku
      }
      variation {
        id
        sku
      }
    }
  }
`;

export const createUmbrellaVariationsMutation = gql`
  mutation createUmbrellaVariations($data: [UmbrellaVariationInput!]!) {
    createUmbrellaVariations(data: $data) {
      id
      umbrella {
        id
        sku
      }
      variation {
        id
        sku
      }
    }
  }
`;

export const updateUmbrellaVariationMutation = gql`
  mutation updateUmbrellaVariation($data: UmbrellaVariationPartialInput!) {
    updateUmbrellaVariation(data: $data) {
      id
      umbrella {
        id
        sku
      }
      variation {
        id
        sku
      }
    }
  }
`;

export const deleteUmbrellaVariationMutation = gql`
  mutation deleteUmbrellaVariation($id: GlobalID!) {
    deleteUmbrellaVariation(data: {id: $id}) {
      id
    }
  }
`;

export const deleteUmbrellaVariationsMutation = gql`
  mutation deleteUmbrellaVariations($ids: [GlobalID!]!) {
    deleteUmbrellaVariations(data: {ids: $ids}) {
      id
    }
  }
`;

export const createBundleVariationMutation = gql`
  mutation createBundleVariation($data: BundleVariationInput!) {
    createBundleVariation(data: $data) {
      id
      umbrella {
        id
        sku
      }
      variation {
        id
        sku
      }
      quantity
    }
  }
`;

export const createBundleVariationsMutation = gql`
  mutation createBundleVariations($data: [BundleVariationInput!]!) {
    createBundleVariations(data: $data) {
      id
      umbrella {
        id
        sku
      }
      variation {
        id
        sku
      }
      quantity
    }
  }
`;

export const updateBundleVariationMutation = gql`
  mutation updateBundleVariation($data: BundleVariationPartialInput!) {
    updateBundleVariation(data: $data) {
      id
      umbrella {
        id
        sku
      }
      variation {
        id
        sku
      }
      quantity
    }
  }
`;

export const deleteBundleVariationMutation = gql`
  mutation deleteBundleVariation($id: GlobalID!) {
    deleteBundleVariation(data: {id: $id}) {
      id
    }
  }
`;

export const deleteBundleVariationsMutation = gql`
  mutation deleteBundleVariations($ids: [GlobalID!]!) {
    deleteBundleVariations(data: {ids: $ids}) {
      id
    }
  }
`;



