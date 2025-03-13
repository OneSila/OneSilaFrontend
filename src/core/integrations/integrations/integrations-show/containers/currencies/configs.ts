import { FieldType } from "../../../../../../shared/utils/constants";
import {getRemoteCurrencyQuery, remoteCurrenciesQuery} from "../../../../../../shared/api/queries/salesChannels.js";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import {FormConfig, FormType} from '../../../../../../shared/components/organisms/general-form/formConfig';
import {currenciesQuery} from "../../../../../../shared/api/queries/currencies";
import {currencyOnTheFlyConfig} from "../../../../../settings/currencies/configs";
import {updateRemoteCurrencyMutation} from "../../../../../../shared/api/mutations/salesChannels";
import {SearchConfig} from "../../../../../../shared/components/organisms/general-search/searchConfig";

export const currencyEditFormConfigConstructor = (
  t: Function,
  type: string,
  currencyId: string,
  integrationId: string
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updateRemoteCurrencyMutation,
  mutationKey: "updateRemoteCurrency",
  query: getRemoteCurrencyQuery,
  queryVariables: { id: currencyId },
  queryDataKey: "remoteCurrency",
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
      query: currenciesQuery,
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

export const currenciesListingConfigConstructor = (t: Function, specificIntegrationId): ListingConfig => ({
  headers: [
    t('integrations.show.currencies.labels.remoteCode'),
    t('shared.labels.currency'),
  ],
  fields: [
    { name: 'remoteCode', type: FieldType.Text },
    {
      name: 'localInstance',
      type: FieldType.NestedText,
      label: t('currencies.labels.localCurrency'),
      keys: ['name'],
      showLabel: true
    }
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  urlQueryParams: {integrationId: specificIntegrationId },
  editUrlName: 'integrations.currencies.edit',
  showUrlName: 'integrations.currencies.edit',
  addShow: true,
  addDelete: false,
  addPagination: true,
});


export const listingQueryKey = 'remoteCurrencies';
export const listingQuery = remoteCurrenciesQuery;
