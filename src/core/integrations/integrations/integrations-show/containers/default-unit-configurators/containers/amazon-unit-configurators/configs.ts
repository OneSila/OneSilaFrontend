import { FieldType } from "../../../../../../../../shared/utils/constants";
import { amazonDefaultUnitConfiguratorsQuery, salesChannelViewsQuery } from "../../../../../../../../shared/api/queries/salesChannels.js";
import { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";

export const amazonDefaultUnitConfiguratorsSearchConfigConstructor = (t: Function, salesChannelId: string): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    { type: FieldType.Boolean, name: 'mappedLocally', label: t('integrations.show.mapping.mappedLocally'), strict: true },
    {
      type: FieldType.Query,
      name: 'marketplace',
      label: t('integrations.show.propertySelectValues.labels.marketplace'),
      labelBy: 'name',
      valueBy: 'id',
      query: salesChannelViewsQuery,
      dataKey: 'salesChannelViews',
      filterable: true,
      isEdge: true,
      addLookup: true,
      lookupKeys: ['id'],
      queryVariables: { filters: { salesChannel: { id: { exact: salesChannelId } } } }
    }
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
