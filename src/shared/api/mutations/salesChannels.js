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

export const createWoocommerceSalesChannelMutation = gql`
  mutation createWoocommerceSalesChannel($data: WoocommerceSalesChannelInput!) {
    createWoocommerceSalesChannel(data: $data) {
      id
      hostname
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

export const createEbaySalesChannelMutation = gql`
  mutation createEbaySalesChannel($data: EbaySalesChannelInput!) {
    createEbaySalesChannel(data: $data) {
      id
      hostname
    }
  }
`;

export const createSheinSalesChannelMutation = gql`
  mutation createSheinSalesChannel($data: SheinSalesChannelInput!) {
    createSheinSalesChannel(data: $data) {
      id
      hostname
    }
  }
`;

export const updateWoocommerceSalesChannelMutation = gql`
  mutation updateWoocommerceSalesChannel($data: WoocommerceSalesChannelPartialInput!) {
    updateWoocommerceSalesChannel(data: $data) {
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

export const updateEbaySalesChannelMutation = gql`
  mutation updateEbaySalesChannel($data: EbaySalesChannelPartialInput!) {
    updateEbaySalesChannel(data: $data) {
      id
      hostname
    }
  }
`;

export const resyncSalesChannelGptFeedMutation = gql`
  mutation resyncSalesChannelGptFeed($id: GlobalID!) {
    resyncSalesChannelGptFeed(instance: { id: $id }) {
      id
      fileUrl
      lastSyncedAt
      file {
        url
      }
    }
  }
`;

export const updateSheinSalesChannelMutation = gql`
  mutation updateSheinSalesChannel($data: SheinSalesChannelPartialInput!) {
    updateSheinSalesChannel(data: $data) {
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
      salesChannel {
        id
      }
      priceList {
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
      salesChannel {
        id
      }
      priceList {
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
      salesChannel {
        id
      }
      priceList {
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

export const refreshLatestAmazonIssuesMutation = gql`
  mutation refreshLatestAmazonIssues($data: SalesChannelViewAssignPartialInput!) {
    refreshAmazonLatestIssues(instance: $data) {
      id
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

export const updateAmazonSalesChannelViewMutation = gql`
  mutation updateAmazonSalesChannelView($data: AmazonSalesChannelViewPartialInput!) {
    updateAmazonSalesChannelView(data: $data) {
      id
      name
      active
      isDefault
    }
  }
`;

export const updateEbaySalesChannelViewMutation = gql`
  mutation updateEbaySalesChannelView($data: EbaySalesChannelViewPartialInput!) {
    updateEbaySalesChannelView(data: $data) {
      id
      name
      url
      fulfillmentPolicyId
      fulfillmentPolicyChoices
      paymentPolicyId
      paymentPolicyChoices
      returnPolicyId
      returnPolicyChoices
      merchantLocationKey
      merchantLocationChoices
      lengthUnit
      weightUnit
      isDefault
    }
  }
`;

export const updateEbayInternalPropertyMutation = gql`
  mutation updateEbayInternalProperty($data: EbayInternalPropertyPartialInput!) {
    updateEbayInternalProperty(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

export const updateEbayInternalPropertyOptionMutation = gql`
  mutation updateEbayInternalPropertyOption($data: EbayInternalPropertyOptionPartialInput!) {
    updateEbayInternalPropertyOption(data: $data) {
      id
      localInstance {
        id
        value
      }
    }
  }
`;

export const updateSheinInternalPropertyMutation = gql`
  mutation updateSheinInternalProperty($data: SheinInternalPropertyPartialInput!) {
    updateSheinInternalProperty(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

export const updateSheinInternalPropertyOptionMutation = gql`
  mutation updateSheinInternalPropertyOption($data: SheinInternalPropertyOptionPartialInput!) {
    updateSheinInternalPropertyOption(data: $data) {
      id
      localInstance {
        id
        value
      }
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

export const getEbayRedirectUrlMutation = gql`
  mutation GetEbayRedirectUrl($data: EbaySalesChannelPartialInput!) {
    getEbayRedirectUrl(instance: $data) {
      ... on EbayRedirectUrlType {
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

export const getSheinRedirectUrlMutation = gql`
  mutation GetSheinRedirectUrl($data: SheinSalesChannelPartialInput!) {
    getSheinRedirectUrl(instance: $data) {
      ... on SheinRedirectUrlType {
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

export const validateEbayAuthMutation = gql`
  mutation ValidateEbayAuth($data: EbayValidateAuthInput!) {
    validateEbayAuth(instance: $data) {
      ... on EbaySalesChannelType {
        id
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

export const validateSheinAuthMutation = gql`
  mutation ValidateSheinAuth($data: SheinValidateAuthInput!) {
    validateSheinAuth(instance: $data) {
      ... on SheinSalesChannelType {
        id
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

export const updateAmazonPropertyMutation = gql`
  mutation updateAmazonProperty($data: AmazonPropertyPartialInput!) {
    updateAmazonProperty(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

export const updateEbayPropertyMutation = gql`
  mutation updateEbayProperty($data: EbayPropertyPartialInput!) {
    updateEbayProperty(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

export const updateSheinPropertyMutation = gql`
  mutation updateSheinProperty($data: SheinPropertyPartialInput!) {
    updateSheinProperty(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

// Amazon Property Select Value Mutations

export const updateAmazonPropertySelectValueMutation = gql`
  mutation updateAmazonPropertySelectValue($data: AmazonPropertySelectValuePartialInput!) {
    updateAmazonPropertySelectValue(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

export const bulkUpdateAmazonPropertySelectValueLocalInstanceMutation = gql`
  mutation bulkUpdateAmazonPropertySelectValueLocalInstance($data: BulkAmazonPropertySelectValueLocalInstanceInput!) {
    bulkUpdateAmazonPropertySelectValueLocalInstance(instance: $data) {
      id
    }
  }
`;

export const updateEbayPropertySelectValueMutation = gql`
  mutation updateEbayPropertySelectValue($data: EbayPropertySelectValuePartialInput!) {
    updateEbayPropertySelectValue(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

export const updateSheinPropertySelectValueMutation = gql`
  mutation updateSheinPropertySelectValue($data: SheinPropertySelectValuePartialInput!) {
    updateSheinPropertySelectValue(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

export const bulkUpdateEbayPropertySelectValueLocalInstanceMutation = gql`
  mutation bulkUpdateEbayPropertySelectValueLocalInstance($data: BulkEbayPropertySelectValueLocalInstanceInput!) {
    bulkUpdateEbayPropertySelectValueLocalInstance(instance: $data) {
      id
    }
  }
`;

// Amazon Product Type Mutations

export const updateAmazonProductTypeMutation = gql`
  mutation updateAmazonProductType($data: AmazonProductTypePartialInput!) {
    updateAmazonProductType(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

export const createAmazonProductTypesFromLocalRulesMutation = gql`
  mutation createAmazonProductTypesFromLocalRules($data: AmazonSalesChannelPartialInput!) {
    createAmazonProductTypesFromLocalRules(instance: $data) {
      id
    }
  }
`;

export const updateEbayProductTypeMutation = gql`
  mutation updateEbayProductType($data: EbayProductTypePartialInput!) {
    updateEbayProductType(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

export const createEbayProductTypesFromLocalRulesMutation = gql`
  mutation createEbayProductTypesFromLocalRules($data: EbaySalesChannelPartialInput!) {
    createEbayProductTypesFromLocalRules(instance: $data) {
      id
    }
  }
`;

export const updateSheinProductTypeMutation = gql`
  mutation updateSheinProductType($data: SheinProductTypePartialInput!) {
    updateSheinProductType(data: $data) {
      id
      mappedLocally
      mappedRemotely
    }
  }
`;

export const createSheinProductTypesFromLocalRulesMutation = gql`
  mutation createSheinProductTypesFromLocalRules($data: SheinSalesChannelPartialInput!) {
    createSheinProductTypesFromLocalRules(instance: $data) {
      id
    }
  }
`;

export const suggestAmazonProductTypeMutation = gql`
  mutation suggestAmazonProductType($name: String, $marketplace: SalesChannelViewPartialInput!) {
    suggestAmazonProductType(name: $name, marketplace: $marketplace) {
      productTypeVersion
      productTypes {
        displayName
        marketplaceIds
        name
      }
    }
  }
`;
export const suggestEbayCategoryMutation = gql`
  mutation suggestEbayCategory($name: String!, $marketplace: SalesChannelViewPartialInput!) {
    suggestEbayCategory(name: $name, marketplace: $marketplace) {
      categoryTreeId
      categories {
        categoryId
        categoryName
        categoryPath
        leaf
      }
    }
  }
`;
export const suggestSheinCategoryMutation = gql`
  mutation suggestSheinCategory(
    $marketplace: SalesChannelViewPartialInput!
    $name: String
    $image: ImagePartialInput
    $externalImageUrl: String
  ) {
    suggestSheinCategory(
      marketplace: $marketplace
      name: $name
      image: $image
      externalImageUrl: $externalImageUrl
    ) {
      siteRemoteId
      categories {
        categoryId
        productTypeId
        categoryName
        categoryPath
        leaf
        order
        vote
      }
    }
  }
`;
export const createAmazonImportProcessMutation = gql`
  mutation createAmazonImportProcess($data: AmazonSalesChannelImportInput!) {
    createAmazonImportProcess(data: $data) {
      id
      type
      status
      percentage
      createdAt
      salesChannel {
        id
      }
    }
  }
`;

export const updateAmazonImportProcessMutation = gql`
  mutation updateAmazonImportProcess($data: AmazonSalesChannelImportPartialInput!) {
    updateAmazonImportProcess(data: $data) {
      id
      type
      status
      percentage
      createdAt
      salesChannel {
        id
      }
    }
  }
`;

export const createEbayImportProcessMutation = gql`
  mutation createEbayImportProcess($data: EbaySalesChannelImportInput!) {
    createEbayImportProcess(data: $data) {
      id
      type
      status
      percentage
      createdAt
      salesChannel {
        id
      }
    }
  }
`;

export const updateEbayImportProcessMutation = gql`
  mutation updateEbayImportProcess($data: EbaySalesChannelImportPartialInput!) {
    updateEbayImportProcess(data: $data) {
      id
      type
      status
      percentage
      createdAt
      salesChannel {
        id
      }
    }
  }
`;

export const createSheinImportProcessMutation = gql`
  mutation createSheinImportProcess($data: SheinSalesChannelImportInput!) {
    createSheinImportProcess(data: $data) {
      id
      type
      status
      percentage
      createdAt
      salesChannel {
        id
      }
    }
  }
`;

export const updateSheinImportProcessMutation = gql`
  mutation updateSheinImportProcess($data: SheinSalesChannelImportPartialInput!) {
    updateSheinImportProcess(data: $data) {
      id
      type
      status
      percentage
      createdAt
      salesChannel {
        id
      }
    }
  }
`;

// Amazon Default Unit Configurator Mutation
export const updateAmazonDefaultUnitConfiguratorMutation = gql`
  mutation updateAmazonDefaultUnitConfigurator($data: AmazonDefaultUnitConfiguratorPartialInput!) {
    updateAmazonDefaultUnitConfigurator(data: $data) {
      id
      name
      code
      selectedUnit
      choices
    }
  }
`;
