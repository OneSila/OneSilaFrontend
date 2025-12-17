import { FieldType } from "../../../../../../shared/utils/constants";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import { SearchConfig } from "../../../../../../shared/components/organisms/general-search/searchConfig";
import { buildAmazonIssueLastFetchedAtBadge } from "./utils";

const getSeverityBadgeMap = (t: Function) => ({
  ERROR: { text: t('integrations.show.amazonIssues.severity.error'), color: 'red' },
  WARNING: { text: t('integrations.show.amazonIssues.severity.warning'), color: 'yellow' },
});

const getEnforcementActionLabel = (t: Function, value: string) => {
  const key = `integrations.show.amazonIssues.enforcementActions.${value}`;
  const translated = t(key);
  return translated === key ? value : translated;
};

export const amazonProductIssuesSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    {
      type: FieldType.Boolean,
      name: 'isValidationIssue',
      label: t('integrations.show.amazonIssues.filters.isValidationIssue'),
      strict: true,
      lookupType: 'exact',
    },
    {
      type: FieldType.Boolean,
      name: 'isSuppressed',
      label: t('integrations.show.amazonIssues.filters.isSuppressed'),
      strict: true,
      lookupType: 'exact',
    },
    {
      type: FieldType.Choice,
      name: 'category',
      label: t('integrations.show.amazonIssues.filters.categories'),
      options: [
        { label: t('integrations.show.amazonIssues.categories.MISSING_ATTRIBUTE'), value: 'MISSING_ATTRIBUTE' },
        { label: t('integrations.show.amazonIssues.categories.INVALID_ATTRIBUTE'), value: 'INVALID_ATTRIBUTE' },
        { label: t('integrations.show.amazonIssues.categories.INVALID_IMAGE'), value: 'INVALID_IMAGE' },
        { label: t('integrations.show.amazonIssues.categories.MISSING_IMAGE'), value: 'MISSING_IMAGE' },
        { label: t('integrations.show.amazonIssues.categories.QUALIFICATION_REQUIRED'), value: 'QUALIFICATION_REQUIRED' },
        { label: t('integrations.show.amazonIssues.categories.INVALID_PRICE'), value: 'INVALID_PRICE' },
        { label: t('integrations.show.amazonIssues.categories.DUPLICATE'), value: 'DUPLICATE' },
      ],
      labelBy: 'label',
      valueBy: 'value',
      multiple: false,
      filterable: true,
      removable: true,
    },
    {
      type: FieldType.Choice,
      name: 'severity',
      label: t('integrations.show.amazonIssues.filters.severity'),
      options: [
        { label: t('integrations.show.amazonIssues.severity.error'), value: 'ERROR' },
        { label: t('integrations.show.amazonIssues.severity.warning'), value: 'WARNING' },
      ],
      labelBy: 'label',
      valueBy: 'value',
      multiple: false,
      filterable: false,
      removable: true,
      addLookup: true
    },
    {
      type: FieldType.Choice,
      name: 'enforcementAction',
      label: t('integrations.show.amazonIssues.filters.suppressReasons'),
      options: [
        { label: t('integrations.show.amazonIssues.enforcementActions.CATALOG_ITEM_REMOVED'), value: 'CATALOG_ITEM_REMOVED' },
        { label: t('integrations.show.amazonIssues.enforcementActions.SEARCH_SUPPRESSED'), value: 'SEARCH_SUPPRESSED' },
        { label: t('integrations.show.amazonIssues.enforcementActions.LISTING_SUPPRESSED'), value: 'LISTING_SUPPRESSED' },
        { label: t('integrations.show.amazonIssues.enforcementActions.ATTRIBUTE_SUPPRESSED'), value: 'ATTRIBUTE_SUPPRESSED' },
      ],
      labelBy: 'label',
      valueBy: 'value',
      multiple: false,
      filterable: true,
      removable: true,
    },
    {
      type: FieldType.Choice,
      name: 'enforcementExemptionStatus',
      label: t('integrations.show.amazonIssues.filters.enforcementExemptionStatus'),
      options: [
        { label: t('integrations.show.amazonIssues.enforcementExemptionStatus.EXEMPT'), value: 'EXEMPT' },
        { label: t('integrations.show.amazonIssues.enforcementExemptionStatus.EXEMPT_UNTIL_EXPIRY_DATE'), value: 'EXEMPT_UNTIL_EXPIRY_DATE' },
        { label: t('integrations.show.amazonIssues.enforcementExemptionStatus.NOT_EXEMPT'), value: 'NOT_EXEMPT' },
      ],
      labelBy: 'label',
      valueBy: 'value',
      removable: true,
      addLookup: true,
      lookupType: 'exact',
    },
    {
      type: FieldType.Date,
      name: 'enforcementExemptionExpiryDate',
      label: t('integrations.show.amazonIssues.filters.enforcementExemptionExpiryDate'),
      addLookup: true,
      lookupType: 'date',
    },
  ],
  orders: [],
});

export const amazonProductIssuesListingConfigConstructor = (
  t: Function,
  type: string,
  integrationId: string,
): ListingConfig => ({
  headers: [
    t('integrations.show.amazonIssues.columns.code'),
    t('integrations.show.amazonIssues.columns.product'),
    t('integrations.show.amazonIssues.columns.marketplace'),
    t('integrations.show.amazonIssues.columns.lastFetchedAt'),
    t('integrations.show.amazonIssues.columns.severity'),
    t('integrations.show.amazonIssues.columns.suppressReasons'),
    t('integrations.show.amazonIssues.columns.isValidationIssue'),
    t('integrations.show.amazonIssues.columns.isSuppressed'),
  ],
  fields: [
    { name: 'code', type: FieldType.Text },
    {
      name: 'remoteProduct',
      type: FieldType.NestedText,
      keys: ['localInstance', 'name'],
      clickable: true,
      clickUrl: { name: 'products.products.show' },
      clickIdentifiers: [{ id: ['localInstance', 'id'] }],
    },
    { name: 'view', type: FieldType.NestedText, keys: ['apiRegionCode'] },
    {
      name: 'createdAt',
      type: FieldType.Badge,
      badgeMap: {},
      accessor: (node) => buildAmazonIssueLastFetchedAtBadge(t, node.createdAt),
    },
    { name: 'severity', type: FieldType.Badge, badgeMap: getSeverityBadgeMap(t) },
    {
      name: 'enforcementActions',
      type: FieldType.InlineItems,
      color: 'purple',
      accessor: (node) => (node.enforcementActions ?? []).map((v) => getEnforcementActionLabel(t, v)),
    },
    { name: 'isValidationIssue', type: FieldType.Boolean },
    { name: 'isSuppressed', type: FieldType.Boolean },
  ],
  identifierVariables: { type },
  identifierKey: 'id',
  paramIdentifier: 'issueId',
  urlQueryParams: { integrationId },
  addActions: false,
  addEdit: false,
  addShow: true,
  showUrlName: 'integrations.amazonProductIssues.show',
  addDelete: false,
  addPagination: true,
});
