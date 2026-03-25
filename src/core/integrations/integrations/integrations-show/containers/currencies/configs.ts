import { FieldType } from "../../../../../../shared/utils/constants";
import {
  getRemoteCurrencyQuery,
  remoteCurrenciesQuery,
  miraklRemoteCurrenciesQuery,
  getMiraklRemoteCurrencyQuery,
} from "../../../../../../shared/api/queries/salesChannels.js";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import {FormConfig, FormType} from '../../../../../../shared/components/organisms/general-form/formConfig';
import {currenciesQuerySelector} from "../../../../../../shared/api/queries/currencies.js";
import {currencyOnTheFlyConfig} from "../../../../../settings/currencies/configs";
import {updateRemoteCurrencyMutation, updateMiraklRemoteCurrencyMutation} from "../../../../../../shared/api/mutations/salesChannels.js";
import {SearchConfig} from "../../../../../../shared/components/organisms/general-search/searchConfig";
import { IntegrationTypes } from "../../../integrations";

export const currencyEditFormConfigConstructor = (
  t: Function,
  type: string,
  currencyId: string,
  integrationId: string
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: type === IntegrationTypes.Mirakl ? updateMiraklRemoteCurrencyMutation : updateRemoteCurrencyMutation,
  mutationKey: type === IntegrationTypes.Mirakl ? "updateMiraklRemoteCurrency" : "updateRemoteCurrency",
  query: type === IntegrationTypes.Mirakl ? getMiraklRemoteCurrencyQuery : getRemoteCurrencyQuery,
  queryVariables: { id: currencyId },
  queryDataKey: type === IntegrationTypes.Mirakl ? "miraklRemoteCurrency" : "remoteCurrency",
  submitUrl: { name: 'integrations.integrations.show', params: { type: type, id: integrationId }, query: { tab: 'currencies' } },
  fields: [
    {
      type: FieldType.Hidden,
      name: "id",
      value: currencyId
    },
    {
      type: FieldType.Text,
      label: t('integrations.show.currencies.labels.remoteCode'),
      name: 'remoteCode',
      disabled: true
    },
    {
      type: FieldType.Query,
      name: 'localInstance',
      label: t("shared.labels.currency"),
      labelBy: "isoCode",
      valueBy: "id",
      query: currenciesQuerySelector,
      dataKey: "currencies",
      isEdge: true,
      multiple: false,
      filterable: true,
      removable: true,
      optional: true,
      formMapIdentifier: "id",
      createOnFlyConfig: currencyOnTheFlyConfig(t)
    }
  ]
});

export const currenciesSearchConfigConstructor = (t: Function): SearchConfig => ({
  search: true,
  orderKey: "sort",
  filters: [
    {
      type: FieldType.Text,
      name: 'remoteCode',
      label: t('currencies.labels.remoteCode')
    }
  ],
  orders: []
});

export const currenciesListingConfigConstructor = (t: Function, specificIntegrationId: string, type: string): ListingConfig => ({
  headers: [
    t(type === IntegrationTypes.Mirakl ? 'integrations.show.currencies.labels.label' : 'integrations.show.currencies.labels.remoteCode'),
    t('shared.labels.currency'),
    ...(type === IntegrationTypes.Mirakl ? [t('shared.labels.default')] : []),
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    {
      name: 'localInstance',
      type: FieldType.NestedText,
      label: t('currencies.labels.localCurrency'),
      keys: ['name'],
      showLabel: true
    },
    ...(type === IntegrationTypes.Mirakl ? [{ name: 'isDefault', type: FieldType.Boolean as const }] : []),
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: type !== IntegrationTypes.Mirakl,
  urlQueryParams: {integrationId: specificIntegrationId },
  editUrlName: 'integrations.currencies.edit',
  showUrlName: 'integrations.currencies.edit',
  addShow: type !== IntegrationTypes.Mirakl,
  addDelete: false,
  addPagination: true,
});


export const listingQueryKeyConstructor = (type: string) =>
  type === IntegrationTypes.Mirakl ? 'miraklRemoteCurrencies' : 'remoteCurrencies';

export const listingQueryConstructor = (type: string) =>
  type === IntegrationTypes.Mirakl ? miraklRemoteCurrenciesQuery : remoteCurrenciesQuery;
