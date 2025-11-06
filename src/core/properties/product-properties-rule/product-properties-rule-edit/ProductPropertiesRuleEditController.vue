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
import { completeCreateProductPropertiesRuleMutation, completeUpdateProductPropertiesRuleMutation, deleteProductPropertiesRuleMutation } from "../../../../shared/api/mutations/properties.js";
import { integrationsQuery } from "../../../../shared/api/queries/integrations.js";
import {DangerButton} from "../../../../shared/components/atoms/button-danger";
import {FormType} from "../../../../shared/components/organisms/general-form/formConfig";
import {ApolloAlertMutation} from "../../../../shared/components/molecules/apollo-alert-mutation";
import { Property } from "../../../../shared/components/organisms/product-properties-configurator/ProductPropertiesConfigurator.vue";
import {Loader} from "../../../../shared/components/atoms/loader";
import {Link} from "../../../../shared/components/atoms/link";
import {Button} from "../../../../shared/components/atoms/button";

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
const loading = ref(false);
const requireEanCode = ref(false);
const selectedSalesChannel = ref<'default' | string>('default');
const previousSalesChannel = ref<'default' | string>('default');
const rulesCache: Ref<Record<string, RuleCacheEntry>> = ref({});
const rawSalesChannels = ref<{ label: string; value: string }[]>([]);
const ignoreNextRouteChange = ref(false);

const salesChannelOptions = computed(() => [
  { label: t('properties.rule.labels.defaultSalesChannel'), value: 'default' },
  ...rawSalesChannels.value
]);

const primaryButtonLabel = computed(() =>
  t(currentRuleId.value ? 'shared.button.save' : 'shared.button.create')
);

const getCacheKey = (salesChannelId: string | null | undefined) =>
  salesChannelId ?? 'default';

const formatSalesChannelLabel = (channel?: { id?: string | null; name?: string | null; hostname?: string | null; type?: string | null }) => {
  if (!channel) {
    return t('properties.rule.labels.defaultSalesChannel');
  }

  return (
    channel.name ||
    channel.hostname ||
    channel.type ||
    channel.id ||
    t('properties.rule.labels.unknownSalesChannel')
  );
};

const cloneRuleEntry = (entry: RuleCacheEntry): RuleCacheEntry => ({
  id: entry.id,
  requireEanCode: entry.requireEanCode,
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

const createRuleFromDefault = (defaultEntry: RuleCacheEntry, salesChannelId: string | null): RuleCacheEntry => {
  const items = defaultEntry.items.map((item, index) => ({
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
    requireEanCode: defaultEntry.requireEanCode,
    items,
    itemsMap,
    salesChannel: salesChannelId
      ? { id: salesChannelId, name: null, type: null, hostname: null }
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
    salesChannel: node.salesChannel
      ? {
          id: node.salesChannel.id ?? null,
          name: node.salesChannel.name ?? null,
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

const ensureDefaultRule = async () => {
  if (rulesCache.value['default']) {
    return;
  }

  await fetchRuleBySalesChannel('default');
};

const loadSalesChannels = async () => {
  try {
    const { data } = await apolloClient.query({ query: integrationsQuery, fetchPolicy: 'cache-first' });
    const nodes = data?.integrations?.edges?.map((edge: any) => edge.node) ?? [];
    const optionsMap = new Map<string, { label: string; value: string }>();

    nodes.forEach((node: any) => {
      const type = (node.type || '').toLowerCase();
      if (type === WEBHOOK_CHANNEL_TYPE) {
        return;
      }

      const channelId = node.saleschannelPtr?.id;
      if (!channelId || optionsMap.has(channelId)) {
        return;
      }

      const label = formatSalesChannelLabel(node.saleschannelPtr || node);
      optionsMap.set(channelId, { value: channelId, label });
    });

    rawSalesChannels.value = Array.from(optionsMap.values());
  } catch (_error) {
    rawSalesChannels.value = [];
  }
};

const updateRouteId = async (newRuleId: string) => {
  const newId = String(newRuleId);
  if (route.params.id === newId) {
    id.value = newId;
    return;
  }

  ignoreNextRouteChange.value = true;
  await router.replace({ name: 'properties.rule.edit', params: { id: newId } });
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
  const normalizedValue = newValue && newValue !== '' ? newValue : 'default';

  if (normalizedValue === selectedSalesChannel.value) {
    return;
  }

  if (hasUnsavedChanges.value) {
    const confirmed = window.confirm(t('properties.rule.messages.unsavedChanges'));
    if (!confirmed) {
      selectedSalesChannel.value = previousSalesChannel.value;
      return;
    }
  }

  selectedSalesChannel.value = normalizedValue;
  previousSalesChannel.value = normalizedValue;

  loading.value = true;
  try {
    let entry: RuleCacheEntry | null = rulesCache.value[normalizedValue] ?? null;
    if (!entry) {
      entry = await fetchRuleBySalesChannel(normalizedValue);
    }

    if (!entry) {
      await ensureDefaultRule();
      const defaultEntry = rulesCache.value['default'];
      if (defaultEntry) {
        entry = createRuleFromDefault(defaultEntry, normalizedValue === 'default' ? null : normalizedValue);
      } else {
        entry = {
          id: null,
          requireEanCode: false,
          items: [],
          itemsMap: {},
          salesChannel:
            normalizedValue === 'default'
              ? null
              : { id: normalizedValue, name: null, type: null, hostname: null },
        };
      }

      rulesCache.value[normalizedValue] = entry;
    }

    if (!entry) {
      return;
    }

    applyRuleState(entry);

    if (entry.salesChannel?.id) {
      addSalesChannelOptionIfMissing(entry);
    }

    if (entry.id) {
      await updateRouteId(entry.id);
    }
  } finally {
    loading.value = false;
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
  applyRuleState(entry);

  if (entry.id) {
    await updateRouteId(entry.id);
  }

  return entry;
};

const fetchData = async () => {
  loading.value = true;
  propertiesItemsMap.value = {};
  initialItems.value = [];
  updatedAddedProperties.value = [];

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
    const entry = transformRuleNode(rule);
    const key = getCacheKey(entry.salesChannel?.id ?? null);
    rulesCache.value[key] = entry;
    addSalesChannelOptionIfMissing(entry);
    selectedSalesChannel.value = key;
    previousSalesChannel.value = key;
    applyRuleState(entry);

    if (key !== 'default') {
      await ensureDefaultRule();
    }
  } finally {
    loading.value = false;
  }
};

const handleSave = () => saveMutations(false);
const handleSaveAndContinue = () => saveMutations(true);
const saveMutations = async (continueEditing = false) => {

  if (initialProductType.value == null) {
    Toast.error(t('properties.rule.error.noProductType'));
    return
  }

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
        <Loader :loading="loading" />
        <ProductPropertiesConfigurator
            v-if="initialProductType"
            :added-properties="initialItems"
            :product-type="initialProductType"
            :require-ean-code="requireEanCode"
            :sales-channel-options="salesChannelOptions"
            :selected-sales-channel="selectedSalesChannel"
            @update:added-properties="handleAddedProperties"
            @update:require-ean-code="handleRequireEanCodeUpdated"
            @update:sales-channel="handleSalesChannelUpdated"
             />

        <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <CancelButton @click="() => router.push({ name: 'properties.rule.list' })">
            {{ t('shared.button.cancel') }}
          </CancelButton>
          <Link v-if="currentRuleId" :path="{ name: 'properties.rule.show', params: { id: currentRuleId } }">
            <Button type="button" class="button rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm btn-info ">
              {{ t('shared.button.show') }}
            </Button>
          </Link>
          <ApolloAlertMutation
            v-if="currentRuleId"
            :mutation="deleteProductPropertiesRuleMutation"
            :mutation-variables="{ id: currentRuleId }"
            @done="handleDelete"
          >
            <template v-slot="{ loading: deleting, confirmAndMutate }">
              <DangerButton ref="deleteButtonRef" :disabled="deleting" @click="confirmAndMutate">{{ t('shared.button.delete') }}</DangerButton>
            </template>
          </ApolloAlertMutation>
          <SecondaryButton @click="handleSaveAndContinue">
            {{ t('shared.button.saveAndContinue') }}
          </SecondaryButton>
          <PrimaryButton @click="handleSave">
            {{ primaryButtonLabel }}
          </PrimaryButton>
        </div>
      </Card>
   </template>
  </GeneralTemplate>
</template>