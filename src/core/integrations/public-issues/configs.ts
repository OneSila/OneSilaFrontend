import { FieldType, Url } from "../../../shared/utils/constants";
import { ListingConfig } from "../../../shared/components/organisms/general-listing/listingConfig";
import { OrderType, SearchConfig } from "../../../shared/components/organisms/general-search/searchConfig";
import { FormConfig, FormType } from "../../../shared/components/organisms/general-form/formConfig";
import { publicIssueCategoriesQuery, publicIssuesQuery } from "../../../shared/api/queries/publicIssues.js";
import { createPublicIssueRequestMutation } from "../../../shared/api/mutations/publicIssues.js";
import { IntegrationTypes } from "../integrations/integrations";

export interface PublicIssueIntegrationType {
  id?: string | null;
  key?: string | null;
  type?: string | null;
  subtype?: string | null;
  name?: string | null;
}

export const publicIssueIntegrationTypes = [
  IntegrationTypes.Amazon,
  IntegrationTypes.Ebay,
  IntegrationTypes.Mirakl,
  IntegrationTypes.Shein,
  IntegrationTypes.Magento,
  IntegrationTypes.Shopify,
  IntegrationTypes.Woocommerce,
];

export const getIntegrationTypeOptions = (t: Function) => publicIssueIntegrationTypes.map((type) => ({
  label: t(`publicIssues.integrationTypes.${type}`),
  value: type,
}));

export const getPublicIssueIntegrationKey = (integrationType?: string | PublicIssueIntegrationType | null) => {
  if (!integrationType) {
    return '';
  }

  if (typeof integrationType === 'string') {
    return integrationType;
  }

  return integrationType.key || integrationType.subtype || integrationType.type || '';
};

export const getPublicIssueIntegrationLabel = (
  t: Function,
  integrationType?: string | PublicIssueIntegrationType | null,
) => {
  if (!integrationType) {
    return '';
  }

  if (typeof integrationType === 'object' && integrationType.name) {
    return integrationType.name;
  }

  const key = getPublicIssueIntegrationKey(integrationType);
  if (!key) {
    return '';
  }

  const translationKey = `publicIssues.integrationTypes.${key}`;
  const translated = t(translationKey);
  return translated === translationKey ? key : translated;
};

export const publicIssuesSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    {
      type: FieldType.Query,
      name: 'categories',
      label: t('publicIssues.filters.category'),
      labelBy: 'name',
      valueBy: 'code',
      query: publicIssueCategoriesQuery,
      dataKey: 'publicIssueCategories',
      isEdge: true,
      filterable: true,
      removable: true,
      addLookup: true,
      lookupKeys: ['code'],
      lookupType: 'exact',
    },
  ],
  orders: [
    { name: 'code', label: t('publicIssues.labels.code'), type: OrderType.ASC },
    { name: 'integrationType', label: t('publicIssues.labels.integrationType'), type: OrderType.ASC },
  ],
});

export const publicIssuesListingConfigConstructor = (t: Function, currentQuery: Record<string, any>): ListingConfig => ({
  headers: [
    t('publicIssues.labels.code'),
    t('publicIssues.labels.issue'),
  ],
  fields: [
    { name: 'code', type: FieldType.Text, shortenAfter: 20 },
    { name: 'issue', type: FieldType.Text, shortenAfter: 200 },
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: false,
  addShow: true,
  showClickableFieldNames: ['issue'],
  addDelete: false,
  addPagination: true,
  isMainPage: true,
  showUrlName: 'integrations.publicIssues.show',
  showRouteResolver: (item) => ({
    name: 'integrations.publicIssues.show',
    params: { id: item.node.id },
    query: {
      ...currentQuery,
      issue: currentQuery.issue || item.node.issue,
      integrationType: currentQuery.integrationType || getPublicIssueIntegrationKey(item.node.integrationType),
    },
  }),
});

export const publicIssueRequestFormConfigConstructor = (
  t: Function,
  defaults: Record<string, any>,
  submitUrl: Url,
): FormConfig => ({
  cols: 1,
  type: FormType.CREATE,
  mutation: createPublicIssueRequestMutation,
  mutationKey: 'createPublicIssueRequest',
  submitUrl,
  submitLabel: t('publicIssues.actions.sendIssue'),
  addSubmitAndContinue: false,
  addCancel: true,
  cancelUrl: submitUrl,
  submitSuccessCreate: t('publicIssues.alerts.requestSent'),
  haveCustomHelpSection: true,
  transformSubmitData: (cleanedData) => {
    const data = { ...cleanedData };

    if (!data.submissionId) {
      delete data.submissionId;
    }

    if (!data.productSku) {
      delete data.productSku;
    }

    if (defaults.publicIntegrationTypeId) {
      data.integrationType = { id: defaults.publicIntegrationTypeId };
    } else {
      delete data.integrationType;
    }

    if (defaults.publicIssueId) {
      data.publicIssue = { id: defaults.publicIssueId };
    }

    return data;
  },
  fields: [
    {
      type: FieldType.Hidden,
      name: 'issue',
      value: defaults.issue,
    },
    {
      type: FieldType.Hidden,
      name: 'integrationType',
      value: defaults.integrationType,
    },
    {
      type: FieldType.Hidden,
      name: 'submissionId',
      value: defaults.submissionId,
    },
    {
      type: FieldType.Hidden,
      name: 'productSku',
      value: defaults.productSku,
    },
    {
      type: FieldType.Textarea,
      name: 'description',
      label: t('publicIssues.labels.description'),
      placeholder: t('publicIssues.placeholders.description'),
      autogrow: true,
    },
  ],
});

export const publicIssuesListingQuery = publicIssuesQuery;
export const publicIssuesListingQueryKey = 'publicIssues';
