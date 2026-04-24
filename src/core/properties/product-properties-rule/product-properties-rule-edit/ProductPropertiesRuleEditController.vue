<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, Ref, ref, watch } from "vue";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import { ProductPropertiesConfigurator } from "../../../../shared/components/organisms/product-properties-configurator";
import {Card} from "../../../../shared/components/atoms/card";
import {CancelButton} from "../../../../shared/components/atoms/button-cancel";
import {PrimaryButton} from "../../../../shared/components/atoms/button-primary";
import {SecondaryButton} from "../../../../shared/components/atoms/button-secondary";
import {Toast} from "../../../../shared/modules/toast";
import apolloClient from "../../../../../apollo-client";
import { getProductPropertiesRuleQuery, productPropertiesRulesQuery } from "../../../../shared/api/queries/properties.js";
import { completeCreateProductPropertiesRuleMutation, completeUpdateProductPropertiesRuleMutation, deleteProductPropertiesRuleMutation, duplicatePropertiesRuleMutation } from "../../../../shared/api/mutations/properties.js";
import { integrationsQuery } from "../../../../shared/api/queries/integrations.js";
import {DangerButton} from "../../../../shared/components/atoms/button-danger";
import {ApolloAlertMutation} from "../../../../shared/components/molecules/apollo-alert-mutation";
import { Property } from "../../../../shared/components/organisms/product-properties-configurator/ProductPropertiesConfigurator.vue";
import {Link} from "../../../../shared/components/atoms/link";
import {Button} from "../../../../shared/components/atoms/button";
import { LocalLoader } from "../../../../shared/components/atoms/local-loader";
import { Modal } from "../../../../shared/components/atoms/modal";
import { TextInput } from "../../../../shared/components/atoms/input-text";
import Swal, { SweetAlertOptions } from "sweetalert2";

interface Item {
  id: string | null;
  type: string | null;
  sortOrder: number;
}

interface RuleCacheEntry {
  id: string | null;
  requireEanCode: boolean;
  items: Property[];
  itemsMap: Record<string, Item>;
  templateSourceKey?: string | null;
  salesChannel: {
    id: string | null;
    name?: string | null;
    type?: string | null;
    hostname?: string | null;
  } | null;
}

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const WEBHOOK_CHANNEL_TYPE = 'webhook';

const id = ref(String(route.params.id));
const currentRuleId: Ref<string | null> = ref(String(route.params.id));
const initialProductType = ref<{ id: string; value: string } | null>(null);
const initialItems: Ref<Property[]> = ref([]);
const updatedAddedProperties: Ref<Property[]> = ref([]);
const propertiesItemsMap: Ref<Record<string, Item>> = ref({});
const integrationsLoading = ref(false);
const rightLoading = ref(false);
const saveLoading = ref(false);
const duplicateLoading = ref(false);
const requireEanCode = ref(false);
const ruleName = ref('');
const selectedSalesChannel = ref<'default' | string>('default');
const previousSalesChannel = ref<'default' | string>('default');
const selectedTemplateSource = ref<'default' | string>('default');
const rulesCache: Ref<Record<string, RuleCacheEntry>> = ref({});
const rawSalesChannels = ref<{ label: string; value: string }[]>([]);
const ignoreNextRouteChange = ref(false);
const showDuplicateModal = ref(false);

const salesChannelOptions = computed(() => [
  { label: t('properties.rule.labels.defaultSalesChannel'), value: 'default' },
  ...rawSalesChannels.value
]);

const primaryButtonLabel = computed(() =>
  t(currentRuleId.value ? 'shared.button.save' : 'shared.button.create')
);

const secondaryButtonLabel = computed(() =>
  t(currentRuleId.value ? 'shared.button.saveAndContinue' : 'shared.button.createAndContinue')
);

const disableActions = computed(() =>
  integrationsLoading.value || rightLoading.value || saveLoading.value
);

const templateSourceOptions = computed(() => {
  const options = Object.entries(rulesCache.value)
    .filter(([, entry]) => Boolean(entry?.id))
    .map(([key, entry]) => ({
      value: key,
      label: key === 'default'
        ? t('properties.rule.labels.defaultSalesChannel')
        : formatSalesChannelLabel(entry.salesChannel || undefined),
    }))
    .sort((a, b) => {
      if (a.value === 'default') return -1;
      if (b.value === 'default') return 1;
      return a.label.localeCompare(b.label);
    });

  return options;
});

const showTemplateSourceSelector = computed(() =>
  selectedSalesChannel.value !== 'default'
  && !currentRuleId.value
  && templateSourceOptions.value.length > 0
);

const getCacheKey = (salesChannelId: string | null | undefined) =>
  salesChannelId ?? 'default';

const formatSalesChannelLabel = (channel?: { id?: string | null; hostname?: string | null; type?: string | null }) => {
  if (!channel) {
    return t('properties.rule.labels.defaultSalesChannel');
  }

  return (
    channel.hostname ||
    channel.type ||
    channel.id ||
    t('properties.rule.labels.unknownSalesChannel')
  );
};

const cloneRuleEntry = (entry: RuleCacheEntry): RuleCacheEntry => ({
  id: entry.id,
  requireEanCode: entry.requireEanCode,
  templateSourceKey: entry.templateSourceKey ?? null,
  items: entry.items.map((item) => ({ ...item })),
  itemsMap: Object.fromEntries(
    Object.entries(entry.itemsMap).map(([key, value]) => [key, { ...value }])
  ) as Record<string, Item>,
  salesChannel: entry.salesChannel ? { ...entry.salesChannel } : null,
});

const applyRuleState = (entry: RuleCacheEntry) => {
  const clonedEntry = cloneRuleEntry(entry);
  propertiesItemsMap.value = { ...clonedEntry.itemsMap };
  initialItems.value = clonedEntry.items.map((item) => ({ ...item }));
  updatedAddedProperties.value = clonedEntry.items.map((item) => ({ ...item }));
  requireEanCode.value = clonedEntry.requireEanCode;
  currentRuleId.value = clonedEntry.id;
};

const addSalesChannelOptionIfMissing = (entry: RuleCacheEntry) => {
  const channelId = entry.salesChannel?.id;
  if (!channelId) {
    return;
  }

  if (!rawSalesChannels.value.some((option) => option.value === channelId)) {
    rawSalesChannels.value = [
      ...rawSalesChannels.value,
      { value: channelId, label: formatSalesChannelLabel(entry.salesChannel || { id: channelId }) },
    ];
  }
};

const createRuleFromTemplate = (
  templateEntry: RuleCacheEntry,
  salesChannelId: string | null,
  templateSourceKey: string | null,
): RuleCacheEntry => {
  const items = templateEntry.items.map((item, index) => ({
    ...item,
    sortOrder: index + 1,
  }));

  const itemsMap: Record<string, Item> = {};
  items.forEach((item, index) => {
    itemsMap[item.id] = {
      id: null,
      type: item.configType ?? null,
      sortOrder: index + 1,
    };
  });

  return {
    id: null,
    requireEanCode: templateEntry.requireEanCode,
    templateSourceKey,
    items,
    itemsMap,
    salesChannel: salesChannelId
      ? {
          id: salesChannelId,
          name: formatSalesChannelLabel({ id: salesChannelId }),
          type: null,
          hostname: null,
        }
      : null,
  };
};

const transformRuleNode = (node: any): RuleCacheEntry => {
  const items = (node.items ?? []).map((item: any, index: number) => ({
    id: item.property.id,
    name: item.property.name,
    type: item.property.type,
    configType: item.type,
    sortOrder: item.sortOrder ?? index + 1,
  }));

  const itemsMap: Record<string, Item> = {};
  (node.items ?? []).forEach((item: any, index: number) => {
    itemsMap[item.property.id] = {
      id: item.id,
      type: item.type,
      sortOrder: item.sortOrder ?? index + 1,
    };
  });

  return {
    id: node.id ?? null,
    requireEanCode: !!node.requireEanCode,
    items,
    itemsMap,
    templateSourceKey: null,
    salesChannel: node.salesChannel
      ? {
          id: node.salesChannel.id ?? null,
          name: formatSalesChannelLabel(node.salesChannel),
          type: node.salesChannel.type ?? null,
          hostname: node.salesChannel.hostname ?? null,
        }
      : null,
  };
};

const fetchRuleBySalesChannel = async (channelKey: string): Promise<RuleCacheEntry | null> => {
  if (!initialProductType.value) {
    return null;
  }

  const filter: Record<string, any> = {
    productType: { id: { exact: initialProductType.value.id } },
  };

  if (channelKey === 'default') {
    filter.salesChannel = { id: { isNull: true } };
  } else {
    filter.salesChannel = { id: { exact: channelKey } };
  }

  const { data } = await apolloClient.query({
    query: productPropertiesRulesQuery,
    variables: { filter, first: 1 },
    fetchPolicy: 'network-only',
  });

  const node = data?.productPropertiesRules?.edges?.[0]?.node;
  if (!node) {
    return null;
  }

  const entry = transformRuleNode(node);
  const key = getCacheKey(entry.salesChannel?.id ?? null);
  rulesCache.value[key] = entry;
  addSalesChannelOptionIfMissing(entry);
  return entry;
};

const getPreferredTemplateSourceKey = () =>
  templateSourceOptions.value.find((option) => option.value === 'default')?.value
  || templateSourceOptions.value[0]?.value
  || 'default';

const ensureDefaultRule = async () => {
  if (rulesCache.value['default']) {
    return;
  }

  await fetchRuleBySalesChannel('default');
};

const loadRuleTemplates = async (productTypeId: string) => {
  const { data } = await apolloClient.query({
    query: productPropertiesRulesQuery,
    variables: {
      filter: { productType: { id: { exact: productTypeId } } },
      first: 100,
    },
    fetchPolicy: 'network-only',
  });

  const nodes = data?.productPropertiesRules?.edges?.map((edge: any) => edge.node) ?? [];
  nodes.forEach((node: any) => {
    const entry = transformRuleNode(node);
    const key = getCacheKey(entry.salesChannel?.id ?? null);
    rulesCache.value[key] = entry;
    addSalesChannelOptionIfMissing(entry);
  });
};

const createMissingRuleEntry = async (
  channelKey: string,
  templateSourceKey: string,
): Promise<RuleCacheEntry> => {
  const normalizedTemplateSource = templateSourceKey || getPreferredTemplateSourceKey();
  let templateEntry: RuleCacheEntry | null = rulesCache.value[normalizedTemplateSource] ?? null;

  if (!templateEntry && normalizedTemplateSource === 'default') {
    await ensureDefaultRule();
    templateEntry = rulesCache.value.default ?? null;
  }

  if (!templateEntry && normalizedTemplateSource !== 'default') {
    templateEntry = await fetchRuleBySalesChannel(normalizedTemplateSource);
  }

  if (templateEntry) {
    return createRuleFromTemplate(
      templateEntry,
      channelKey === 'default' ? null : channelKey,
      normalizedTemplateSource,
    );
  }

  return {
    id: null,
    requireEanCode: false,
    templateSourceKey: normalizedTemplateSource,
    items: [],
    itemsMap: {},
    salesChannel:
      channelKey === 'default'
        ? null
        : { id: channelKey, name: null, type: null, hostname: null },
  };
};

const loadSalesChannels = async () => {
  integrationsLoading.value = true;
  try {
    const { data } = await apolloClient.query({ query: integrationsQuery, fetchPolicy: 'cache-first' });
    const nodes = data?.integrations?.edges?.map((edge: any) => edge.node) ?? [];
    const optionsMap = new Map<string, { label: string; value: string }>();

    nodes.forEach((node: any) => {
      const type = (node.type || '').toLowerCase();
      if (type === WEBHOOK_CHANNEL_TYPE) {
        return;
      }

      const channelId = node.id;
      if (!channelId || optionsMap.has(channelId)) {
        return;
      }

      const label = formatSalesChannelLabel(node.saleschannelPtr || node);
      optionsMap.set(channelId, { value: channelId, label });
    });

    const existingOptions = [...rawSalesChannels.value];
    existingOptions.forEach((option) => {
      if (!optionsMap.has(option.value)) {
        optionsMap.set(option.value, option);
      }
    });

    rawSalesChannels.value = Array.from(optionsMap.values());
  } catch (_error) {
    rawSalesChannels.value = [...rawSalesChannels.value];
  } finally {
    integrationsLoading.value = false;
  }
};

const updateRouteId = async (newRuleId: string) => {
  const newId = String(newRuleId);
  if (route.params.id === newId) {
    id.value = newId;
    return;
  }

  ignoreNextRouteChange.value = true;
  await router.replace({ name: 'properties.rule.edit', params: { id: newId }, query: route.query });
  id.value = newId;
};

const hasUnsavedChanges = computed(() => {
  const key = selectedSalesChannel.value;
  const base = rulesCache.value[key];

  if (!base) {
    return updatedAddedProperties.value.length > 0 || requireEanCode.value;
  }

  if (!base.id) {
    return true;
  }

  if (requireEanCode.value !== base.requireEanCode) {
    return true;
  }

  if (updatedAddedProperties.value.length !== base.items.length) {
    return true;
  }

  const sortedCurrent = [...updatedAddedProperties.value].sort((a, b) => a.sortOrder - b.sortOrder);
  const sortedBase = [...base.items].sort((a, b) => a.sortOrder - b.sortOrder);

  for (let index = 0; index < sortedCurrent.length; index += 1) {
    const current = sortedCurrent[index];
    const original = sortedBase[index];

    if (current.id !== original.id) {
      return true;
    }

    if ((current.configType ?? null) !== (original.configType ?? null)) {
      return true;
    }

    if ((current.sortOrder ?? index + 1) !== (original.sortOrder ?? index + 1)) {
      return true;
    }
  }

  return false;
});

const handleSalesChannelUpdated = async (newValue: string) => {
  if (disableActions.value) {
    return;
  }

  const normalizedValue = newValue && newValue !== '' ? newValue : 'default';

  if (normalizedValue === selectedSalesChannel.value) {
    return;
  }

  if (hasUnsavedChanges.value) {
    const defaultSwalOptions = {
      title: t('shared.alert.mutationAlert.title'),
      text: t('properties.rule.messages.unsavedChanges'),
      confirmButtonText: t('shared.alert.mutationAlert.confirmButtonTextSimpleYes'),
      cancelButtonText: t('shared.alert.mutationAlert.cancelButtonText'),
      icon: 'warning',
      showCancelButton: true,
      reverseButtons: true,
      padding: '2em',
    };

    const defaultSwalClasses = {
      popup: 'sweet-alerts',
      confirmButton: 'btn btn-secondary',
      cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3',
    };

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: defaultSwalClasses,
      buttonsStyling: false,
    });

    const result = await swalWithBootstrapButtons.fire(defaultSwalOptions as SweetAlertOptions);

    if (!result.isConfirmed) {
      selectedSalesChannel.value = previousSalesChannel.value;
      return;
    }
  }

  selectedSalesChannel.value = normalizedValue;
  previousSalesChannel.value = normalizedValue;

  integrationsLoading.value = true;
  rightLoading.value = true;
  try {
    let entry: RuleCacheEntry | null = rulesCache.value[normalizedValue] ?? null;
    if (!entry) {
      entry = await fetchRuleBySalesChannel(normalizedValue);
    }

    if (!entry) {
      const templateKey = getPreferredTemplateSourceKey();
      selectedTemplateSource.value = templateKey;
      entry = await createMissingRuleEntry(normalizedValue, templateKey);
      rulesCache.value[normalizedValue] = entry;
    }

    if (!entry) {
      return;
    }

    selectedTemplateSource.value = entry.templateSourceKey || getPreferredTemplateSourceKey();
    applyRuleState(entry);

    if (entry.salesChannel?.id) {
      addSalesChannelOptionIfMissing(entry);
    }

    if (entry.id) {
      await updateRouteId(entry.id);
    }
  } finally {
    integrationsLoading.value = false;
    rightLoading.value = false;
  }
};

const persistRule = async (): Promise<RuleCacheEntry | null> => {
  const isCreate = !currentRuleId.value;
  const itemsPayload = updatedAddedProperties.value.map((property, index) => ({
    id: propertiesItemsMap.value[property.id]?.id || null,
    property: { id: property.id },
    type: property.configType,
    sortOrder: property.sortOrder ?? index + 1,
  }));

  const inputData: Record<string, any> = {
    requireEanCode: requireEanCode.value,
    items: itemsPayload,
    salesChannel: selectedSalesChannel.value === 'default'
      ? null
      : { id: selectedSalesChannel.value },
  };

  if (isCreate) {
    if (!initialProductType.value) {
      return null;
    }
    inputData.productType = { id: initialProductType.value.id };
  } else {
    inputData.id = currentRuleId.value;
  }

  const { data } = await apolloClient.mutate({
    mutation: isCreate ? completeCreateProductPropertiesRuleMutation : completeUpdateProductPropertiesRuleMutation,
    variables: { data: inputData },
  });

  const response = isCreate ? data?.completeCreateProductPropertiesRule : data?.completeUpdateProductPropertiesRule;
  if (!response?.id) {
    return null;
  }

  const entry = transformRuleNode({
    ...response,
    salesChannel:
      selectedSalesChannel.value === 'default'
        ? null
        : { id: selectedSalesChannel.value },
  });

  const key = getCacheKey(entry.salesChannel?.id ?? null);
  rulesCache.value[key] = entry;
  addSalesChannelOptionIfMissing(entry);
  selectedSalesChannel.value = key;
  previousSalesChannel.value = key;
  selectedTemplateSource.value = entry.templateSourceKey || getPreferredTemplateSourceKey();
  applyRuleState(entry);

  if (entry.id) {
    await updateRouteId(entry.id);
  }

  return entry;
};

const fetchData = async () => {
  rightLoading.value = true;
  rulesCache.value = {};
  propertiesItemsMap.value = {};
  initialItems.value = [];
  updatedAddedProperties.value = [];
  selectedTemplateSource.value = 'default';

  try {
    const { data } = await apolloClient.query({
      query: getProductPropertiesRuleQuery,
      variables: { id: id.value.toString() },
      fetchPolicy: 'network-only',
    });

    const rule = data?.productPropertiesRule;
    if (!rule) {
      return;
    }

    initialProductType.value = rule.productType;
    await loadRuleTemplates(rule.productType.id);
    const entry = transformRuleNode(rule);
    const key = getCacheKey(entry.salesChannel?.id ?? null);
    rulesCache.value[key] = entry;
    addSalesChannelOptionIfMissing(entry);
    selectedSalesChannel.value = key;
    previousSalesChannel.value = key;
    selectedTemplateSource.value = entry.templateSourceKey || getPreferredTemplateSourceKey();
    applyRuleState(entry);

    if (key !== 'default') {
      await ensureDefaultRule();
    }
  } finally {
    rightLoading.value = false;
  }
};

const handleSave = () => saveMutations(false);
const handleSaveAndContinue = () => saveMutations(true);
const saveMutations = async (continueEditing = false) => {
  if (disableActions.value) {
    return;
  }

  if (initialProductType.value == null) {
    Toast.error(t('properties.rule.error.noProductType'));
    return
  }

  saveLoading.value = true;
  try {
    const isCreateAction = !currentRuleId.value;
    const entry = await persistRule();

    if (!entry) {
      Toast.error(t('shared.alert.toast.unexpectedResult'));
      return;
    }

    Toast.success(t(isCreateAction ? 'properties.rule.alert.createSuccess' : 'properties.rule.alert.updateSuccess'))
    if (continueEditing) {
      return
    }

    router.push({name: 'properties.rule.list'});
  } finally {
    saveLoading.value = false;
  }

};

const handleAddedProperties = (addedProperties: Property[]) => {
  updatedAddedProperties.value = addedProperties;
}

const handleRequireEanCodeUpdated = (newVal: boolean) => {
  requireEanCode.value = newVal;
}

const handleDelete = () => {
   router.push({name: 'properties.rule.list'});
}

const handleTemplateSourceUpdated = async (newValue: string) => {
  if (disableActions.value || selectedSalesChannel.value === 'default' || currentRuleId.value) {
    return;
  }

  const normalizedValue = newValue && newValue !== '' ? newValue : getPreferredTemplateSourceKey();
  selectedTemplateSource.value = normalizedValue;

  rightLoading.value = true;
  try {
    const entry = await createMissingRuleEntry(selectedSalesChannel.value, normalizedValue);
    rulesCache.value[selectedSalesChannel.value] = entry;
    applyRuleState(entry);
  } finally {
    rightLoading.value = false;
  }
};

const openDuplicateModal = () => {
  ruleName.value = '';
  showDuplicateModal.value = true;
};

const closeDuplicateModal = () => {
  if (duplicateLoading.value) {
    return;
  }

  showDuplicateModal.value = false;
  ruleName.value = '';
};

const submitDuplicate = async () => {
  if (!currentRuleId.value) {
    Toast.error(t('shared.alert.toast.unexpectedResult'));
    return;
  }

  if (!ruleName.value.trim()) {
    Toast.error(t('properties.rule.duplicate.validation.nameRequired'));
    return;
  }

  duplicateLoading.value = true;

  try {
    const { data } = await apolloClient.mutate({
      mutation: duplicatePropertiesRuleMutation,
      variables: {
        name: ruleName.value.trim(),
        propertyRule: { id: currentRuleId.value, salesChannel: null },
      },
      fetchPolicy: 'network-only',
    });

    const duplicatedId = data?.duplicatePropertiesRule?.id;
    if (duplicatedId) {
      showDuplicateModal.value = false;
      await router.push({ name: 'properties.rule.show', params: { id: duplicatedId } });
      return;
    }

    Toast.error(t('properties.rule.duplicate.error.failed'));
  } catch (error: any) {
    const graphQLError = error?.graphQLErrors?.[0]?.message;
    Toast.error(graphQLError || t('properties.rule.duplicate.error.failed'));
  } finally {
    duplicateLoading.value = false;
  }
};

onMounted(async () => {
  await Promise.all([fetchData(), loadSalesChannels()]);
});

watch(
  () => route.params.id,
  async (newId) => {
    if (!newId) {
      return;
    }

    const newIdStr = String(newId);

    if (ignoreNextRouteChange.value) {
      ignoreNextRouteChange.value = false;
      id.value = newIdStr;
      return;
    }

    id.value = newIdStr;
    currentRuleId.value = newIdStr;
    await fetchData();
  }
);

</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'properties.rule.list' }, name: t('properties.rule.title') },
                   { path: { name: 'properties.rule.edit' }, name: t('properties.rule.edit.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="mt-2 p-4">
        <div v-if="!initialProductType" class="py-12 flex items-center justify-center">
          <LocalLoader :loading="rightLoading || integrationsLoading" />
        </div>
        <ProductPropertiesConfigurator
            v-if="initialProductType"
            :added-properties="initialItems"
            :product-type="initialProductType"
            :require-ean-code="requireEanCode"
            :sales-channel-options="salesChannelOptions"
            :selected-sales-channel="selectedSalesChannel"
            :template-source-options="templateSourceOptions"
            :selected-template-source="selectedTemplateSource"
            :show-template-source-selector="showTemplateSourceSelector"
            :integrations-loading="integrationsLoading"
            :right-loading="rightLoading || saveLoading"
            @update:added-properties="handleAddedProperties"
            @update:require-ean-code="handleRequireEanCodeUpdated"
            @update:sales-channel="handleSalesChannelUpdated"
            @update:template-source="handleTemplateSourceUpdated"
             />

        <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <CancelButton :disabled="disableActions" @click="() => router.push({ name: 'properties.rule.list' })">
            {{ t('shared.button.cancel') }}
          </CancelButton>
          <Link v-if="currentRuleId" :path="{ name: 'properties.rule.show', params: { id: currentRuleId } }">
            <Button type="button" :disabled="disableActions" class="button rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm btn-info ">
              {{ t('shared.button.show') }}
            </Button>
          </Link>
          <Button
            v-if="currentRuleId"
            type="button"
            :disabled="disableActions"
            class="btn btn-outline-primary"
            @click="openDuplicateModal"
          >
            {{ t('shared.button.duplicate') }}
          </Button>
          <ApolloAlertMutation
            v-if="currentRuleId"
            :mutation="deleteProductPropertiesRuleMutation"
            :mutation-variables="{ id: currentRuleId }"
            @done="handleDelete"
          >
            <template v-slot="{ loading: deleting, confirmAndMutate }">
              <DangerButton ref="deleteButtonRef" :disabled="deleting || disableActions" @click="confirmAndMutate">{{ t('shared.button.delete') }}</DangerButton>
            </template>
          </ApolloAlertMutation>
          <SecondaryButton :disabled="disableActions" :loading="saveLoading" @click="handleSaveAndContinue">
            {{ secondaryButtonLabel }}
          </SecondaryButton>
          <PrimaryButton :disabled="disableActions" :loading="saveLoading" @click="handleSave">
            {{ primaryButtonLabel }}
          </PrimaryButton>
        </div>
      </Card>
   </template>
  </GeneralTemplate>

  <Modal v-model="showDuplicateModal" @closed="closeDuplicateModal">
    <Card class="modal-content w-full max-w-lg">
      <h3 class="text-lg font-semibold mb-2">{{ t('properties.rule.duplicate.title') }}</h3>
      <p class="text-sm text-gray-600 mb-4">{{ t('properties.rule.duplicate.description') }}</p>

      <TextInput
        :model-value="ruleName"
        :disabled="duplicateLoading"
        :placeholder="t('properties.rule.duplicate.placeholder')"
        class="w-full"
        @update:modelValue="ruleName = String($event || '')"
      />

      <div class="flex justify-end gap-2 mt-6">
        <SecondaryButton :disabled="duplicateLoading" @click="closeDuplicateModal">
          {{ t('shared.button.cancel') }}
        </SecondaryButton>
        <PrimaryButton :loading="duplicateLoading" :disabled="duplicateLoading" @click="submitDuplicate">
          {{ t('shared.button.submit') }}
        </PrimaryButton>
      </div>
    </Card>
  </Modal>
</template>
