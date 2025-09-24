import type { DocumentNode } from 'graphql';
import type { RouteLocationRaw, RouteLocationNormalizedLoaded } from 'vue-router';
import type { FormConfig, FormConfigDefaultTranslations, QueryFormField } from '../../../../../../../../shared/components/organisms/general-form/formConfig';
import type { Url } from '../../../../../../../../shared/utils/constants';

type Recommendation = { id: string; value: string };

export interface RemoteFieldConfig {
  key: string;
  labelKey: string;
  helpKey?: string;
  disabled?: boolean;
  includeInSubmit?: boolean;
}

export interface RemoteSelectValueEditPropertyContext {
  type: string;
  valueId: string;
  integrationId: string;
  salesChannelId: string;
  isWizard: boolean;
  propertyId: string | null;
  propertyName: string;
  marketplaceId: string | null;
  marketplaceName: string;
  localPropertyId: string | null;
  localPropertyName: string;
  form: Record<string, any>;
  routeQuery: RouteLocationNormalizedLoaded['query'];
}

export interface MapValueDataResult {
  form?: Record<string, any>;
  propertyId?: string | null;
  propertyName?: string;
  marketplaceId?: string | null;
  marketplaceName?: string;
  localInstanceId?: string | null;
}

export interface MapPropertyDataResult {
  mapped?: boolean;
  localPropertyId?: string | null;
  localPropertyName?: string;
}

export interface RemoteSelectValueEditPropertyConfig {
  createFormConfig: (args: { t: Function; ctx: RemoteSelectValueEditPropertyContext }) => FormConfig;
  getDefaultTranslations?: (t: Function) => FormConfigDefaultTranslations;
  formDefaults: (ctx: RemoteSelectValueEditPropertyContext) => Record<string, any>;
  propertyFieldKey: string;
  marketplaceFieldKey?: string;
  localInstanceFieldKey: string;
  valueQuery: DocumentNode;
  valueDataKey: string;
  valueQueryVariables?: (ctx: RemoteSelectValueEditPropertyContext) => Record<string, any>;
  mapValueData: (valueData: any, ctx: RemoteSelectValueEditPropertyContext) => MapValueDataResult;
  propertyLabelKey: string;
  propertyHelpKey?: string;
  propertyEditPath?: (ctx: RemoteSelectValueEditPropertyContext) => Url | null;
  integrationTitleKey: string;
  marketplaceLabelKey?: string;
  marketplaceHelpKey?: string;
  marketplaceEditPath?: (ctx: RemoteSelectValueEditPropertyContext) => Url | null;
  remoteFields: RemoteFieldConfig[];
  propertyQuery?: DocumentNode;
  propertyQueryDataKey?: string;
  propertyQueryVariables?: (ctx: RemoteSelectValueEditPropertyContext & { propertyId: string }) => Record<string, any>;
  mapPropertyData?: (propertyData: any, ctx: RemoteSelectValueEditPropertyContext) => MapPropertyDataResult;
  localPropertyLabelKey?: string;
  localPropertyHelpKey?: string;
  localPropertyEditPath?: (ctx: RemoteSelectValueEditPropertyContext) => Url | null;
  buildLocalInstanceField?: (args: { localPropertyId: string; t: Function; ctx: RemoteSelectValueEditPropertyContext }) => QueryFormField | null;
  notMappedBanner?: {
    titleKey: string;
    contentKey: string;
    linkPath: (ctx: RemoteSelectValueEditPropertyContext) => Url;
  };
  recommendations?: {
    mutation: DocumentNode;
    watchKeys: string[];
    getSearchValue: (form: any) => string;
    variables: (args: { localPropertyId: string; searchValue: string; ctx: RemoteSelectValueEditPropertyContext }) => Record<string, any>;
    mapResult: (data: any, currentId: string | null) => Recommendation[];
  };
  generateValuePath?: (ctx: RemoteSelectValueEditPropertyContext) => Url | null;
  listRoute: (ctx: RemoteSelectValueEditPropertyContext) => Url;
  wizard?: {
    query: DocumentNode;
    variables: (ctx: RemoteSelectValueEditPropertyContext) => Record<string, any>;
    extractEdges: (data: any) => Array<{ node: { id: string } }>;
  };
  wizardSubmitLabelKey?: string;
  localInstanceQueryParamName?: string;
}

export type { Recommendation };
