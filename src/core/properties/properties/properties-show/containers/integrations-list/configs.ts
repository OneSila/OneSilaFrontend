import { FieldType } from "../../../../../../shared/utils/constants";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import { SearchConfig } from "../../../../../../shared/components/organisms/general-search/searchConfig";
import { remotePropertiesQuery } from "../../../../../../shared/api/queries/properties.js";

export const searchConfigConstructor = (_t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [],
  orders: [],
});

export const listingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [
    t('properties.integrations.labels.remoteName'),
    t('properties.integrations.labels.translatedRemoteName'),
    t('properties.integrations.labels.marketplace'),
    t('properties.integrations.labels.allowsUnmappedValues'),
  ],
  fields: [
    { name: 'remoteName', type: FieldType.Text },
    { name: 'translatedRemoteName', type: FieldType.Text },
    { name: 'marketplace', type: FieldType.NestedText, keys: ['name'] },
    { name: 'allowsUnmappedValues', type: FieldType.Boolean },
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: false,
  addShow: false,
  addDelete: false,
  addPagination: true,
});

export const listingQueryKey = 'remoteProperties';
export const listingQuery = remotePropertiesQuery;
