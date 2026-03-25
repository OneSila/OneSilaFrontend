import { FieldType } from "../../../../../../shared/utils/constants";
import {
  remoteLanguagesQuery,
  getRemoteLanguageQuery,
  miraklRemoteLanguagesQuery,
  getMiraklRemoteLanguageQuery,
} from "../../../../../../shared/api/queries/salesChannels.js";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import { Badge } from "../../../../../../shared/components/organisms/general-show/showConfig";
import { FormConfig, FormType } from '../../../../../../shared/components/organisms/general-form/formConfig';
import { companyLanguagesQuery } from "../../../../../../shared/api/queries/languages.js";
import { updateRemoteLanguageMutation, updateMiraklRemoteLanguageMutation } from "../../../../../../shared/api/mutations/salesChannels.js";
import { IntegrationTypes } from "../../../integrations";

export const languageEditFormConfigConstructor = (
  t: Function,
  type: string,
  languageId: string,
  integrationId: string
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: type === IntegrationTypes.Mirakl ? updateMiraklRemoteLanguageMutation : updateRemoteLanguageMutation,
  mutationKey: type === IntegrationTypes.Mirakl ? "updateMiraklRemoteLanguage" : "updateRemoteLanguage",
  query: type === IntegrationTypes.Mirakl ? getMiraklRemoteLanguageQuery : getRemoteLanguageQuery,
  queryVariables: { id: languageId },
  queryDataKey: type === IntegrationTypes.Mirakl ? "miraklRemoteLanguage" : "remoteLanguage",
  submitUrl: { name: 'integrations.integrations.show', params: { type: type, id: integrationId }, query: { tab: 'languages' } },
  fields: [
    {
      type: FieldType.Hidden,
      name: "id",
      value: languageId
    },
    {
      type: FieldType.Text,
      label: t('integrations.show.languages.labels.remoteCode'),
      name: 'remoteCode',
      disabled: true
    },
    {
      type: FieldType.Query,
      name: "localInstance",
      label: t("shared.placeholders.language"),
      labelBy: "name",
      valueBy: "code",
      query: companyLanguagesQuery,
      dataKey: "companyLanguages",
      isEdge: false,
      multiple: false,
      filterable: true,
    }
  ]
});

export const languagesSearchConfigConstructor = (t: Function) => ({
  search: true,
  orderKey: "sort",
  filters: [
  ],
  orders: []
});

export const languagesListingConfigConstructor = (
  t: Function,
  badgeMap: Record<string, Badge>,
  specificIntegrationId: string,
  type: string,
): ListingConfig => ({
  headers: [
   t(type === IntegrationTypes.Mirakl ? 'integrations.show.languages.labels.label' : 'integrations.show.languages.labels.remoteCode'),
   t('shared.labels.language'),
   ...(type === IntegrationTypes.Mirakl ? [t('shared.labels.default')] : []),
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'localInstance', type: FieldType.Badge, badgeMap: badgeMap },
    ...(type === IntegrationTypes.Mirakl ? [{ name: 'isDefault', type: FieldType.Boolean as const }] : []),
  ],
  identifierKey: 'id',
  urlQueryParams: {integrationId: specificIntegrationId },
  addActions: true,
  addEdit: type !== IntegrationTypes.Mirakl,
  addShow: type !== IntegrationTypes.Mirakl,
  editUrlName: 'integrations.languages.edit',
  showUrlName: 'integrations.languages.edit',
  addDelete: false,
  addPagination: true,
});

export const listingQueryConstructor = (type: string) =>
  type === IntegrationTypes.Mirakl ? miraklRemoteLanguagesQuery : remoteLanguagesQuery;

export const listingQueryKeyConstructor = (type: string) =>
  type === IntegrationTypes.Mirakl ? 'miraklRemoteLanguages' : 'remoteLanguages';
