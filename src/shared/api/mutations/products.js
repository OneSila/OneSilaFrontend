import { gql } from 'graphql-tag';

export const createProductMutation = gql`
  mutation createProduct($data: ProductInput!) {
    createProduct(data: $data) {
      id
      sku
      active
      type
      vatRate {
        id
        rate
      }
      allowBackorder
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
      allowBackorder
      type
      vatRate {
        id
        rate
      }
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
  mutation deleteProducts($data: [NodeInput!]!) {
    deleteProducts(data: $data) {
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

export const createConfigurableProductMutation = gql`
  mutation createConfigurableProduct($data: ConfigurableProductInput!) {
    createConfigurableProduct(data: $data) {
      id
      sku
      active
    }
  }
`;

export const createConfigurableProductsMutation = gql`
  mutation createConfigurableProducts($data: [ConfigurableProductInput!]!) {
    createConfigurableProducts(data: $data) {
      id
      sku
      active
    }
  }
`;

export const updateConfigurableProductMutation = gql`
  mutation updateConfigurableProduct($data: ConfigurableProductPartialInput!) {
    updateConfigurableProduct(data: $data) {
      id
      sku
      active
    }
  }
`;

export const deleteConfigurableProductMutation = gql`
  mutation deleteConfigurableProduct($id: GlobalID!) {
    deleteConfigurableProduct(data: {id: $id}) {
      id
    }
  }
`;

export const deleteConfigurableProductsMutation = gql`
  mutation deleteConfigurableProducts($ids: [GlobalID!]!) {
    deleteConfigurableProducts(data: {ids: $ids}) {
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
      name
      subtitle
      shortDescription
      description
      urlKey
    }
  }
`;

export const createProductTranslationsMutation = gql`
  mutation createProductTranslations($data: [ProductTranslationInput!]!) {
    createProductTranslations(data: $data) {
      id
      name
      subtitle
      shortDescription
      description
      urlKey
    }
  }
`;

export const updateProductTranslationMutation = gql`
  mutation updateProductTranslation($data: ProductTranslationPartialInput!) {
    updateProductTranslation(data: $data) {
      id
      name
      subtitle
      shortDescription
      description
      urlKey
    }
  }
`;

export const createProductContentMutation = gql`
  mutation createProductContent($data: ProductContentInput!) {
    createProductContent(data: $data) {
      id
      name
      subtitle
      shortDescription
      description
      urlKey
    }
  }
`;

export const updateProductContentMutation = gql`
  mutation updateProductContent($data: ProductContentPartialInput!) {
    updateProductContent(data: $data) {
      id
      name
      subtitle
      shortDescription
      description
      urlKey
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

export const createConfigurableVariationMutation = gql`
  mutation createConfigurableVariation($data: ConfigurableVariationInput!) {
    createConfigurableVariation(data: $data) {
      id
      parent {
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

export const createConfigurableVariationsMutation = gql`
  mutation createConfigurableVariations($data: [ConfigurableVariationInput!]!) {
    createConfigurableVariations(data: $data) {
      id
      parent {
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

export const updateConfigurableVariationMutation = gql`
  mutation updateConfigurableVariation($data: ConfigurableVariationPartialInput!) {
    updateConfigurableVariation(data: $data) {
      id
      parent {
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

export const deleteConfigurableVariationMutation = gql`
  mutation deleteConfigurableVariation($id: GlobalID!) {
    deleteConfigurableVariation(data: {id: $id}) {
      id
      variation {
        id
      }
    }
  }
`;

export const deleteConfigurableVariationsMutation = gql`
  mutation deleteConfigurableVariations($ids: [GlobalID!]!) {
    deleteConfigurableVariations(data: {ids: $ids}) {
      id
    }
  }
`;

export const createBundleVariationMutation = gql`
  mutation createBundleVariation($data: BundleVariationInput!) {
    createBundleVariation(data: $data) {
      id
      parent {
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
      parent {
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
      parent {
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
      variation {
        id
      }
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

export const createManufacturableProductMutation = gql`
  mutation createManufacturableProduct($data: ManufacturableProductInput!) {
    createManufacturableProduct(data: $data) {
      id
      name
      description
    }
  }
`;

export const createManufacturableProductsMutation = gql`
  mutation createManufacturableProducts($data: [ManufacturableProductInput!]!) {
    createManufacturableProducts(data: $data) {
      id
      name
      description
    }
  }
`;

export const updateManufacturableProductMutation = gql`
  mutation updateManufacturableProduct($data: ManufacturableProductPartialInput!) {
    updateManufacturableProduct(data: $data) {
      id
      name
      description
    }
  }
`;

export const deleteManufacturableProductMutation = gql`
  mutation deleteManufacturableProduct($id: GlobalID!) {
    deleteManufacturableProduct(data: {id: $id}) {
      id
    }
  }
`;

export const deleteManufacturableProductsMutation = gql`
  mutation deleteManufacturableProducts($ids:  [GlobalID!]!) {
    deleteManufacturableProducts(data: {ids: $ids}) {
      id
    }
  }
`;

export const createDropshipProductMutation = gql`
  mutation createDropshipProduct($data: DropshipProductInput!) {
    createDropshipProduct(data: $data) {
      id
      name
    }
  }
`;

export const createDropshipProductsMutation = gql`
  mutation createDropshipProducts($data: [DropshipProductInput!]!) {
    createDropshipProducts(data: $data) {
      id
      name
    }
  }
`;

export const updateDropshipProductMutation = gql`
  mutation updateDropshipProduct($data: DropshipProductPartialInput!) {
    updateDropshipProduct(data: $data) {
      id
      name
    }
  }
`;

export const deleteDropshipProductMutation = gql`
  mutation deleteDropshipProduct($id: GlobalID!) {
    deleteDropshipProduct(data: {id: $id}) {
      id
    }
  }
`;

export const deleteDropshipProductsMutation = gql`
  mutation deleteDropshipProducts($ids:  [GlobalID!]!) {
    deleteDropshipProducts(data: {ids: $ids}) {
      id
    }
  }
`;

export const createBillOfMaterialMutation = gql`
  mutation createBillOfMaterial($data: BillOfMaterialInput!) {
    createBillOfMaterial(data: $data) {
      id
      quantity
    }
  }
`;

export const createBillsOfMaterialMutation = gql`
  mutation createBillsOfMaterial($data: [BillOfMaterialInput!]!) {
    createBillsOfMaterial(data: $data) {
      id
      quantity
    }
  }
`;

export const updateBillOfMaterialMutation = gql`
  mutation updateBillOfMaterial($data: BillOfMaterialPartialInput!) {
    updateBillOfMaterial(data: $data) {
      id
      quantity
    }
  }
`;

export const deleteBillOfMaterialMutation = gql`
  mutation deleteBillOfMaterial($id: GlobalID!) {
    deleteBillOfMaterial(data: {id: $id}) {
      id
    }
  }
`;

export const deleteBillsOfMaterialMutation = gql`
  mutation deleteBillsOfMaterial($ids:  [GlobalID!]!) {
    deleteBillsOfMaterial(data: {ids: $ids}) {
      id
    }
  }
`;

export const refreshInspectorMutation = gql`
  mutation refreshInspectorMutation($data: InspectorPartialInput!) {
    refreshInspector(data: $data) {
      id
      hasMissingInformation
      hasMissingOptionalInformation
      errors
    }
  } 
`;

export const bulkRefreshInspectorMutation = gql`
  mutation bulkRefreshInspector($instance: BulkRefreshInspectorInput!) {
    bulkRefreshInspector(instance: $instance)
  }
`;

export const importProductTranslationsMutation = gql`
  mutation importProductTranslations($instance: ProductTranslationBulkImportInput!) {
    importProductTranslations(instance: $instance) {
      success
    }
  }
`;
export const createProductTranslationBulletPointMutation = gql`
  mutation createProductTranslationBulletPoint($data: ProductTranslationBulletPointInput!) {
    createProductTranslationBulletPoint(data: $data) {
      id
      text
      sortOrder
    }
  }
`;

export const createProductTranslationBulletPointsMutation = gql`
  mutation createProductTranslationBulletPoints($data: [ProductTranslationBulletPointInput!]!) {
    createProductTranslationBulletPoints(data: $data) {
      id
      text
      sortOrder
    }
  }
`;

export const updateProductTranslationBulletPointMutation = gql`
  mutation updateProductTranslationBulletPoint($data: ProductTranslationBulletPointPartialInput!) {
    updateProductTranslationBulletPoint(data: $data) {
      id
      text
      sortOrder
    }
  }
`;

export const deleteProductTranslationBulletPointMutation = gql`
  mutation deleteProductTranslationBulletPoint($id: GlobalID!) {
    deleteProductTranslationBulletPoint(data: {id: $id}) {
      id
    }
  }
`;

export const deleteProductTranslationBulletPointsMutation = gql`
  mutation deleteProductTranslationBulletPoints($data: [NodeInput!]!) {
    deleteProductTranslationBulletPoints(data: $data) {
      id
    }
  }
`;

export const generateProductVariationsMutation = gql`
  mutation generateProductVariations($product: ProductPartialInput!, $ruleProductType: PropertySelectValuePartialInput!, $selectValues: [PropertySelectValuePartialInput!]!) {
    generateProductVariations(product: $product, ruleProductType: $ruleProductType, selectValues: $selectValues) {
      success
    }
  }
`;

export const duplicateProductMutation = gql`
    mutation($product: ProductPartialInput!, $sku: String, $createAsAlias: Boolean, $createRelationships: Boolean) {
      duplicateProduct(product: $product, sku: $sku, createAsAlias: $createAsAlias, createRelationships: $createRelationships) {
        id
        sku
      }
    }
`;
