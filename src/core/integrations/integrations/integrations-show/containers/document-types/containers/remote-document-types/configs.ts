import { FieldType } from '../../../../../../../../shared/utils/constants';
import { documentTypesQuerySelector } from '../../../../../../../../shared/api/queries/documentTypes.js';
import { remoteDocumentTypesQuery } from '../../../../../../../../shared/api/queries/salesChannels.js';
import { ListingConfig } from '../../../../../../../../shared/components/organisms/general-listing/listingConfig';
import { SearchConfig } from '../../../../../../../../shared/components/organisms/general-search/searchConfig';

export const remoteDocumentTypesSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: 'sort',
  filters: [
    {
      type: FieldType.Query,
      name: 'localInstance',
      label: t('integrations.show.documentTypes.labels.localInstance'),
      labelBy: 'name',
      valueBy: 'id',
      query: documentTypesQuerySelector,
      dataKey: 'documentTypes',
      filterable: true,
      isEdge: true,
      addLookup: true,
      lookupKeys: ['id'],
    },
  ],
  orders: [],
});

export const remoteDocumentTypesListingConfigConstructor = (
  t: Function,
  specificIntegrationId: string,
  salesChannelId: string,
): ListingConfig => ({
  headers: [
    t('shared.labels.name'),
    t('integrations.show.documentTypes.labels.translatedName'),
    t('integrations.show.documentTypes.labels.localInstance'),
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'translatedName', type: FieldType.Text },
    {
      name: 'localInstance',
      type: FieldType.NestedText,
      keys: ['name'],
      showLabel: true,
      clickable: true,
      clickIdentifiers: [{ id: ['id'] }],
      clickUrl: { name: 'settings.documentType.edit' },
    },
  ],
  identifierKey: 'id',
  urlQueryParams: { integrationId: specificIntegrationId, salesChannelId },
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'integrations.remoteDocumentTypes.edit',
  showUrlName: 'integrations.remoteDocumentTypes.edit',
  addDelete: false,
  addPagination: true,
});

export const listingQueryKey = 'remoteDocumentTypes';
export const listingQuery = remoteDocumentTypesQuery;
