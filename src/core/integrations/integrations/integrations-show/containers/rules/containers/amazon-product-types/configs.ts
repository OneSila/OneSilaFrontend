import { FieldType } from "../../../../../../../../shared/utils/constants";
import { amazonProductTypesQuery, getAmazonProductTypeQuery } from "../../../../../../../../shared/api/queries/salesChannels.js";
import { productPropertiesRulesListingQuery } from "../../../../../../../../shared/api/queries/properties.js";
import { updateAmazonProductTypeMutation } from "../../../../../../../../shared/api/mutations/salesChannels.js";
import { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import { FormConfig, FormType } from '../../../../../../../../shared/components/organisms/general-form/formConfig';
import { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";

export const amazonProductTypeEditFormConfigConstructor = (
  t: Function,
  type: string,
  productTypeId: string,
  integrationId: string
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updateAmazonProductTypeMutation,
  mutationKey: "updateAmazonProductType",
  query: getAmazonProductTypeQuery,
  queryVariables: { id: productTypeId },
  queryDataKey: "amazonProductType",
  submitUrl: { name: 'integrations.integrations.show', params: { type: type, id: integrationId }, query: { tab: 'productRules' } },
  fields: [
    {
      type: FieldType.Hidden,
      name: 'id',
      value: productTypeId
    },
    {
      type: FieldType.Text,
      label: t('integrations.show.productRules.labels.productTypeCode'),
      name: 'productTypeCode',
      disabled: true
    },
    {
      type: FieldType.Text,
      label: t('shared.labels.name'),
      name: 'name',
      disabled: true
    },
    {
      type: FieldType.Query,
      name: 'localInstance',
      label: t('properties.rule.title'),
      labelBy: 'value',
      valueBy: 'id',
      query: productPropertiesRulesListingQuery,
      dataKey: 'productPropertiesRules',
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
    }
  ]
});

export const amazonProductTypesSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    { type: FieldType.Boolean, name: 'mappedLocally', label: t('integrations.show.mapping.mappedLocally'), strict: true },
    { type: FieldType.Boolean, name: 'mappedRemotely', label: t('integrations.show.mapping.mappedRemotely'), strict: true },
  ],
  orders: []
});

export const amazonProductTypesListingConfigConstructor = (t: Function, specificIntegrationId): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('integrations.show.productRules.labels.productTypeCode'),
    t('integrations.show.mapping.mappedLocally'),
    t('integrations.show.mapping.mappedRemotely'),
    t('properties.rule.title')
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'productTypeCode', type: FieldType.Text },
    { name: 'mappedLocally', type: FieldType.Boolean },
    { name: 'mappedRemotely', type: FieldType.Boolean },
    { name: 'localInstance',
      type: FieldType.NestedText,
      keys: ['productType','value'],
      showLabel: true,
      clickable: true,
      clickIdentifiers: [{id: ['id']}],
      clickUrl: { name: 'properties.rule.show' }
    }
  ],
  identifierKey: 'id',
  urlQueryParams: {integrationId: specificIntegrationId },
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'integrations.amazonProductTypes.edit',
  showUrlName: 'integrations.amazonProductTypes.edit',
  addDelete: false,
  addPagination: true,
});

export const listingQueryKey = 'amazonProductTypes';
export const listingQuery = amazonProductTypesQuery;
