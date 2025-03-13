import { FieldType } from "../../../../../../shared/utils/constants";
import { importProcessesQuery } from "../../../../../../shared/api/queries/salesChannels.js";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import {SearchConfig} from "../../../../../../shared/components/organisms/general-search/searchConfig";

export const getStatusBadgeMap = (t: Function) => ({
  failed: { text: t('shared.labels.failed'), color: 'red' },
  completed: { text: t('shared.labels.completed'), color: 'green' },
  processing: { text: t('shared.labels.processing'), color: 'yellow' },
});


export const importsSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    {
      type: FieldType.Choice,
      name: 'status',
      label: t('integrations.imports.labels.status'),
      labelBy: 'text',
      valueBy: 'id',
      options: [
        { id: 'failed', text: t('integrations.imports.status.failed') },
        { id: 'processing', text: t('integrations.imports.status.processing') },
        { id: 'success', text: t('integrations.imports.status.success') },
      ]
    }
  ],
  orders: []
});

export const importsListingConfigConstructor = (t: Function, salesChannelId: string): ListingConfig => ({
  headers: [
    t('shared.labels.createdAt'),
    t('shared.labels.status'),
  ],
  fields: [
    { name: 'createdAt', type: FieldType.Date },
    { name: 'status', type: FieldType.Badge, badgeMap: getStatusBadgeMap(t) },
  ],
  identifierKey: 'id',
  identifierVariables: { salesChannelId },
  addActions: false,
  addEdit: false,
  addShow: false,
  addDelete: false,
  addPagination: true,
});

export const listingQueryKey = 'importProcesses';
export const listingQuery = importProcessesQuery;
