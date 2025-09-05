import { FieldType } from "../../../../../../../../../shared/utils/constants";
import { amazonImportBrokenRecordsQuery } from "../../../../../../../../../shared/api/queries/salesChannels.js";
import { ListingConfig } from "../../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import { SearchConfig } from "../../../../../../../../../shared/components/organisms/general-search/searchConfig";

const getCodeBadgeMap = (t: Function) => ({
  BROKEN_IMPORT_PROCESS: { color: 'red', text: t('integrations.imports.brokenRecords.codes.BROKEN_IMPORT_PROCESS') },
  MISSING_DATA: { color: 'orange', text: t('integrations.imports.brokenRecords.codes.MISSING_DATA') },
  NO_MAPPED_PRODUCT_TYPE: { color: 'orange', text: t('integrations.imports.brokenRecords.codes.NO_MAPPED_PRODUCT_TYPE') },
  PRODUCT_TYPE_MISMATCH: { color: 'orange', text: t('integrations.imports.brokenRecords.codes.PRODUCT_TYPE_MISMATCH') },
  UPDATE_ONLY_NOT_FOUND: { color: 'orange', text: t('integrations.imports.brokenRecords.codes.UPDATE_ONLY_NOT_FOUND') },
  NAME_TOO_LONG: { color: 'orange', text: t('integrations.imports.brokenRecords.codes.NAME_TOO_LONG') },
});

export const searchConfigConstructor = (t: Function): SearchConfig => ({
  search: false,
  filters: [
    {
      type: FieldType.Choice,
      name: 'code',
      label: t('shared.labels.code'),
      options: [
        { label: t('integrations.imports.brokenRecords.codes.BROKEN_IMPORT_PROCESS'), value: 'BROKEN_IMPORT_PROCESS' },
        { label: t('integrations.imports.brokenRecords.codes.MISSING_DATA'), value: 'MISSING_DATA' },
        { label: t('integrations.imports.brokenRecords.codes.NO_MAPPED_PRODUCT_TYPE'), value: 'NO_MAPPED_PRODUCT_TYPE' },
        { label: t('integrations.imports.brokenRecords.codes.PRODUCT_TYPE_MISMATCH'), value: 'PRODUCT_TYPE_MISMATCH' },
        { label: t('integrations.imports.brokenRecords.codes.UPDATE_ONLY_NOT_FOUND'), value: 'UPDATE_ONLY_NOT_FOUND' },
        { label: t('integrations.imports.brokenRecords.codes.NAME_TOO_LONG'), value: 'NAME_TOO_LONG' },
      ],
      labelBy: 'label',
      valueBy: 'value',
    },
  ],
  orders: [],
});

export const listingConfigConstructor = (t: Function): ListingConfig => ({
  headers: [
    t('shared.labels.createdAt'),
    t('shared.labels.code'),
    t('shared.labels.message'),
  ],
  fields: [
    { name: 'createdAt', type: FieldType.Date },
    { name: 'record.code', type: FieldType.Badge, badgeMap: getCodeBadgeMap(t), accessor: (node) => node.record.code },
    { name: 'record.message', type: FieldType.Text, accessor: (node) => node.record.message },
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: false,
  addShow: false,
  addDelete: false,
  addPagination: true,
});

export const listingQuery = amazonImportBrokenRecordsQuery;
export const listingQueryKey = 'amazonImportBrokenRecords';
