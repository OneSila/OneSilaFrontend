// salesChannelMutations.ts
import { gql } from 'graphql-tag';

export const createMagentoSalesChannelMutation = gql`
  mutation createMagentoSalesChannel($data: MagentoSalesChannelInput!) {
    createMagentoSalesChannel(data: $data) {
      id
      hostname
    }
  }
`;

export const updateMagentoSalesChannelMutation = gql`
  mutation updateMagentoSalesChannel($data: MagentoSalesChannelPartialInput!) {
    updateMagentoSalesChannel(data: $data) {
      id
      hostname
    }
  }
`;

export const createShopifySalesChannelMutation = gql`
  mutation createShopifySalesChannel($data: ShopifySalesChannelInput!) {
    createShopifySalesChannel(data: $data) {
      id
      hostname
      state
    }
  }
`;

export const updateShopifySalesChannelMutation = gql`
  mutation updateShopifySalesChannel($data: ShopifySalesChannelPartialInput!) {
    updateShopifySalesChannel(data: $data) {
      id
      hostname
      state
    }
  }
`;

export const createAmazonSalesChannelMutation = gql`
  mutation createAmazonSalesChannel($data: AmazonSalesChannelInput!) {
    createAmazonSalesChannel(data: $data) {
      id
      hostname
    }
  }
`;

export const updateAmazonSalesChannelMutation = gql`
  mutation updateAmazonSalesChannel($data: AmazonSalesChannelPartialInput!) {
    updateAmazonSalesChannel(data: $data) {
      id
      hostname
    }
  }
`;


// Sales Channel Mutations
export const createSalesChannelMutation = gql`
  mutation createSalesChannel($data: SalesChannelInput!) {
    createSalesChannel(data: $data) {
      id
      name
      active
      multiTenantCompany {
        id
        name
      }
    }
  }
`;

export const createSalesChannelsMutation = gql`
  mutation createSalesChannels($data: [SalesChannelInput!]!) {
    createSalesChannels(data: $data) {
      id
      name
      active
      multiTenantCompany {
        id
        name
      }
    }
  }
`;

export const updateSalesChannelMutation = gql`
  mutation updateSalesChannel($data: SalesChannelPartialInput!) {
    updateSalesChannel(data: $data) {
      id
      name
      active
      multiTenantCompany {
        id
        name
      }
    }
  }
`;

export const deleteSalesChannelMutation = gql`
  mutation deleteSalesChannel($id: GlobalID!) {
    deleteSalesChannel(data: { id: $id }) {
      id
    }
  }
`;

export const deleteIntegrationMutation = gql`
  mutation deleteIntegration($id: GlobalID!) {
    deleteIntegration(data: { id: $id }) {
      id
    }
  }
`;

export const deleteSalesChannelsMutation = gql`
  mutation deleteSalesChannels($ids: [GlobalID!]!) {
    deleteSalesChannels(data: { ids: $ids }) {
      id
    }
  }
`;

// Sales Channel Integration Price List Mutations
export const createSalesChannelIntegrationPricelistMutation = gql`
  mutation createSalesChannelIntegrationPricelist($data: SalesChannelIntegrationPricelistInput!) {
    createSalesChannelIntegrationPricelist(data: $data) {
      id
      name
      active
      multiTenantCompany {
        id
        name
      }
    }
  }
`;

export const createSalesChannelIntegrationPricelistsMutation = gql`
  mutation createSalesChannelIntegrationPricelists($data: [SalesChannelIntegrationPricelistInput!]!) {
    createSalesChannelIntegrationPricelists(data: $data) {
      id
      name
      active
      multiTenantCompany {
        id
        name
      }
    }
  }
`;

export const updateSalesChannelIntegrationPricelistMutation = gql`
  mutation updateSalesChannelIntegrationPricelist($data: SalesChannelIntegrationPricelistPartialInput!) {
    updateSalesChannelIntegrationPricelist(data: $data) {
      id
      name
      active
      multiTenantCompany {
        id
        name
      }
    }
  }
`;

export const deleteSalesChannelIntegrationPricelistMutation = gql`
  mutation deleteSalesChannelIntegrationPricelist($id: GlobalID!) {
    deleteSalesChannelIntegrationPricelist(data: { id: $id }) {
      id
    }
  }
`;

export const deleteSalesChannelIntegrationPricelistsMutation = gql`
  mutation deleteSalesChannelIntegrationPricelists($ids: [GlobalID!]!) {
    deleteSalesChannelIntegrationPricelists(data: { ids: $ids }) {
      id
    }
  }
`;

// Sales Channel View Assign Mutations
export const createSalesChannelViewAssignMutation = gql`
  mutation createSalesChannelViewAssign($data: SalesChannelViewAssignInput!) {
    createSalesChannelViewAssign(data: $data) {
      id
      product {
        id
        name
      }
      salesChannelView {
        id
        name
      }
    }
  }
`;


export const createSalesChannelViewAssignsMutation = gql`
  mutation createSalesChannelViewAssigns($data: [SalesChannelViewAssignInput!]!) {
    createSalesChannelViewAssigns(data: $data) {
      id
      product {
        id
        name
      }
      salesChannelView {
        id
        name
      }
    }
  }
`;

export const updateSalesChannelViewAssignMutation = gql`
  mutation updateSalesChannelViewAssign($data: SalesChannelViewAssignPartialInput!) {
    updateSalesChannelViewAssign(data: $data) {
      id
      product {
        id
        name
      }
      salesChannelView {
        id
        name
      }
    }
  }
`;

export const resyncSalesChannelViewAssignMutation = gql`
  mutation resyncSalesChannelViewAssign($data: SalesChannelViewAssignPartialInput!) {
    resyncSalesChannelViewAssign(data: $data) {
      id
      product {
        id
        name
      }
      salesChannelView {
        id
        name
      }
    }
  }
`;

export const updateSalesChannelViewMutation = gql`
  mutation updateSalesChannelView($data: SalesChannelViewPartialInput!) {
    updateSalesChannelView(data: $data) {
      id
      name
      active
    }
  }
`;

export const updateRemoteLanguageMutation = gql`
  mutation updateRemoteLanguage($data: RemoteLanguagePartialInput!) {
    updateRemoteLanguage(data: $data) {
      id
      localInstance
      remoteCode
    }
  }
`;

export const updateRemoteCurrencyMutation = gql`
  mutation updateRemoteCurrency($data: RemoteCurrencyPartialInput!) {
    updateRemoteCurrency(data: $data) {
      id
      localInstance {
        id
        symbol
        isoCode
      }
      remoteCode
    }
  }
`;


export const bulkUpdateRemoteLanguagesMutation = gql`
  mutation bulkUpdateRemoteLanguages($data: [RemoteLanguagePartialInput!]!) {
    updateRemoteLanguages(data: $data) {
      id
      localInstance
      remoteCode
    }
  }
`;


export const bulkUpdateRemoteCurrenciesMutation = gql`
  mutation bulkUpdateRemoteCurrencies($data: [RemoteCurrencyPartialInput!]!) {
    updateRemoteCurrencies(data: $data) {
      id
      localInstance {
        id
        symbol
        isoCode
      }
      remoteCode
    }
  }
`;


export const deleteSalesChannelViewAssignMutation = gql`
  mutation deleteSalesChannelViewAssign($id: GlobalID!) {
    deleteSalesChannelViewAssign(data: { id: $id }) {
      id
    }
  }
`;

export const deleteSalesChannelViewAssignsMutation = gql`
  mutation deleteSalesChannelViewAssigns($ids: [GlobalID!]!) {
    deleteSalesChannelViewAssigns(data: { ids: $ids }) {
      id
    }
  }
`;


export const createSalesChannelImportMutation = gql`
  mutation createSalesImportProcess($data: SalesChannelImportInput!) {
    createSalesImportProcess(data: $data) {
      id
      importId
      status
      percentage
      salesChannel {
        id
      }
    }
  }
`;


export const updateSalesChannelImportMutation = gql`
  mutation updateSalesImportProcess($data: SalesChannelImportPartialInput!) {
    updateSalesImportProcess(data: $data) {
      id
      status
      percentage
      salesChannel {
        id
      }
    }
  }
`;



export const createImportPropertiesMutation = gql`
  mutation createImportProperties($data: [ImportPropertyInput!]!) {
    createImportProperties(data: $data) {
      id
      rawData
      structuredData
      successfullyImported
      importProcess {
        id
      }
    }
  }
`;

export const createRemoteEanCodeAttributeMutation = gql`
  mutation createRemoteEanCodeAttribute($data: MagentoRemoteEanCodeAttributeInput!) {
    createRemoteEanCodeAttribute(instance: $data) {
      ... on MagentoRemoteAttributeType {
        id
        attributeCode
        name
        data
      }
    }
  }
`;

export const refreshSalesChannelWebsitesMutation = gql`
  mutation refreshSalesChannelWebsites($data: SalesChannelPartialInput!) {
    refreshSalesChannelWebsites(data: $data) {
      id
      active
    }
  }
`;

export const getShopifyRedirectUrlMutation = gql`
    mutation GetShopifyRedirectUrl($data: ShopifySalesChannelPartialInput!) {
      getShopifyRedirectUrl(instance: $data) {
        ... on ShopifyRedirectUrlType {
          redirectUrl
        }
        ... on OperationInfo {
          messages {
            kind
            message
            field
            code
          }
        }
      }
}
`;

export const validateShopifyAuthMutation = gql`
  mutation ValidateShopifyAuth($data: ShopifyValidateAuthInput!) {
    validateShopifyAuth(instance: $data) {
      ... on ShopifySalesChannelType {
        id
        hostname
      }
      ... on OperationInfo {
        messages {
          kind
          message
          field
          code
        }
      }
    }
  }
`;


export const getAmazonRedirectUrlMutation = gql`
  mutation GetAmazonRedirectUrl($data: AmazonSalesChannelPartialInput!) {
    getAmazonRedirectUrl(instance: $data) {
      ... on AmazonRedirectUrlType {
        redirectUrl
      }
      ... on OperationInfo {
        messages {
          kind
          message
          field
          code
        }
      }
    }
  }
`;

export const validateAmazonAuthMutation = gql`
  mutation ValidateAmazonAuth($data: AmazonValidateAuthInput!) {
    validateAmazonAuth(instance: $data) {
      ... on AmazonSalesChannelType {
        id
        region
        country
      }
      ... on OperationInfo {
        messages {
          kind
          message
          field
          code
        }
      }
    }
  }
`;

// Amazon Property Mutations
export const createAmazonPropertyMutation = gql`
  mutation createAmazonProperty($data: AmazonPropertyInput!) {
    createAmazonProperty(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

export const createAmazonPropertiesMutation = gql`
  mutation createAmazonProperties($data: [AmazonPropertyInput!]!) {
    createAmazonProperties(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

export const updateAmazonPropertyMutation = gql`
  mutation updateAmazonProperty($data: AmazonPropertyPartialInput!) {
    updateAmazonProperty(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

// Amazon Property Select Value Mutations
export const createAmazonPropertySelectValueMutation = gql`
  mutation createAmazonPropertySelectValue($data: AmazonPropertySelectValueInput!) {
    createAmazonPropertySelectValue(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

export const createAmazonPropertySelectValuesMutation = gql`
  mutation createAmazonPropertySelectValues($data: [AmazonPropertySelectValueInput!]!) {
    createAmazonPropertySelectValues(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

export const updateAmazonPropertySelectValueMutation = gql`
  mutation updateAmazonPropertySelectValue($data: AmazonPropertySelectValuePartialInput!) {
    updateAmazonPropertySelectValue(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

// Amazon Product Type Mutations
export const createAmazonProductTypeMutation = gql`
  mutation createAmazonProductType($data: AmazonProductTypeInput!) {
    createAmazonProductType(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

export const createAmazonProductTypesMutation = gql`
  mutation createAmazonProductTypes($data: [AmazonProductTypeInput!]!) {
    createAmazonProductTypes(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

export const updateAmazonProductTypeMutation = gql`
  mutation updateAmazonProductType($data: AmazonProductTypePartialInput!) {
    updateAmazonProductType(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;