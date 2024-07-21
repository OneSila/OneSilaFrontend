import { gql } from 'graphql-tag';

// Property Queries
export const propertiesQuery = gql`
query Properties($first: Int, $last: Int, $after: String, $before: String, $order: PropertyOrder, $filter: PropertyFilter) {
    properties(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          type
          isPublicInformation
          addToFilters
          isProductType
          internalName
          valueValidator
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

export const getPropertyQuery = gql`
  query getProperty($id: GlobalID!) {
    property(id: $id) {
      id
      name
      type
      isPublicInformation
      addToFilters
      isProductType
      internalName
      valueValidator
    }
  }
`;

// Property Translation Queries
export const propertyTranslationsQuery = gql`
query PropertyTranslations($first: Int, $last: Int, $after: String, $before: String, $order: PropertyTranslationOrder, $filter: PropertyTranslationFilter) {
    propertyTranslations(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          language
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

export const getPropertyTranslationQuery = gql`
  query getPropertyTranslation($id: GlobalID!) {
    propertyTranslation(id: $id) {
      id
      name
      language
    }
  }
`;

// Property Select Value Queries
export const propertySelectValuesQuery = gql`
query PropertySelectValues($first: Int, $last: Int, $after: String, $before: String, $order: PropertySelectValueOrder, $filter: PropertySelectValueFilter) {
    propertySelectValues(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          value
          property {
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

export const getPropertySelectValueQuery = gql`
  query getPropertySelectValue($id: GlobalID!) {
    propertySelectValue(id: $id) {
      id
      value
      property {
        id
        name
      }
    }
  }
`;

// Product Property Queries
export const productPropertiesQuery = gql`
query ProductProperties($first: Int, $last: Int, $after: String, $before: String, $order: ProductPropertyOrder, $filter: ProductPropertyFilter) {
    productProperties(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          product {
            id
            name
          }
          property {
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

export const getProductPropertyQuery = gql`
  query getProductProperty($id: GlobalID!) {
    productProperty(id: $id) {
      id
      product {
        id
        name
      }
      property {
        id
        name
      }
    }
  }
`;

// Product Property Text Translation Queries
export const productPropertyTextTranslationsQuery = gql`
query ProductPropertyTextTranslations($first: Int, $last: Int, $after: String, $before: String, $order: ProductPropertyTextTranslationOrder, $filter: ProductPropertyTextTranslationFilter) {
    productPropertyTextTranslations(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          valueText
          valueDescription
          language
          productProperty {
            id
            product {
              id
              name
            }
            property {
              id
              name
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

export const getProductPropertyTextTranslationQuery = gql`
  query getProductPropertyTextTranslation($id: GlobalID!) {
    productPropertyTextTranslation(id: $id) {
      id
      valueText
      valueDescription
      language
      productProperty {
        id
        product {
          id
          name
        }
        property {
          id
          name
        }
      }
    }
  }
`;

// Property Select Value Translation Queries
export const propertySelectValueTranslationsQuery = gql`
query PropertySelectValueTranslations($first: Int, $last: Int, $after: String, $before: String, $order: PropertySelectValueTranslationOrder, $filter: PropertySelectValueTranslationFilter) {
    propertySelectValueTranslations(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          value
          language
          propertyselectvalue {
            id
            property {
              id
              name
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

export const getPropertySelectValueTranslationQuery = gql`
  query getPropertySelectValueTranslation($id: GlobalID!) {
    propertySelectValueTranslation(id: $id) {
      id
      value
      language
      propertySelectValue {
        id
        property {
          id
          name
        }
      }
    }
  }
`;