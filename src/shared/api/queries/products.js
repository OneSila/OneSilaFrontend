import { gql } from 'graphql-tag';


export const minimalProductsQuery = gql`  
query Products($first: Int, $last: Int, $after: String, $before: String, $order: ProductOrder, $filter: ProductFilter) {
    products(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          active
          thumbnailUrl
          inspectorStatus
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

export const productsQuerySelector = gql`
query Products($first: Int, $last: Int, $after: String, $before: String, $order: ProductOrder, $filter: ProductFilter) {
    products(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
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

export const productsQuery = gql`  
query Products($first: Int, $last: Int, $after: String, $before: String, $order: ProductOrder, $filter: ProductFilter) {
    products(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          sku
          name
          active
          type
          thumbnailUrl
          percentageInspectorStatus {
            percentage
            inspectorStatus
            blocks {
              code
              completed
            }
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

export const bundleProductsQuery = gql`
  query BundleProducts($first: Int, $last: Int, $after: String, $before: String, $order: BundleProductOrder, $filter: BundleProductFilter) {
    bundleProducts(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          sku
          active
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

export const configurableProductsQuery = gql`
  query ConfigurableProducts($first: Int, $last: Int, $after: String, $before: String, $order: ConfigurableProductOrder, $filter: ConfigurableProductFilter) {
    configurableProducts(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          sku
          active
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

export const productVariationsQuery = gql`
  query ProductVariations($first: Int, $last: Int, $after: String, $before: String, $order: ProductVariationOrder, $filter: ProductVariationFilter) {
    productVariations(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          sku
          active
          name
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

export const productTranslationsQuery = gql`
  query ProductTranslations($first: Int, $last: Int, $after: String, $before: String, $order: ProductTranslationOrder, $filter: ProductTranslationFilter) {
    productTranslations(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          product {
            id
            sku
          }
          name
          shortDescription
          description
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

export const getProductTranslationByLanguageQuery = gql`
  query getProductTranslationByLanguageQuery($languageCode: String!, $productId: GlobalID!) {
    productTranslations(filters: 
      {language: {exact: $languageCode},
        product: {id: {exact: $productId}}
      }) {
      edges {
        node {
          id
          name
          subtitle
          shortDescription
          description
          urlKey
        }
      }
    }
  }
`;

export const getProductContentByLanguageAndChannelQuery = gql`
  query getProductContentByLanguageAndChannel($languageCode: String!, $productId: GlobalID!, $salesChannelId: GlobalID) {
    productTranslations(filters: {
      language: {exact: $languageCode},
      product: {id: {exact: $productId}},
      salesChannel: {id: {exact: $salesChannelId}}
    }) {
      edges {
        node {
          id
          name
          subtitle
          shortDescription
          description
          urlKey
        }
      }
    }
  }
`;

export const getProductContentByLanguageAndDefaultQuery = gql`
  query getProductContentByLanguageAndDefault(
    $languageCode: String!
    $productId: GlobalID!
  ) {
    productTranslations(filters: {
      language: {exact: $languageCode},
      product: {id: {exact: $productId}},
      salesChannel: {id: {isNull: true}}
    }) {
      edges {
        node {
          id
          name
          subtitle
          shortDescription
          description
          urlKey
        }
      }
    }
  }
`;


export const configurableVariationsQuery = gql`
  query ConfigurableVariations($first: Int, $last: Int, $after: String, $before: String, $order: ConfigurableVariationOrder, $filter: ConfigurableVariationFilter) {
    configurableVariations(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          parent {
            id
            sku
            name
            type
            active
            thumbnailUrl
            inspectorStatus
          }
          variation {
            id
            sku
            name
            active
            type
            thumbnailUrl
            inspectorStatus
          }
          configuratorValue
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

export const bundleVariationsQuery = gql`
  query BundleVariations($first: Int, $last: Int, $after: String, $before: String, $order: BundleVariationOrder, $filter: BundleVariationFilter) {
    bundleVariations(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          parent {
            id
            sku
            name
            type
            active
            thumbnailUrl
            inspectorStatus
          }
          variation {
            id
            sku
            active
            type
            name
            thumbnailUrl
            inspectorStatus
          }
          quantity
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

export const configurableVariationsWithPricesQuery = gql`
  query ConfigurableVariationsWithPrices($first: Int, $after: String, $filter: ConfigurableVariationFilter) {
    configurableVariations(first: $first, after: $after, filters: $filter) {
      edges {
        node {
          id
          variation {
            id
            sku
            name
            active
            salespriceSet {
              id
              price
              rrp
              currency {
                id
                isoCode
              }
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const configurableVariationsWithGeneralQuery = gql`
  query ConfigurableVariationsWithGeneral($first: Int, $after: String, $filter: ConfigurableVariationFilter) {
    configurableVariations(first: $first, after: $after, filters: $filter) {
      edges {
        node {
          id
          variation {
            id
            sku
            name
            active
            allowBackorder
            vatRate {
              id
              name
              rate
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const bundleVariationsWithPricesQuery = gql`
  query BundleVariationsWithPrices($first: Int, $after: String, $filter: BundleVariationFilter) {
    bundleVariations(first: $first, after: $after, filters: $filter) {
      edges {
        node {
          id
          variation {
            id
            sku
            name
            active
            salespriceSet {
              id
              price
              rrp
              currency {
                id
                isoCode
              }
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const bundleVariationsWithGeneralQuery = gql`
  query BundleVariationsWithGeneral($first: Int, $after: String, $filter: BundleVariationFilter) {
    bundleVariations(first: $first, after: $after, filters: $filter) {
      edges {
        node {
          id
          variation {
            id
            sku
            name
            active
            allowBackorder
            vatRate {
              id
              name
              rate
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const getProductQuery = gql`
  query getProduct($id: GlobalID!) {
    product(id: $id) {
      id
      sku
      active
      type
      proxyId
      name
      thumbnailUrl
      productpropertySet {
        id
        valueSelect {
          id
        }
        property {
          id
          name
          type
          isProductType
        }
      }
      salespriceSet {
        id
        price
        rrp
        currency {
          id
          isoCode
          isDefaultCurrency
        }
      }
      vatRate {
        id
        rate
        name
      }
      allowBackorder
    }
  }
`;

export const getBundleProductQuery = gql`
  query getBundleProduct($id: GlobalID!) {
    bundleProduct(id: $id) {
      id
      sku
      active
    }
  }
`;

export const getConfigurableProductQuery = gql`
  query getConfigurableProduct($id: GlobalID!) {
    configurableProduct(id: $id) {
      id
      sku
      active
    }
  }
`;

export const getProductVariationQuery = gql`
  query getProductVariation($id: GlobalID!) {
    productVariation(id: $id) {
      id
      sku
      active
    }
  }
`;

export const getProductTranslationQuery = gql`
  query getProductTranslation($id: GlobalID!) {
    productTranslation(id: $id) {
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

export const getConfigurableVariationQuery = gql`
  query getConfigurableVariation($id: GlobalID!) {
    configurableVariation(id: $id) {
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

export const getBundleVariationQuery = gql`
  query getBundleVariation($id: GlobalID!) {
    bundleVariation(id: $id) {
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

export const manufacturableProductsQuery = gql`
  query ManufacturableProducts($first: Int, $last: Int, $after: String, $before: String, $order: ManufacturableProductOrder, $filter: ManufacturableProductFilter) {
    manufacturableProducts(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
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

export const getManufacturableProductQuery = gql`
  query GetManufacturableProduct($id: GlobalID!) {
    manufacturableProduct(id: $id) {
      id
      name
    }
  }
`;

export const dropshipProductsQuery = gql`
  query DropshipProducts($first: Int, $last: Int, $after: String, $before: String, $order: DropshipProductOrder, $filter: DropshipProductFilter) {
    dropshipProducts(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          active
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

export const getDropshipProductQuery = gql`
  query GetDropshipProduct($id: GlobalID!) {
    dropshipProduct(id: $id) {
      id
      name
      active
    }
  }
`;

export const billOfMaterialsQuery = gql`
  query BillOfMaterials($first: Int, $last: Int, $after: String, $before: String, $order: BillOfMaterialOrder, $filter: BillOfMaterialFilter) {
    billOfMaterials(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          variation {
            id
            name
            thumbnailUrl
            inspectorStatus
            active
          }
          quantity
          parent {
            id
            name
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

export const getBillOfMaterialQuery = gql`
  query GetBillOfMaterial($id: GlobalID!) {
    billOfMaterial(id: $id) {
      id
      variation {
        id
        name
      }
      quantity
      parent {
        id
        name
      }
    }
  }
`;


export const productTranslationBulletPointsQuery = gql`
  query ProductTranslationBulletPoints($filter: ProductTranslationBulletPointFilter) {
    productTranslationBulletPoints(filters: $filter, order: { sortOrder: ASC }) {
      edges {
        node {
          id
          text
          sortOrder
        }
      }
    }
  }
`;
