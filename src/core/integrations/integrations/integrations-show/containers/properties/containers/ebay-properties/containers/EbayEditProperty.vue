<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import RemotePropertyEdit from "../../remote-properties/components/RemotePropertyEdit.vue";
import { ebayPropertyEditFormConfigConstructor } from "../configs";
import { FieldType, PropertyTypes } from "../../../../../../../../../shared/utils/constants";
import { getPropertyQuery, propertiesQuerySelector } from "../../../../../../../../../shared/api/queries/properties.js";
import apolloClient from "../../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import { ebayPropertiesQuery } from "../../../../../../../../../shared/api/queries/salesChannels";
import type { FormConfig } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { Label } from "../../../../../../../../../shared/components/atoms/label";
import { checkPropertyForDuplicatesMutation } from "../../../../../../../../../shared/api/mutations/properties.js";
import debounce from 'lodash.debounce';
import { ebayPropertiesSearchConfigConstructor } from '../configs';
import { buildFilterVariablesFromRouteQuery, extractPrefixedQueryParams } from '../../../../../../../../../shared/components/molecules/filter-manager/filterQueryUtils';
import { getTypeCompatibility } from '../../../../../../../../../shared/utils/propertyTypeCompatibility';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const ebayPropertyId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId?.toString() || '';
const salesChannelId = route.query.salesChannelId?.toString() || '';
const isWizard = route.query.wizard === '1';
const propertyId = route.query.propertyId?.toString() || null;
const returnTab = route.query.fromTab?.toString() || 'properties';

const formConfig = ref<FormConfig | null>(null);
const formData = ref<Record<string, any>>({});
const propertyType = ref<string | null>(null);
const originalType = ref<string | null>(null);
const initialCurrentType = ref<string | null>(null);
const originalAllowsUnmappedValues = ref<boolean | null>(null);
const localPropertyType = ref<string | null>(null);
const localTypeCache = new Map<string, string>();
const hasInitializedLocalInstance = ref(false);
const recommendations = ref<{ id: string; name: string }[]>([]);
const loadingRecommendations = ref(false);
const marketplaceInfo = ref<{ id: string | null; name: string }>({ id: null, name: '' });

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

const getTypeLabel = (type?: string | null) => {
  if (!type) {
    return '';
  }
  const key = typeLabelKeyMap[type];
  return key ? t(key) : type;
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

const isSelectPropertyType = (type?: string | null) => {
  return type === PropertyTypes.SELECT || type === PropertyTypes.MULTISELECT;
};

const canSeeValues = computed(() => isSelectPropertyType(propertyType.value));

const selectValuesRoute = computed(() => ({
  name: 'integrations.integrations.show',
  params: { type: type.value, id: integrationId },
  query: {
    tab: 'propertySelectValues',
    ebayProperty: ebayPropertyId.value,
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
    name: t('integrations.show.ebay.title'),
  },
  { name: t('integrations.show.mapProperty') },
]);

const marketplaceLink = computed(() => {
  if (!marketplaceInfo.value.id) {
    return null;
  }

  const query: Record<string, string> = {};
  if (integrationId) {
    query.integrationId = integrationId;
  }

  return {
    name: 'integrations.stores.edit',
    params: { type: type.value, id: marketplaceInfo.value.id },
    ...(Object.keys(query).length ? { query } : {}),
  };
});

const remoteRuleId = computed(() =>
  [ebayPropertyId.value, integrationId, salesChannelId, type.value]
    .map((part) => part ?? '')
    .join('__'),
);

const fetchNextUnmapped = async (): Promise<{ nextId: string | null; last: boolean }> => {
  const queryNext = async (filter: Record<string, any>) => {
    const { data } = await apolloClient.query({
      query: ebayPropertiesQuery,
      variables: {
        first: 2,
        filter,
      },
      fetchPolicy: 'network-only',
    });

    const edges = data?.ebayProperties?.edges || [];
    let nextId: string | null = null;
    for (const edge of edges) {
      if (edge.node.id !== ebayPropertyId.value) {
        nextId = edge.node.id;
        break;
      }
    }
    const last = edges.length === 1 && edges[0].node.id === ebayPropertyId.value;
    return { nextId, last };
  };

  const nextFilters =
    buildFilterVariablesFromRouteQuery(ebayPropertiesSearchConfigConstructor(t, salesChannelId), route.query, {
      prefix: 'next__',
      excludeKeys: ['mappedLocally'],
    }) || {};

  const baseFilter = {
    salesChannel: { id: { exact: salesChannelId } },
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

const syncBooleanTextFields = (currentTypeOverride?: string | null) => {
  const fieldNames = ['yesTextValue', 'noTextValue'];
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
  formConfig.value = ebayPropertyEditFormConfigConstructor(t, type.value, ebayPropertyId.value, integrationId);

  if (!formConfig.value) {
    return;
  }

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

  const currentType = data?.ebayProperty?.type;
  if (!currentType) {
    return;
  }

  originalType.value = data?.ebayProperty?.originalType || currentType;
  initialCurrentType.value = currentType;
  originalAllowsUnmappedValues.value = data?.ebayProperty?.allowsUnmappedValues ?? null;
  propertyType.value = originalType.value;
  if (formData.value) {
    formData.value.originalType = originalType.value;
  }

  marketplaceInfo.value = {
    id: data?.ebayProperty?.marketplace?.id ?? null,
    name: data?.ebayProperty?.marketplace?.name ?? '',
  };


  const defaultValue = propertyId || data?.ebayProperty?.localInstance?.id || null;

  const field = {
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
  };

  const index = formConfig.value.fields.findIndex((f) => f.name === 'localInstance');
  if (index === -1) {
    formConfig.value.fields.push(field as any);
  } else {
    formConfig.value.fields[index] = field as any;
  }

  syncBooleanTextFields(currentType);
  updateLocalInstanceHelp();
  updateCurrentTypeHelp();
};

const handleFormUpdate = (form: Record<string, any>) => {
  formData.value = form;
};

watch(localInstanceId, async (nextId) => {
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
  const searchValue = formData.value.translatedName || formData.value.localizedName;
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

    if (data && data.checkPropertyForDuplicates && data.checkPropertyForDuplicates.duplicateFound) {
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
  () => formData.value.translatedName,
  () => {
    debouncedFetchRecommendations();
  },
);

watch(
  () => formData.value.localizedName,
  (newValue, oldValue) => {
    if (newValue !== oldValue && !formData.value.translatedName) {
      debouncedFetchRecommendations();
    }
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
</script>

<template>
  <RemotePropertyEdit
    :breadcrumbs-links="breadcrumbsLinks"
    :form-config="formConfig"
    @set-data="handleSetData"
    @form-updated="handleFormUpdate"
  >
    <template #before-form>
      <div v-if="marketplaceInfo.name" class="mb-6">
        <Label class="font-semibold block text-sm leading-6 text-gray-900">
          {{ t('integrations.show.propertySelectValues.labels.marketplace') }}
        </Label>
        <Link v-if="marketplaceLink" :path="marketplaceLink">
          {{ marketplaceInfo.name }}
        </Link>
        <span v-else class="text-sm text-gray-500">{{ marketplaceInfo.name }}</span>
      </div>
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
      <div class="flex items-center gap-2">
        <Link
          v-if="remoteRuleId"
          :path="{
            name: 'properties.properties.create',
            query: {
              remoteRuleId,
              ...(formData.localizedName ? { name: formData.localizedName } : {}),
              ...(formData.translatedName ? { translatedName: formData.translatedName } : {}),
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

      <div class="mt-4 border border-gray-300 bg-gray-50 rounded p-4">
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
