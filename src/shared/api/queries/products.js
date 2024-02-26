import { gql } from 'graphql-tag';

export const productsQuery = gql`
  query Products($first: Int, $last: Int, $after: String, $before: String, $order: ProductOrder, $filter: ProductFilter) {
    products(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          sku
          active
          type
          taxRate {
            id
            rate
          }
          alwaysOnStock
          umbrellaVariations {
            id
            name
          }
          bundleVariations {
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

export const umbrellaVariationsQuery = gql`
  query UmbrellaVariations($first: Int, $last: Int, $after: String, $before: String, $order: UmbrellaVariationOrder, $filter: UmbrellaVariationFilter) {
    umbrellaVariations(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
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
          }
          variation {
            id
            sku
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
      taxRate {
        id
        rate
      }
      alwaysOnStock
      umbrellaVariations {
        id
        name
      }
      bundleVariations {
        id
        name
      }
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
