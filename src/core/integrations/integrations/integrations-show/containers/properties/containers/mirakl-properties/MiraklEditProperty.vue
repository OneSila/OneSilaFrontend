<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import RemotePropertyEdit from "../remote-properties/components/RemotePropertyEdit.vue";
import { miraklPropertyEditFormConfigConstructor, miraklPropertiesSearchConfigConstructor } from "./configs";
import { FieldType, PropertyTypes } from "../../../../../../../../shared/utils/constants";
import { getPropertyQuery, propertiesQuerySelector } from "../../../../../../../../shared/api/queries/properties.js";
import apolloClient from "../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../shared/modules/toast";
import { miraklPropertiesQuery, miraklRemoteLanguagesQuery } from "../../../../../../../../shared/api/queries/salesChannels";
import type { FormConfig } from "../../../../../../../../shared/components/organisms/general-form/formConfig";
import { Link } from "../../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../../shared/components/atoms/button";
import { Label } from "../../../../../../../../shared/components/atoms/label";
import { checkPropertyForDuplicatesMutation } from "../../../../../../../../shared/api/mutations/properties.js";
import debounce from 'lodash.debounce';
import { buildFilterVariablesFromRouteQuery, extractPrefixedQueryParams } from '../../../../../../../../shared/components/molecules/filter-manager/filterQueryUtils';
import { getTypeCompatibility } from '../../../../../../../../shared/utils/propertyTypeCompatibility';
import {
  getMiraklRepresentationTypeOptions,
  getMiraklRepresentationTypeGroup,
  usesMiraklBooleanCurrentType,
  usesMiraklDefaultValueInput,
  usesMiraklLanguageSelection,
  usesMiraklLocalPropertyMapping,
} from './representationTypes';

const miraklRepresentationImages = import.meta.glob(
  '../../../../../../../../assets/images/integrations/mirakl/representation-types/*.png',
  { eager: true, import: 'default' },
) as Record<string, string>;

const miraklRepresentationTypesWithoutImage = new Set([
  'product_internal_id',
  'product_configurable_id',
]);

const { t, te } = useI18n();
const router = useRouter();
const route = useRoute();

const miraklPropertyId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId?.toString() || '';
const salesChannelId = route.query.salesChannelId?.toString() || '';
const isWizard = route.query.wizard === '1';
const propertyId = route.query.propertyId?.toString() || null;
const returnTab = route.query.fromTab?.toString() || 'properties';

const formConfig = ref<FormConfig | null>(null);
const formData = ref<Record<string, any>>({});
const propertyMetadata = ref<Record<string, any> | null>(null);
const propertyType = ref<string | null>(null);
const representationType = ref<string | null>(null);
const originalType = ref<string | null>(null);
const initialCurrentType = ref<string | null>(null);
const originalAllowsUnmappedValues = ref<boolean | null>(null);
const localPropertyType = ref<string | null>(null);
const localTypeCache = new Map<string, string>();
const hasInitializedLocalInstance = ref(false);
const recommendations = ref<{ id: string; name: string }[]>([]);
const loadingRecommendations = ref(false);

const typeLabelKeyMap: Record<string, string> = {
  [PropertyTypes.INT]: 'properties.properties.types.int',
  [PropertyTypes.FLOAT]: 'properties.properties.types.float',
  [PropertyTypes.TEXT]: 'properties.properties.types.text',
  [PropertyTypes.DESCRIPTION]: 'properties.properties.types.description',
  [PropertyTypes.BOOLEAN]: 'properties.properties.types.boolean',
  [PropertyTypes.DATE]: 'properties.properties.types.date',
  [PropertyTypes.DATETIME]: 'properties.properties.types.datetime',
  [PropertyTypes.SELECT]: 'properties.properties.types.select',
  [PropertyTypes.MULTISELECT]: 'properties.properties.types.multiselect',
};

const getTypeLabel = (value?: string | null) => {
  if (!value) {
    return '';
  }
  const key = typeLabelKeyMap[value];
  return key ? t(key) : value;
};

const originalTypeLabel = computed(() => getTypeLabel(originalType.value));
const mappedTypeLabel = computed(() => getTypeLabel(localPropertyType.value));
const typeMismatch = computed(() =>
  Boolean(originalType.value && localPropertyType.value && originalType.value !== localPropertyType.value),
);

const typeCompatibility = computed(() => {
  if (!originalType.value || !localPropertyType.value) {
    return null;
  }
  return getTypeCompatibility({
    originalType: originalType.value,
    allowsUnmappedValues: originalAllowsUnmappedValues.value,
    localType: localPropertyType.value,
  });
});

const typeCompatibilityWarnings = computed(() =>
  (typeCompatibility.value?.warnings || []).map((warningKey) => t(warningKey)),
);

const showTypeDisclaimer = computed(() => Boolean(typeMismatch.value && typeCompatibility.value));
const typeCompatibilityIsCompatible = computed(() => Boolean(typeCompatibility.value?.compatible));

const typeCompatibilitySummary = computed(() =>
  t('integrations.show.mapping.typeCompatibility.summary', {
    originalType: originalTypeLabel.value,
    mappedType: mappedTypeLabel.value,
  }),
);

const typeCompatibilityStatus = computed(() => {
  if (!typeCompatibility.value) {
    return '';
  }
  return typeCompatibility.value.compatible
    ? t('integrations.show.mapping.typeCompatibility.compatibleDetail')
    : t('integrations.show.mapping.typeCompatibility.incompatibleDetail');
});

const isSelectPropertyType = (value?: string | null) =>
  value === PropertyTypes.SELECT || value === PropertyTypes.MULTISELECT;

const currentRepresentationType = computed(() =>
  formData.value.representationType || representationType.value || propertyMetadata.value?.representationType || null,
);
const isRepresentationTypeDecided = computed(() => Boolean(propertyMetadata.value?.representationTypeDecided));
const usesLocalPropertyMapping = computed(() =>
  isRepresentationTypeDecided.value || usesMiraklLocalPropertyMapping(currentRepresentationType.value),
);
const usesDefaultValueInput = computed(() =>
  !isRepresentationTypeDecided.value && usesMiraklDefaultValueInput(currentRepresentationType.value),
);
const showLanguageField = computed(() =>
  !isRepresentationTypeDecided.value && usesMiraklLanguageSelection(currentRepresentationType.value),
);
const canSeeValues = computed(() => usesLocalPropertyMapping.value && isSelectPropertyType(propertyType.value));
const showRepresentationGuide = computed(() => !isRepresentationTypeDecided.value);
const representationTypeLabel = computed(() =>
  currentRepresentationType.value
    ? t(`integrations.show.mirakl.representationTypes.options.${currentRepresentationType.value}`)
    : t('integrations.show.mirakl.representationGuide.empty.title'),
);
const representationTypeGroup = computed(() => getMiraklRepresentationTypeGroup(currentRepresentationType.value));
const representationGuideImage = computed(() => {
  const currentType = currentRepresentationType.value;

  if (!currentType || miraklRepresentationTypesWithoutImage.has(currentType)) {
    return null;
  }

  const match = Object.entries(miraklRepresentationImages).find(([path]) =>
    path.endsWith(`/${currentType}.png`),
  );

  return match?.[1] || null;
});
const labelTranslations = computed(() => normalizeTranslations(propertyMetadata.value?.labelTranslations));
const descriptionTranslations = computed(() => normalizeTranslations(propertyMetadata.value?.descriptionTranslations));
const representationGuide = computed(() => {
  const currentType = currentRepresentationType.value;
  if (!currentType) {
    return {
      title: t('integrations.show.mirakl.representationGuide.empty.title'),
      description: t('integrations.show.mirakl.representationGuide.empty.description'),
      summary: t('integrations.show.mirakl.representationGuide.empty.summary'),
      source: t('integrations.show.mirakl.representationGuide.empty.source'),
      fill: t('integrations.show.mirakl.representationGuide.empty.fill'),
      badge: t('integrations.show.mirakl.representationGuide.badges.special'),
    };
  }

  if (usesLocalPropertyMapping.value) {
    return {
      title: representationTypeLabel.value,
      description: t('integrations.show.mirakl.representationGuide.special.property.description'),
      summary: t('integrations.show.mirakl.representationGuide.special.property.summary'),
      source: t('integrations.show.mirakl.representationGuide.special.property.source'),
      fill: t('integrations.show.mirakl.representationGuide.special.property.fill'),
      badge: t('integrations.show.mirakl.representationGuide.badges.special'),
    };
  }

  if (usesDefaultValueInput.value) {
    return {
      title: representationTypeLabel.value,
      description: t('integrations.show.mirakl.representationGuide.special.default_value.description'),
      summary: t('integrations.show.mirakl.representationGuide.special.default_value.summary'),
      source: t('integrations.show.mirakl.representationGuide.special.default_value.source'),
      fill: t('integrations.show.mirakl.representationGuide.special.default_value.fill'),
      badge: t('integrations.show.mirakl.representationGuide.badges.special'),
    };
  }

  if (currentType === 'unit') {
    return {
      title: representationTypeLabel.value,
      description: t('integrations.show.mirakl.representationGuide.special.unit.description'),
      summary: t('integrations.show.mirakl.representationGuide.special.unit.summary'),
      source: t('integrations.show.mirakl.representationGuide.special.unit.source'),
      fill: t('integrations.show.mirakl.representationGuide.special.unit.fill'),
      badge: t('integrations.show.mirakl.representationGuide.badges.special'),
    };
  }

  const specificBaseKey = `integrations.show.mirakl.representationGuide.types.${currentType}`;
  if (te(`${specificBaseKey}.description`)) {
    return {
      title: representationTypeLabel.value,
      description: t(`${specificBaseKey}.description`),
      summary: t(`${specificBaseKey}.summary`),
      source: t(`${specificBaseKey}.source`),
      fill: t(`${specificBaseKey}.fill`),
      badge: t(`integrations.show.mirakl.representationGuide.badges.${representationTypeGroup.value}`),
    };
  }

  return {
    title: representationTypeLabel.value,
    description: t(`integrations.show.mirakl.representationGuide.${representationTypeGroup.value}.description`, {
      field: representationTypeLabel.value,
    }),
    summary: t(`integrations.show.mirakl.representationGuide.${representationTypeGroup.value}.summary`, {
      field: representationTypeLabel.value,
    }),
    source: t(`integrations.show.mirakl.representationGuide.${representationTypeGroup.value}.source`, {
      field: representationTypeLabel.value,
    }),
    fill: t(`integrations.show.mirakl.representationGuide.${representationTypeGroup.value}.fill`, {
      field: representationTypeLabel.value,
    }),
    badge: t(`integrations.show.mirakl.representationGuide.badges.${representationTypeGroup.value}`),
  };
});

const metadataFields = computed<Array<{ key: string; label: string; boolean?: boolean }>>(() => [
  { key: 'description', label: t('integrations.show.mirakl.properties.labels.description') },
  { key: 'example', label: t('integrations.show.mirakl.properties.labels.example') },
  ...(showLanguageField.value
    ? [{ key: 'language', label: t('integrations.show.mirakl.properties.labels.language') }]
    : []),
  { key: 'defaultValue', label: t('integrations.show.mirakl.properties.labels.defaultValue') },
  { key: 'valueListCode', label: t('integrations.show.mirakl.properties.labels.valueListCode') },
  { key: 'valueListLabel', label: t('integrations.show.mirakl.properties.labels.valueListLabel') },
]);

const jsonSections = computed(() => [
  { key: 'typeParameters', label: t('integrations.show.mirakl.properties.labels.typeParameters') },
  { key: 'validations', label: t('integrations.show.mirakl.properties.labels.validations') },
  { key: 'transformations', label: t('integrations.show.mirakl.properties.labels.transformations') },
  { key: 'rawData', label: t('integrations.show.properties.labels.rawData') },
]);

const selectValuesRoute = computed(() => ({
  name: 'integrations.integrations.show',
  params: { type: type.value, id: integrationId },
  query: {
    tab: 'propertySelectValues',
    remoteProperty: miraklPropertyId.value,
  },
}));

const breadcrumbsLinks = computed(() => [
  { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
  {
    path: {
      name: 'integrations.integrations.show',
      params: { id: integrationId, type: type.value },
      query: { tab: returnTab },
    },
    name: t(`integrations.show.${type.value}.title`),
  },
  { name: t('integrations.show.mapProperty') },
]);

const remoteRuleId = computed(() =>
  [miraklPropertyId.value, integrationId, salesChannelId, type.value]
    .map((part) => part ?? '')
    .join('__'),
);

const fetchNextUnmapped = async (): Promise<{ nextId: string | null; last: boolean }> => {
  const queryNext = async (filter: Record<string, any>) => {
    const { data } = await apolloClient.query({
      query: miraklPropertiesQuery,
      variables: {
        first: 2,
        filter,
      },
      fetchPolicy: 'network-only',
    });

    const edges = data?.miraklProperties?.edges || [];
    let nextId: string | null = null;
    for (const edge of edges) {
      if (edge.node.id !== miraklPropertyId.value) {
        nextId = edge.node.id;
        break;
      }
    }
    const last = edges.length === 1 && edges[0].node.id === miraklPropertyId.value;
    return { nextId, last };
  };

  const nextFilters =
    buildFilterVariablesFromRouteQuery(miraklPropertiesSearchConfigConstructor(t), route.query, {
      prefix: 'next__',
      excludeKeys: ['mappedLocally'],
    }) || {};

  const baseFilter = {
    salesChannel: { id: { exact: salesChannelId } },
    showProperty: true,
    mappedLocally: false,
    ...nextFilters,
  };

  const primary = await queryNext(baseFilter);
  if (primary.nextId || primary.last || !('usedInProducts' in baseFilter)) {
    return primary;
  }

  const { usedInProducts, ...fallbackFilter } = baseFilter as any;
  return queryNext(fallbackFilter);
};

const localInstanceId = computed(() => {
  const current = formData.value.localInstance;
  if (!current) {
    return null;
  }
  if (typeof current === 'object') {
    return current.id ? String(current.id) : null;
  }
  return String(current);
});

const normalizeTranslations = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item: any) => item && typeof item === 'object')
    .map((item: any) => ({
      locale: item.locale || item.language || '',
      value: item.value || '',
    }))
    .filter((item) => item.locale || item.value);
};

const formatJson = (value: unknown) => {
  if (value == null || value === '' || (Array.isArray(value) && !value.length)) {
    return '—';
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch (_error) {
    return String(value);
  }
};

const formatMetadataValue = (value: unknown, boolean = false) => {
  if (boolean) {
    if (value == null) {
      return '—';
    }
    return value ? t('shared.labels.yes') : t('shared.labels.no');
  }
  if (value == null || value === '') {
    return '—';
  }
  return String(value);
};

const fetchLocalPropertyType = async (id: string) => {
  if (localTypeCache.has(id)) {
    return localTypeCache.get(id) || null;
  }
  const { data } = await apolloClient.query({
    query: getPropertyQuery,
    variables: { id },
    fetchPolicy: 'cache-first',
  });
  const fetchedType = data?.property?.type || null;
  if (fetchedType) {
    localTypeCache.set(id, fetchedType);
  }
  return fetchedType;
};

const updateLocalInstanceHelp = () => {
  if (!formConfig.value) {
    return;
  }
  const field = formConfig.value.fields.find((item) => item.name === 'localInstance');
  if (!field) {
    return;
  }
  if (!typeMismatch.value || !typeCompatibility.value) {
    delete field.secondaryHelp;
    delete field.secondaryHelpClass;
    return;
  }
  const messageKey = typeCompatibility.value.compatible
    ? 'integrations.show.mapping.typeCompatibility.fieldCompatible'
    : 'integrations.show.mapping.typeCompatibility.fieldIncompatible';
  field.secondaryHelp = t(messageKey, {
    originalType: originalTypeLabel.value,
    mappedType: mappedTypeLabel.value,
  });
  field.secondaryHelpClass = typeCompatibility.value.compatible ? 'text-orange-600' : 'text-red-600';
};

const updateCurrentTypeHelp = () => {
  if (!formConfig.value) {
    return;
  }

  const field = formConfig.value.fields.find((item) => item.name === 'type');
  if (!field) {
    return;
  }

  if (!initialCurrentType.value || !localPropertyType.value || initialCurrentType.value === localPropertyType.value) {
    delete field.secondaryHelp;
    delete field.secondaryHelpClass;
    return;
  }

  field.secondaryHelp = t('integrations.show.properties.help.currentTypeWillBecome', {
    type: mappedTypeLabel.value,
  });
  field.secondaryHelpClass = 'text-orange-600';
};

const getEffectiveCurrentType = (fallback?: string | null) =>
  localPropertyType.value || fallback || initialCurrentType.value || null;

const buildLocalInstanceField = (defaultValue?: string | null) => ({
  type: FieldType.Query,
  name: 'localInstance',
  label: t('integrations.show.properties.labels.property'),
  help: t('integrations.show.properties.help.property'),
  labelBy: 'name',
  valueBy: 'id',
  query: propertiesQuerySelector,
  dataKey: 'properties',
  isEdge: true,
  multiple: false,
  filterable: true,
  formMapIdentifier: 'id',
  ...(defaultValue ? { default: defaultValue } : {}),
});

const buildDefaultValueField = (defaultValue?: string | null) => ({
  type: FieldType.Text,
  name: 'defaultValue',
  label: t('integrations.show.mirakl.properties.labels.defaultValue'),
  help: t('integrations.show.mirakl.properties.help.defaultValue'),
  ...(defaultValue != null ? { default: defaultValue } : {}),
});

const buildLanguageField = () => ({
  type: FieldType.Query,
  name: 'language',
  label: t('integrations.show.mirakl.properties.labels.language'),
  help: t('integrations.show.mirakl.properties.help.language'),
  labelBy: 'name',
  valueBy: 'remoteCode',
  query: miraklRemoteLanguagesQuery,
  dataKey: 'miraklRemoteLanguages',
  queryVariables: salesChannelId
    ? { filter: { salesChannel: { id: { exact: salesChannelId } } } }
    : undefined,
  isEdge: true,
  multiple: false,
  filterable: true,
  removable: true,
  optional: true,
});

const buildRepresentationTypeField = () => ({
  type: FieldType.Choice,
  name: 'representationType',
  label: t('integrations.show.mirakl.properties.labels.representationType'),
  labelBy: 'name',
  valueBy: 'code',
  options: getMiraklRepresentationTypeOptions(t),
  disabled: false,
  removable: false,
  help: t('integrations.show.mirakl.properties.help.representationType'),
});

const getForcedRepresentationCurrentType = () => {
  if (isRepresentationTypeDecided.value || !usesMiraklBooleanCurrentType(currentRepresentationType.value)) {
    return null;
  }

  if (![PropertyTypes.SELECT, PropertyTypes.MULTISELECT].includes(originalType.value || '')) {
    return null;
  }

  return PropertyTypes.BOOLEAN;
};

const insertFieldsAfter = (afterName: string, fieldsToAdd: any[]) => {
  if (!formConfig.value) {
    return;
  }
  const fields = formConfig.value.fields;
  const existing = new Set(fields.map((item) => item.name));
  const additions = fieldsToAdd.filter((item) => !existing.has(item.name));
  if (!additions.length) {
    return;
  }
  const index = fields.findIndex((item) => item.name === afterName);
  if (index === -1) {
    fields.push(...additions);
  } else {
    fields.splice(index + 1, 0, ...additions);
  }
};

const removeFieldsByName = (names: string[]) => {
  if (!formConfig.value) {
    return;
  }
  formConfig.value.fields = formConfig.value.fields.filter((item) => !names.includes(item.name));
  if (formData.value) {
    names.forEach((name) => {
      if (name in formData.value) {
        delete formData.value[name];
      }
    });
  }
};

const syncRepresentationFields = () => {
  if (!formConfig.value) {
    return;
  }

  const existingLocalInstance =
    formData.value?.localInstance ??
    propertyId ??
    propertyMetadata.value?.localInstance?.id ??
    null;
  const existingDefaultValue = formData.value?.defaultValue ?? propertyMetadata.value?.defaultValue ?? '';
  const existingLanguage = formData.value?.language ?? propertyMetadata.value?.language ?? null;

  formConfig.value.haveCustomHelpSection = showRepresentationGuide.value;

  if (showRepresentationGuide.value) {
    insertFieldsAfter('allowsUnmappedValues', [buildRepresentationTypeField() as any]);
  } else {
    removeFieldsByName(['representationType']);
  }

  removeFieldsByName(['localInstance', 'defaultValue', 'language', 'yesTextValue', 'noTextValue']);

  if (usesLocalPropertyMapping.value) {
    insertFieldsAfter('name', [
      buildLocalInstanceField(existingLocalInstance) as any,
    ]);
    formData.value.localInstance = existingLocalInstance;
    syncBooleanTextFields(getEffectiveCurrentType(formData.value.type));
    if (showLanguageField.value) {
      const languageAnchor = formConfig.value.fields.some((item) => item.name === 'noTextValue')
        ? 'noTextValue'
        : formConfig.value.fields.some((item) => item.name === 'yesTextValue')
          ? 'yesTextValue'
          : 'localInstance';
      insertFieldsAfter(languageAnchor, [buildLanguageField() as any]);
      formData.value.language = existingLanguage;
    }
    updateLocalInstanceHelp();
    return;
  }

  if (usesDefaultValueInput.value) {
    insertFieldsAfter('name', [
      buildDefaultValueField(existingDefaultValue) as any,
    ]);
    formData.value.defaultValue = existingDefaultValue;
  }

  if (showLanguageField.value) {
    const languageAnchor = usesDefaultValueInput.value ? 'defaultValue' : 'name';
    insertFieldsAfter(languageAnchor, [buildLanguageField() as any]);
    formData.value.language = existingLanguage;
  }

  localPropertyType.value = getForcedRepresentationCurrentType();
  if (formData.value) {
    formData.value.type = getEffectiveCurrentType(formData.value.type);
  }
  updateLocalInstanceHelp();
  updateCurrentTypeHelp();
};

const syncBooleanTextFields = (currentTypeOverride?: string | null) => {
  const fieldNames = ['yesTextValue', 'noTextValue'];
  if (!usesLocalPropertyMapping.value) {
    removeFieldsByName(fieldNames);
    return;
  }
  const currentType = currentTypeOverride || localPropertyType.value || formData.value.type || null;
  const isSelectWithCustomValues =
    Boolean(originalAllowsUnmappedValues.value) &&
    [PropertyTypes.SELECT, PropertyTypes.MULTISELECT].includes(originalType.value || '');
  const shouldShow = Boolean(
    originalType.value &&
      (([PropertyTypes.TEXT, PropertyTypes.DESCRIPTION].includes(originalType.value) &&
        currentType === PropertyTypes.BOOLEAN) ||
        (originalType.value === PropertyTypes.BOOLEAN &&
          [PropertyTypes.TEXT, PropertyTypes.DESCRIPTION].includes(currentType)) ||
        (isSelectWithCustomValues && currentType === PropertyTypes.BOOLEAN)),
  );
  if (!shouldShow) {
    removeFieldsByName(fieldNames);
    return;
  }
  const useSelectFallbackHelp = isSelectWithCustomValues && currentType === PropertyTypes.BOOLEAN;
  const helpKeys = useSelectFallbackHelp
    ? {
        yes: 'integrations.show.mapping.booleanText.help.yesTextSelectFallback',
        no: 'integrations.show.mapping.booleanText.help.noTextSelectFallback',
      }
    : {
        yes: 'integrations.show.mapping.booleanText.help.yesText',
        no: 'integrations.show.mapping.booleanText.help.noText',
      };
  insertFieldsAfter('localInstance', [
    {
      type: FieldType.Text,
      name: 'yesTextValue',
      label: t('integrations.show.mapping.booleanText.labels.yesText'),
      help: t(helpKeys.yes),
    },
    {
      type: FieldType.Text,
      name: 'noTextValue',
      label: t('integrations.show.mapping.booleanText.labels.noText'),
      help: t(helpKeys.no),
    },
  ]);
};

const showCompatibilityAlert = async (compatible: boolean, warnings: string[]) => {
  const titleKey = compatible
    ? 'integrations.show.mapping.typeCompatibility.alertCompatibleTitle'
    : 'integrations.show.mapping.typeCompatibility.alertIncompatibleTitle';
  const intro = t('integrations.show.mapping.typeCompatibility.alertIntro', {
    originalType: originalTypeLabel.value,
    mappedType: mappedTypeLabel.value,
  });
  const detail = compatible
    ? t('integrations.show.mapping.typeCompatibility.compatibleDetail')
    : t('integrations.show.mapping.typeCompatibility.incompatibleDetail');
  const warningsHtml = warnings.length
    ? `<ul class=\"mt-2 text-left list-disc list-inside\">${warnings.map((warning) => `<li>${warning}</li>`).join('')}</ul>`
    : '';
  await Swal.fire({
    icon: compatible ? 'warning' : 'error',
    title: t(titleKey),
    html: `<p>${intro}</p><p class=\"mt-2\">${detail}</p>${warningsHtml}`,
  });
};

onMounted(async () => {
  formConfig.value = miraklPropertyEditFormConfigConstructor(t, type.value, miraklPropertyId.value, integrationId);

  if (!formConfig.value) {
    return;
  }

  formConfig.value.transformSubmitData = (cleanedData: Record<string, any>) => ({
    ...(() => {
      const nextData: Record<string, any> = {
        ...cleanedData,
        type: getEffectiveCurrentType(cleanedData.type),
      };

      if (!usesLocalPropertyMapping.value) {
        delete nextData.localInstance;
        delete nextData.yesTextValue;
        delete nextData.noTextValue;
      }

      if (isRepresentationTypeDecided.value) {
        delete nextData.representationType;
      }

      if (!usesDefaultValueInput.value) {
        delete nextData.defaultValue;
      }

      if (!showLanguageField.value) {
        delete nextData.language;
      }

      if (!usesLocalPropertyMapping.value && nextData.localInstance?.id === null) {
        nextData.localInstance = null;
      }

      return nextData;
    })(),
  });

  formConfig.value.afterSubmitCallback = () => {
    const nextType = getEffectiveCurrentType(formData.value?.type);
    if (!nextType) {
      return;
    }
    initialCurrentType.value = nextType;
    if (formData.value) {
      formData.value.type = nextType;
    }
    updateCurrentTypeHelp();
    syncBooleanTextFields(nextType);
  };

  formConfig.value.cancelUrl = {
    name: 'integrations.integrations.show',
    params: { type: type.value, id: integrationId },
    query: { tab: returnTab },
  };

  formConfig.value.submitUrl = {
    name: 'integrations.integrations.show',
    params: { type: type.value, id: integrationId },
    query: { tab: returnTab },
  };

  if (!isWizard) {
    return;
  }

  const { nextId, last } = await fetchNextUnmapped();

  formConfig.value.addSubmitAndContinue = false;

  if (nextId) {
    formConfig.value.submitUrl = {
      name: 'integrations.remoteProperties.edit',
      params: { type: type.value, id: nextId },
      query: { integrationId, salesChannelId, wizard: '1', fromTab: returnTab },
    };
    formConfig.value.submitLabel = t('integrations.show.mapping.saveAndMapNext');
    return;
  }

  if (last) {
    formConfig.value.submitUrl = {
      name: 'integrations.integrations.show',
      params: { type: type.value, id: integrationId },
      query: { tab: returnTab },
    };
    return;
  }

  Toast.success(t('integrations.show.mapping.allMappedSuccess'));
  router.push({
    name: 'integrations.integrations.show',
    params: { type: type.value, id: integrationId },
    query: { tab: returnTab },
  });
});

const handleSetData = (data: any) => {
  if (!formConfig.value) {
    return;
  }

  const propertyData = data?.miraklProperty;
  const currentType = propertyData?.type;
  if (!currentType) {
    return;
  }
  propertyMetadata.value = propertyData || null;
  representationType.value = propertyData?.representationType || null;

  originalType.value = propertyData?.originalType || currentType;
  initialCurrentType.value = currentType;
  originalAllowsUnmappedValues.value = propertyData?.allowsUnmappedValues ?? null;
  propertyType.value = currentType;
  if (formData.value) {
    formData.value.originalType = originalType.value;
    formData.value.representationType = representationType.value;
    formData.value.defaultValue = propertyData?.defaultValue ?? '';
    formData.value.language = propertyData?.language ?? null;
  }
  syncRepresentationFields();
};

const handleFormUpdate = (form: Record<string, any>) => {
  formData.value = form;
};

watch(localInstanceId, async (nextId) => {
  if (!usesLocalPropertyMapping.value) {
    localPropertyType.value = null;
    updateLocalInstanceHelp();
    updateCurrentTypeHelp();
    return;
  }

  if (!nextId) {
    localPropertyType.value = null;
    updateLocalInstanceHelp();
    updateCurrentTypeHelp();
    syncBooleanTextFields();
    hasInitializedLocalInstance.value = true;
    return;
  }

  const nextType = await fetchLocalPropertyType(nextId);
  localPropertyType.value = nextType;

  const hasMismatch = Boolean(originalType.value && nextType && originalType.value !== nextType);
  const compatibility = originalType.value && nextType
    ? getTypeCompatibility({
        originalType: originalType.value,
        allowsUnmappedValues: originalAllowsUnmappedValues.value,
        localType: nextType,
      })
    : null;

  if (hasMismatch && hasInitializedLocalInstance.value && compatibility) {
    const warningTexts = (compatibility.warnings || []).map((warningKey) => t(warningKey));
    await showCompatibilityAlert(compatibility.compatible, warningTexts);
  }

  if (compatibility && !compatibility.compatible) {
    formData.value.localInstance = null;
    localPropertyType.value = null;
    updateLocalInstanceHelp();
    updateCurrentTypeHelp();
    syncBooleanTextFields();
    hasInitializedLocalInstance.value = true;
    return;
  }

  updateLocalInstanceHelp();
  updateCurrentTypeHelp();
  syncBooleanTextFields();
  hasInitializedLocalInstance.value = true;
});

const fetchRecommendations = async () => {
  if (!usesLocalPropertyMapping.value) {
    recommendations.value = [];
    return;
  }
  const searchValue = formData.value.name;
  if (!searchValue) {
    recommendations.value = [];
    return;
  }

  loadingRecommendations.value = true;

  try {
    const { data } = await apolloClient.mutate({
      mutation: checkPropertyForDuplicatesMutation,
      variables: { name: searchValue },
    });

    if (data?.checkPropertyForDuplicates?.duplicateFound) {
      recommendations.value = data.checkPropertyForDuplicates.duplicates
        .filter((p: any) => p.id !== formData.value.localInstance?.id)
        .map((p: any) => ({ id: p.id, name: p.name }));
    } else {
      recommendations.value = [];
    }
  } finally {
    loadingRecommendations.value = false;
  }
};

const debouncedFetchRecommendations = debounce(fetchRecommendations, 500);

watch(
  () => formData.value.name,
  () => {
    if (!usesLocalPropertyMapping.value) {
      recommendations.value = [];
      return;
    }
    debouncedFetchRecommendations();
  },
);

watch(
  () => formData.value.localInstance,
  () => {
    recommendations.value = recommendations.value.filter((r) => r.id !== formData.value.localInstance);
  },
);

const selectRecommendation = (id: string) => {
  formData.value.localInstance = id;
  recommendations.value = recommendations.value.filter((r) => r.id !== id);
};

watch(currentRepresentationType, () => {
  syncRepresentationFields();
});
</script>

<template>
  <RemotePropertyEdit
    :breadcrumbs-links="breadcrumbsLinks"
    :form-config="formConfig"
    @set-data="handleSetData"
    @form-updated="handleFormUpdate"
  >
    <template #help-section>
      <div v-if="showRepresentationGuide" class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div class="bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5 border-b border-slate-200">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                {{ t('integrations.show.mirakl.representationGuide.eyebrow') }}
              </p>
              <h2 class="mt-2 text-xl font-semibold text-slate-900">
                {{ representationGuide.title }}
              </h2>
              <p class="mt-2 text-sm leading-6 text-slate-600">
                {{ representationGuide.summary }}
              </p>
            </div>
            <span class="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800 whitespace-nowrap">
              {{ representationGuide.badge }}
            </span>
          </div>
        </div>

        <div class="space-y-5 p-5">
          <img
            v-if="representationGuideImage"
            :src="representationGuideImage"
            :alt="representationTypeLabel"
            class="h-auto w-full rounded-xl border border-slate-200 bg-white object-cover shadow-sm"
          />

          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {{ t('integrations.show.mirakl.representationGuide.cards.general.title') }}
            </p>
            <p class="mt-3 text-sm leading-6 text-slate-600">
              {{ representationGuide.description }}
            </p>
            <p class="mt-3 text-sm leading-6 text-slate-600">
              {{ representationGuide.summary }}
            </p>
          </div>

          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {{ t('integrations.show.mirakl.representationGuide.cards.current.title') }}
            </p>
            <p class="mt-3 text-sm leading-6 text-slate-600">
              {{ representationGuide.source }}
            </p>
            <p class="mt-3 text-sm leading-6 text-slate-600">
              {{ representationGuide.fill }}
            </p>
          </div>
        </div>
      </div>
    </template>
    <template #before-form>
      <div
        v-if="showTypeDisclaimer"
        :class="[
          'mb-6 border rounded p-4',
          typeCompatibilityIsCompatible ? 'border-orange-200 bg-orange-50' : 'border-red-200 bg-red-50',
        ]"
      >
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-2">
          {{ t('integrations.show.mapping.typeCompatibility.title') }}
        </Label>
        <p class="text-sm text-gray-700">{{ typeCompatibilitySummary }}</p>
        <p :class="typeCompatibilityIsCompatible ? 'text-orange-700' : 'text-red-700'" class="text-sm mt-1">
          {{ typeCompatibilityStatus }}
        </p>
        <ul v-if="typeCompatibilityWarnings.length" class="mt-2 list-disc list-inside text-sm text-gray-700">
          <li v-for="(warning, index) in typeCompatibilityWarnings" :key="index">{{ warning }}</li>
        </ul>
      </div>
    </template>
    <template #additional-button>
      <div v-if="usesLocalPropertyMapping" class="flex items-center gap-2">
        <Link
          v-if="remoteRuleId"
          :path="{
            name: 'properties.properties.create',
            query: {
              remoteRuleId,
              ...(formData.name ? { name: formData.name } : {}),
              ...(localPropertyType || formData.type ? { type: localPropertyType || formData.type } : {}),
              remoteWizard: isWizard ? '1' : '0',
              ...extractPrefixedQueryParams(route.query, 'next__'),
            },
          }"
        >
          <Button type="button" class="btn btn-info">
            {{ t('integrations.show.generateProperty') }}
          </Button>
        </Link>
        <Link v-if="canSeeValues" :path="selectValuesRoute">
          <Button type="button" class="btn btn-secondary">
            {{ t('integrations.show.properties.actions.seeValues') }}
          </Button>
        </Link>
      </div>
    </template>
    <template #additional-fields>
      <div class="space-y-4">
        <div v-if="usesLocalPropertyMapping" class="mt-4 border border-gray-300 bg-gray-50 rounded p-4">
          <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-2">
            {{ t('integrations.show.propertySelectValues.recommendation.title') }}
          </Label>
          <div v-if="loadingRecommendations" class="flex items-center gap-2">
            <div class="loader-mini"></div>
            <span class="text-sm text-gray-500">
              {{ t('integrations.show.propertySelectValues.recommendation.searching') }}
            </span>
          </div>
          <div v-else>
            <div v-if="recommendations.length" class="flex flex-wrap gap-2">
              <button
                v-for="item in recommendations"
                :key="item.id"
                type="button"
                class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm hover:bg-purple-200"
                @click="selectRecommendation(item.id)"
              >
                {{ item.name }}
              </button>
            </div>
            <p v-else class="text-sm text-gray-500">
              {{ t('integrations.show.propertySelectValues.recommendation.none') }}
            </p>
          </div>
        </div>

        <div class="border border-gray-300 bg-gray-50 rounded p-4">
          <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-3">
            {{ t('integrations.show.mirakl.properties.sections.metadata') }}
          </Label>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div v-for="field in metadataFields" :key="field.key" class="space-y-1">
              <p class="text-sm font-medium text-gray-900">{{ field.label }}</p>
              <p class="text-sm text-gray-700 whitespace-pre-wrap break-words">
                {{ formatMetadataValue(propertyMetadata?.[field.key], field.boolean) }}
              </p>
            </div>
          </div>
        </div>

        <div class="border border-gray-300 bg-gray-50 rounded p-4">
          <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-3">
            {{ t('integrations.show.mirakl.properties.sections.translations') }}
          </Label>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p class="text-sm font-medium text-gray-900 mb-2">
                {{ t('integrations.show.mirakl.properties.labels.labelTranslations') }}
              </p>
              <ul v-if="labelTranslations.length" class="space-y-2">
                <li
                  v-for="(item, index) in labelTranslations"
                  :key="`${item.locale}-${index}`"
                  class="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span>{{ item.value || '—' }}</span>
                  <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {{ item.locale || '—' }}
                  </span>
                </li>
              </ul>
              <p v-else class="text-sm text-gray-500">—</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 mb-2">
                {{ t('integrations.show.mirakl.properties.labels.descriptionTranslations') }}
              </p>
              <ul v-if="descriptionTranslations.length" class="space-y-2">
                <li
                  v-for="(item, index) in descriptionTranslations"
                  :key="`${item.locale}-${index}`"
                  class="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span class="flex-1 whitespace-pre-wrap break-words">{{ item.value || '—' }}</span>
                  <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {{ item.locale || '—' }}
                  </span>
                </li>
              </ul>
              <p v-else class="text-sm text-gray-500">—</p>
            </div>
          </div>
        </div>

        <div class="border border-gray-300 bg-gray-50 rounded p-4">
          <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-3">
            {{ t('integrations.show.properties.labels.rawData') }}
          </Label>
          <div class="space-y-4">
            <div v-for="section in jsonSections" :key="section.key" class="space-y-2">
              <p class="text-sm font-medium text-gray-900">{{ section.label }}</p>
              <pre class="whitespace-pre-wrap break-words text-xs text-gray-700">{{ formatJson(propertyMetadata?.[section.key]) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </template>
  </RemotePropertyEdit>
</template>

<style scoped>
.loader-mini {
  width: 24px;
  aspect-ratio: 1;
  display: grid;
}

.loader-mini::before,
.loader-mini::after {
  content: "";
  grid-area: 1/1;
  --c: no-repeat radial-gradient(farthest-side, currentColor 92%, #0000);
  background:
    var(--c) 50% 0,
    var(--c) 50% 100%,
    var(--c) 100% 50%,
    var(--c) 0 50%;
  background-size: 5px 5px;
  animation: l2 1s infinite;
}

.loader-mini::after {
  margin: 2px;
  filter: hue-rotate(45deg);
  background-size: 3px 3px;
  animation-direction: reverse;
}

@keyframes l2 {
  100% {
    transform: rotate(0.5turn);
  }
}
</style>
