import type { DocumentNode } from 'graphql';
import type { RouteLocationRaw } from 'vue-router';

export type NormalizedSuggestion = {
  code: string;
  displayName: string;
  secondary?: string;
  raw: Record<string, any>;
};

export type ImportedRemoteProductTypeConfig<
  TState extends Record<string, any> = Record<string, any>,
> = {
  integrationType: string;
  listingQuery: DocumentNode;
  listingQueryKey: string;
  suggestMutation: DocumentNode;
  getSuggestionVariables: (params: { name: string | null; marketplace: string }) => Record<string, any>;
  mapSuggestions: (data: Record<string, any>, state: TState) => NormalizedSuggestion[];
  createState: () => TState;
  buildSaveInput: (params: {
    productTypeId: string;
    selectedSuggestion: NormalizedSuggestion | null;
    selectedCode: string;
    selectedName: string;
    state: TState;
  }) => { mutation: DocumentNode; variables: Record<string, any> } | null;
  getIntegrationTitle: (t: (key: string, ...args: any[]) => string, type: string) => string;
  editRouteName: string;
};

export type AdditionalButtonConfig = {
  route: RouteLocationRaw;
  labelKey: string;
};

export type MappedRemoteProductTypeConfig<
  TState extends Record<string, any> = Record<string, any>,
> = {
  integrationType: string;
  listingQuery: DocumentNode;
  listingQueryKey: string;
  productTypeQueryDataKey: string;
  getIntegrationTitle: (t: (key: string, ...args: any[]) => string, type: string) => string;
  editRouteName: string;
  createState: () => TState;
  extractItems: (data: any, state: TState) => any[];
  getItemName: (item: any, state: TState) => string;
  getItemCode?: (item: any, state: TState) => string;
  isItemMappedLocally: (item: any, state: TState) => boolean;
  getPropertyRoute?: (
    item: any,
    context: { type: string; integrationId: string; salesChannelId: string },
    state: TState,
  ) => RouteLocationRaw | null;
  shouldShowAdditionalButton?: (context: { state: TState }) => boolean;
  getAdditionalButtonConfig?: (context: {
    productTypeId: string;
    integrationId: string;
    salesChannelId: string;
    isWizard: boolean;
    formData: Record<string, any>;
    state: TState;
  }) => AdditionalButtonConfig | null;
};
