import {FieldType} from "../../../../../../shared/utils/constants";
import { remoteLanguagesQuery, getRemoteLanguageQuery } from "../../../../../../shared/api/queries/salesChannels.js";
import {ListingConfig} from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import {Badge} from "../../../../../../shared/components/organisms/general-show/showConfig";
import {FormConfig, FormType} from '../../../../../../shared/components/organisms/general-form/formConfig';
import {languagesQuery} from "../../../../../../shared/api/queries/languages";
import {updateRemoteLanguageMutation} from "../../../../../../shared/api/mutations/salesChannels.js";

export const languageEditFormConfigConstructor = (
  t: Function,
  type: string,
  languageId: string,
  integrationId: string
): FormConfig => ({
  cols: 1,
  type: FormType.EDIT,
  mutation: updateRemoteLanguageMutation,
  mutationKey: "updateRemoteLanguage",
  query: getRemoteLanguageQuery,
  queryVariables: { id: languageId },
  queryDataKey: "remoteLanguage",
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
      query: languagesQuery,
      dataKey: "languages",
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

export const languagesListingConfigConstructor = (t: Function, badgeMap: Record<string, Badge>, specificIntegrationId): ListingConfig => ({
  headers: [
   t('integrations.show.languages.labels.remoteCode'),
   t('shared.labels.language'),
  ],
  fields: [
    { name: 'name', type: FieldType.Text },
    { name: 'localInstance', type: FieldType.Badge, badgeMap: badgeMap },
  ],
  identifierKey: 'id',
  urlQueryParams: {integrationId: specificIntegrationId },
  addActions: true,
  addEdit: true,
  addShow: true,
  editUrlName: 'integrations.languages.edit',
  showUrlName: 'integrations.languages.edit',
  addDelete: false,
  addPagination: true,
});

export const languagesListingQueryKey = 'remoteLanguages';
export const languagesListingQuery = remoteLanguagesQuery;
