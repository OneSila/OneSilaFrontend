import { gql } from 'graphql-tag';

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
          proxyId
          productionTime
          thumbnailUrl
          vatRate {
            id
            name
            rate
          }
          alwaysOnStock
        
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

export const umbrellaProductsQuery = gql`
  query UmbrellaProducts($first: Int, $last: Int, $after: String, $before: String, $order: UmbrellaProductOrder, $filter: UmbrellaProductFilter) {
    umbrellaProducts(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
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
          shortDescription
          description
          urlKey
        }
      }
    }
  }
`;

export const umbrellaVariationsQuery = gql`
  query UmbrellaVariations($first: Int, $last: Int, $after: String, $before: String, $order: UmbrellaVariationOrder, $filter: UmbrellaVariationFilter) {
    umbrellaVariations(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          umbrella {
            id
            sku
            name
          }
          variation {
            id
            sku
            name
            active
            thumbnailUrl
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

export const bundleVariationsQuery = gql`
  query BundleVariations($first: Int, $last: Int, $after: String, $before: String, $order: BundleVariationOrder, $filter: BundleVariationFilter) {
    bundleVariations(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          umbrella {
            id
            sku
            name
          }
          variation {
            id
            sku
            active
            name
            thumbnailUrl
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

export const getProductQuery = gql`
  query getProduct($id: GlobalID!) {
    product(id: $id) {
      id
      sku
      active
      type
      proxyId
      name
      productionTime
      forSale
      thumbnailUrl
      vatRate {
        id
        rate
        name
      }
      baseProducts {
        id
        name
        type
        active
        thumbnailUrl
      }
      alwaysOnStock
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

export const getUmbrellaProductQuery = gql`
  query getUmbrellaProduct($id: GlobalID!) {
    umbrellaProduct(id: $id) {
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

export const getUmbrellaVariationQuery = gql`
  query getUmbrellaVariation($id: GlobalID!) {
    umbrellaVariation(id: $id) {
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

export const getBundleVariationQuery = gql`
  query getBundleVariation($id: GlobalID!) {
    bundleVariation(id: $id) {
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

export const manufacturableProductsQuery = gql`
  query ManufacturableProducts($first: Int, $last: Int, $after: String, $before: String, $order: ManufacturableProductOrder, $filter: ManufacturableProductFilter) {
    manufacturableProducts(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          productionTime
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
      productionTime
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
            productionTime
            thumbnailUrl
          }
          quantity
          umbrella {
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
      umbrella {
        id
        name
      }
    }
  }
`;

