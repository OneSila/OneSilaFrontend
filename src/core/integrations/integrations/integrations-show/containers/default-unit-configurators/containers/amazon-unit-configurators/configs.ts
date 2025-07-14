import { FieldType } from "../../../../../../../../shared/utils/constants";
import { amazonDefaultUnitConfiguratorsQuery, getAmazonDefaultUnitConfiguratorQuery, salesChannelViewsQuery } from "../../../../../../../../shared/api/queries/salesChannels.js";
import { updateAmazonDefaultUnitConfiguratorMutation } from "../../../../../../../../shared/api/mutations/salesChannels.js";
import { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import { FormConfig, FormType } from '../../../../../../../../shared/components/organisms/general-form/formConfig';
import { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";

export const amazonDefaultUnitConfiguratorEditFormConfigConstructor = (
  t: Function,
  type: string,
  configuratorId: string,
  integrationId: string,
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updateAmazonDefaultUnitConfiguratorMutation,
  mutationKey: "updateAmazonDefaultUnitConfigurator",
  query: getAmazonDefaultUnitConfiguratorQuery,
  queryVariables: { id: configuratorId },
  queryDataKey: "amazonDefaultUnitConfigurator",
  submitUrl: { name: 'integrations.integrations.show', params: { type: type, id: integrationId }, query: { tab: 'defaultUnits' } },
  fields: [
    { type: FieldType.Hidden, name: 'id', value: configuratorId },
    { type: FieldType.Text, name: 'name', label: t('shared.labels.name'), disabled: true },
    { type: FieldType.Text, name: 'code', label: t('integrations.show.properties.labels.code'), disabled: true },
    { type: FieldType.Text, name: 'marketplace', label: t('integrations.show.propertySelectValues.labels.marketplace'), disabled: true },
    { type: FieldType.Choice, name: 'selectedUnit', label: t('shared.labels.unit'), labelBy: 'name', valueBy: 'value', options: [], removable: false }
  ]
});

export const amazonDefaultUnitConfiguratorsSearchConfigConstructor = (t: Function, salesChannelId: string): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    { type: FieldType.Boolean, name: 'mappedRemotely', label: t('integrations.show.mapping.mappedRemotely'), strict: true },
    { type: FieldType.Query, name: 'marketplace', label: t('integrations.show.propertySelectValues.labels.marketplace'), labelBy: 'name', valueBy: 'id', query: salesChannelViewsQuery, dataKey: 'salesChannelViews', filterable: true, isEdge: true, addLookup: true, lookupKeys: ['id'], queryVariables: { filters: { salesChannel: { id: { exact: salesChannelId } } } } }
  ],
  orders: []
});

export const amazonDefaultUnitConfiguratorsListingConfigConstructor = (t: Function, specificIntegrationId): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('integrations.show.properties.labels.code'),
    t('integrations.show.propertySelectValues.labels.marketplace'),
    t('shared.labels.unit')
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'code', type: FieldType.Text },
    { name: 'marketplace', type: FieldType.NestedText, keys: ['name'], showLabel: true },
    { name: 'selectedUnit', type: FieldType.Text }
  ],
  identifierKey: 'id',
  urlQueryParams: {integrationId: specificIntegrationId },
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'integrations.amazonDefaultUnitConfigurators.edit',
  showUrlName: 'integrations.amazonDefaultUnitConfigurators.edit',
  addDelete: false,
  addPagination: true,
});

export const listingQueryKey = 'amazonDefaultUnitConfigurators';
export const listingQuery = amazonDefaultUnitConfiguratorsQuery;
