import { gql } from 'graphql-tag';

// Property Mutations
export const createPropertyMutation = gql`
  mutation createProperty($data: PropertyInput!) {
    createProperty(data: $data) {
      id
      name
    }
  }
`;

export const createPropertiesMutation = gql`
  mutation createProperties($data: [PropertyInput!]!) {
    createProperties(data: $data) {
      id
      name
    }
  }
`;

export const updatePropertyMutation = gql`
  mutation updateProperty($data: PropertyPartialInput!) {
    updateProperty(data: $data) {
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

export const deletePropertyMutation = gql`
  mutation deleteProperty($id: GlobalID!) {
    deleteProperty(data: {id: $id}) {
      id
    }
  }
`;

export const deletePropertiesMutation = gql`
  mutation deleteProperties($ids: [GlobalID!]!) {
    deleteProperties(data: {ids: $ids}) {
      id
    }
  }
`;

// Property Translation Mutations
export const createPropertyTranslationMutation = gql`
  mutation createPropertyTranslation($data: PropertyTranslationInput!) {
    createPropertyTranslation(data: $data) {
      id
      name
      language
    }
  }
`;

export const createPropertyTranslationsMutation = gql`
  mutation createPropertyTranslations($data: [PropertyTranslationInput!]!) {
    createPropertyTranslations(data: $data) {
      id
      name
      language
    }
  }
`;

export const updatePropertyTranslationMutation = gql`
  mutation updatePropertyTranslation($data: PropertyTranslationPartialInput!) {
    updatePropertyTranslation(data: $data) {
      id
      name
      language
    }
  }
`;

export const deletePropertyTranslationMutation = gql`
  mutation deletePropertyTranslation($id: GlobalID!) {
    deletePropertyTranslation(data: {id: $id}) {
      id
    }
  }
`;

export const deletePropertyTranslationsMutation = gql`
  mutation deletePropertyTranslations($ids: [GlobalID!]!) {
    deletePropertyTranslations(data: {ids: $ids}) {
      id
    }
  }
`;

// Property Select Value Mutations
export const createPropertySelectValueMutation = gql`
  mutation createPropertySelectValue($data: PropertySelectValueInput!) {
    createPropertySelectValue(data: $data) {
      id
      value
    }
  }
`;

export const createPropertySelectValuesMutation = gql`
  mutation createPropertySelectValues($data: [PropertySelectValueInput!]!) {
    createPropertySelectValues(data: $data) {
      id
      value
    }
  }
`;

export const updatePropertySelectValueMutation = gql`
  mutation updatePropertySelectValue($data: PropertySelectValuePartialInput!) {
    updatePropertySelectValue(data: $data) {
      id
      value
    }
  }
`;

export const deletePropertySelectValueMutation = gql`
  mutation deletePropertySelectValue($id: GlobalID!) {
    deletePropertySelectValue(data: {id: $id}) {
      id
    }
  }
`;

export const deletePropertySelectValuesMutation = gql`
  mutation deletePropertySelectValues($ids: [GlobalID!]!) {
    deletePropertySelectValues(data: {ids: $ids}) {
      id
    }
  }
`;

// Product Property Mutations
export const createProductPropertyMutation = gql`
  mutation createProductProperty($data: ProductPropertyInput!) {
    createProductProperty(data: $data) {
      id
      product {
        id
        name
      }
      property {
        id
        name
      }
      valueSelect {
        id
        value
      }
      valueMultiSelect {
         id
         value
      }
      valueBoolean
      valueInt
      valueFloat
      valueDate
      valueDatetime
    }
  }
`;

export const createProductPropertiesMutation = gql`
  mutation createProductProperties($data: [ProductPropertyInput!]!) {
    createProductProperties(data: $data) {
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

export const updateProductPropertyMutation = gql`
  mutation updateProductProperty($data: ProductPropertyPartialInput!) {
    updateProductProperty(data: $data) {
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

export const deleteProductPropertyMutation = gql`
  mutation deleteProductProperty($id: GlobalID!) {
    deleteProductProperty(data: {id: $id}) {
      id
    }
  }
`;

export const deleteProductPropertiesMutation = gql`
  mutation deleteProductProperties($ids: [GlobalID!]!) {
    deleteProductProperties(data: {ids: $ids}) {
      id
    }
  }
`;

// Product Property Text Translation Mutations
export const createProductPropertyTextTranslationMutation = gql`
  mutation createProductPropertyTextTranslation($data: ProductPropertyTextTranslationInput!) {
    createProductPropertyTextTranslation(data: $data) {
      id
      valueText
      valueDescription
      language
    }
  }
`;

export const createProductPropertyTextTranslationsMutation = gql`
  mutation createProductPropertyTextTranslations($data: [ProductPropertyTextTranslationInput!]!) {
    createProductPropertyTextTranslations(data: $data) {
      id
      valueText
      valueDescription
      language
    }
  }
`;

export const updateProductPropertyTextTranslationMutation = gql`
  mutation updateProductPropertyTextTranslation($data: ProductPropertyTextTranslationPartialInput!) {
    updateProductPropertyTextTranslation(data: $data) {
      id
      valueText
      valueDescription
      language
    }
  }
`;

export const deleteProductPropertyTextTranslationMutation = gql`
  mutation deleteProductPropertyTextTranslation($id: GlobalID!) {
    deleteProductPropertyTextTranslation(data: {id: $id}) {
      id
    }
  }
`;

export const deleteProductPropertyTextTranslationsMutation = gql`
  mutation deleteProductPropertyTextTranslations($ids: [GlobalID!]!) {
    deleteProductPropertyTextTranslations(data: {ids: $ids}) {
      id
    }
  }
`;

// Property Select Value Translation Mutations
export const createPropertySelectValueTranslationMutation = gql`
  mutation createPropertySelectValueTranslation($data: PropertySelectValueTranslationInput!) {
    createPropertySelectValueTranslation(data: $data) {
      id
      value
      language
    }
  }
`;

export const createPropertySelectValueTranslationsMutation = gql`
  mutation createPropertySelectValueTranslations($data: [PropertySelectValueTranslationInput!]!) {
    createPropertySelectValueTranslations(data: $data) {
      id
      value
      language
    }
  }
`;

export const updatePropertySelectValueTranslationMutation = gql`
  mutation updatePropertySelectValueTranslation($data: PropertySelectValueTranslationPartialInput!) {
    updatePropertySelectValueTranslation(data: $data) {
      id
      value
      language
    }
  }
`;

export const deletePropertySelectValueTranslationMutation = gql`
  mutation deletePropertySelectValueTranslation($id: GlobalID!) {
    deletePropertySelectValueTranslation(data: {id: $id}) {
      id
    }
  }
`;

export const deletePropertySelectValueTranslationsMutation = gql`
  mutation deletePropertySelectValueTranslations($ids: [GlobalID!]!) {
    deletePropertySelectValueTranslations(data: {ids: $ids}) {
      id
    }
  }
`;

// Product Properties Rule Mutations
export const createProductPropertiesRuleMutation = gql`
  mutation createProductPropertiesRule($data: ProductPropertiesRuleInput!) {
    createProductPropertiesRule(data: $data) {
      id
      productType {
        id
        value
      }
    }
  }
`;

export const completeCreateProductPropertiesRuleMutation = gql`
  mutation completeCreateProductPropertiesRule($data: ProductPropertiesRuleInput!) {
    completeCreateProductPropertiesRule(data: $data) {
      id
      productType {
        id
        value
      }
      items {
        id
        property {
          id
          name
        }
        type
        sortOrder
      }
    }
  }
`;

export const createProductPropertiesRulesMutation = gql`
  mutation createProductPropertiesRules($data: [ProductPropertiesRuleInput!]!) {
    createProductPropertiesRules(data: $data) {
      id
      productType {
        id
        value
      }
    }
  }
`;

export const updateProductPropertiesRuleMutation = gql`
  mutation updateProductPropertiesRule($data: ProductPropertiesRulePartialInput!) {
    updateProductPropertiesRule(data: $data) {
      id
      productType {
        id
        value
      }
    }
  }
`;

export const completeUpdateProductPropertiesRuleMutation = gql`
  mutation completeUpdateProductPropertiesRule($data: ProductPropertiesRulePartialInput!) {
    completeUpdateProductPropertiesRule(data: $data) {
      id
      productType {
        id
        value
      }
      items {
        id
        property {
          id
          name
        }
        type
        sortOrder
      }
    }
  }
`;

export const deleteProductPropertiesRuleMutation = gql`
  mutation deleteProductPropertiesRule($id: GlobalID!) {
    deleteProductPropertiesRule(data: {id: $id}) {
      id
    }
  }
`;

export const deleteProductPropertiesRulesMutation = gql`
  mutation deleteProductPropertiesRules($ids: [GlobalID!]!) {
    deleteProductPropertiesRules(data: {ids: $ids}) {
      id
    }
  }
`;

// Product Properties Rule Item Mutations
export const createProductPropertiesRuleItemMutation = gql`
  mutation createProductPropertiesRuleItem($data: ProductPropertiesRuleItemInput!) {
    createProductPropertiesRuleItem(data: $data) {
      id
      rule {
        id
        productType {
          id
          value
        }
      }
      property {
        id
        name
      }
      type
      sortOrder
    }
  }
`;

export const createProductPropertiesRuleItemsMutation = gql`
  mutation createProductPropertiesRuleItems($data: [ProductPropertiesRuleItemInput!]!) {
    createProductPropertiesRuleItems(data: $data) {
      id
      rule {
        id
        productType {
          id
          value
        }
      }
      property {
        id
        name
      }
      type
      sortOrder
    }
  }
`;

export const updateProductPropertiesRuleItemMutation = gql`
  mutation updateProductPropertiesRuleItem($data: ProductPropertiesRuleItemPartialInput!) {
    updateProductPropertiesRuleItem(data: $data) {
      id
      rule {
        id
        productType {
          id
          value
        }
      }
      property {
        id
        name
      }
      type
      sortOrder
    }
  }
`;

export const deleteProductPropertiesRuleItemMutation = gql`
  mutation deleteProductPropertiesRuleItem($id: GlobalID!) {
    deleteProductPropertiesRuleItem(data: {id: $id}) {
      id
    }
  }
`;

export const deleteProductPropertiesRuleItemsMutation = gql`
  mutation deleteProductPropertiesRuleItems($ids: [GlobalID!]!) {
    deleteProductPropertiesRuleItems(data: {ids: $ids}) {
      id
    }
  }
`;