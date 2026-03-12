import { FieldType } from "../../../../../../../../shared/utils/constants";
import { miraklPropertySelectValuesQuery } from "../../../../../../../../shared/api/queries/salesChannels.js";
import type { ListingConfig } from "../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import type { SearchConfig } from "../../../../../../../../shared/components/organisms/general-search/searchConfig";

export const miraklPropertySelectValuesSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: 'sort',
  filters: [
    { type: FieldType.Boolean, name: 'mappedLocally', label: t('integrations.show.mapping.mappedLocally'), strict: true },
  ],
  orders: [],
});

export const miraklPropertySelectValuesListingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [
    t('integrations.show.propertySelectValues.labels.localizedValue'),
    t('integrations.show.propertySelectValues.labels.remoteProperty'),
    t('integrations.show.mapping.mappedLocally'),
    t('properties.values.title'),
  ],
  fields: [
    { name: 'label', type: FieldType.Text },
    { name: 'remoteProperty', type: FieldType.NestedText, keys: ['name'], showLabel: true },
    { name: 'mappedLocally', type: FieldType.Boolean },
    {
      name: 'localInstance',
      type: FieldType.NestedText,
      keys: ['value'],
      showLabel: true,
      clickable: true,
      clickIdentifiers: [{ id: ['id'] }],
      clickUrl: { name: 'properties.values.show' },
    },
  ],
  identifierKey: 'id',
  addActions: false,
  addEdit: false,
  addShow: false,
  addDelete: false,
  addPagination: true,
});

export const listingQueryKey = 'miraklPropertySelectValues';
export const listingQuery = miraklPropertySelectValuesQuery;
