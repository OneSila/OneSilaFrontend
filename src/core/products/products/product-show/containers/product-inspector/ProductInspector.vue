<script setup lang="ts">

import { Product } from "../../../configs";
import { useI18n } from "vue-i18n";
import { Link } from "../../../../../../shared/components/atoms/link";
import { Icon } from "../../../../../../shared/components/atoms/icon";
import { inspectorSubscription } from "../../../../../../shared/api/subscriptions/products.js";
import { ApolloSubscription } from "../../../../../../shared/components/molecules/apollo-subscription";
import { Url } from "../../../../../../shared/utils/constants";
import {Button} from "../../../../../../shared/components/atoms/button";
import apolloClient from "../../../../../../../apollo-client";
import { refreshInspectorMutation } from "../../../../../../shared/api/mutations/products.js";
import {Toast} from "../../../../../../shared/modules/toast";
import {useRoute, useRouter} from "vue-router";
import { computed, ref, Ref } from "vue";

interface InspectorSubscriptionResult {
  inspector: {
    hasMissingInformation: boolean;
    hasMissingOptionalInformation: boolean;
    color: string | number;
    errors: InspectorErrorItem[];
  };
}

interface InspectorErrorBlock {
  code: string | number;
  fixingMessage?: string | null;
  message?: string | null;
  error_message?: string | null;
  errorCode?: string | number;
}

type InspectorErrorItem = string | number | InspectorErrorBlock;

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const props = defineProps<{ product: Product }>();
const color: Ref<string | number> = ref('');
const errors: Ref<InspectorErrorItem[]> = ref([]);
const fixingMessageByCode = computed(() => {
  const blocks = (props.product as Product & {
    percentageInspectorStatus?: {
      blocks?: Array<{ code?: string | number; fixingMessage?: string | null }>;
    };
  }).percentageInspectorStatus?.blocks ?? [];
  const map = new Map<number, string>();

  for (const block of blocks) {
    const code = Number(block.code);
    const fixingMessage = (block.fixingMessage ?? '').toString().trim();
    if (!Number.isNaN(code) && fixingMessage) {
      map.set(code, fixingMessage);
    }
  }

  return map;
});

const getColor = (hasMissingInformation, hasMissingOptionalInformation) => {
  const STATUS_RED = 1;
  const STATUS_ORANGE = 2;
  const STATUS_GREEN = 3;

  if (hasMissingInformation) {
    return  STATUS_RED;
  } else if (hasMissingOptionalInformation) {
    return STATUS_ORANGE;
  } else {
    return STATUS_GREEN;
  }
}
const refetchData = (result) => {
  const r: InspectorSubscriptionResult = result;

  color.value = getColor(r.inspector.hasMissingInformation, r.inspector.hasMissingOptionalInformation)
  errors.value = r.inspector['errors'];

  return true;
}
function bgColorClass(color) {
  switch (color) {
    case 1: return 'bg-red-500';
    case 2: return 'bg-orange-400';
    case 3: return 'bg-green-500';
    default: return 'bg-gray-200';
  }
}

function bgColorHoverClass(color) {
  switch (color) {
    case 1: return 'hover:bg-red-50';
    case 2: return 'hover:bg-orange-50';
    default: return 'hover:bg-gray-100';
  }
}

function textColorClass(color) {
  switch (color) {
    case 1: return 'text-red-800';
    case 2: return 'text-orange-600';
    default: return 'text-gray-100';
  }
}

function iconColorClass(color) {
  switch (color) {
    case 1: return 'text-red-500';
    case 2: return 'text-orange-400';
    default: return 'text-gray-200';
  }
}

function buttonColorClass(color) {
  switch (color) {
    case 1: return 'bg-red-500 border-red-500';
    case 2: return 'bg-orange-400 border-orange-400';
    default: return 'bg-orange-400 border-gray-200';
  }
}

function getInspectorLabel(color) {
  switch (color) {
    case 1:
      return t('products.products.inspector.labels.missingInfo');
    case 2:
      return t('products.products.inspector.labels.missingOptionalInfo');
    case 3:
      return t('products.products.inspector.labels.perfect');
    default:
      return '';
  }
}

function getErrorCode(error: InspectorErrorItem): number {
  const rawCode = typeof error === 'object' && error !== null
    ? (error.code ?? error.errorCode ?? 0)
    : error;
  const parsed = Number(rawCode);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeMessage(value: unknown): string | null {
  const message = (value ?? '').toString().trim();
  return message || null;
}

function getFixingMessage(error: InspectorErrorItem): string | null {
  if (typeof error === 'object' && error !== null) {
    const directMessage = normalizeMessage(error.fixingMessage)
      || normalizeMessage(error.message)
      || normalizeMessage(error.error_message);
    if (directMessage) {
      return directMessage;
    }
  }
  return fixingMessageByCode.value.get(getErrorCode(error)) ?? null;
}

function getErrorTitle(error: InspectorErrorItem): string {
  return t(`products.products.inspector.errors.${getErrorCode(error)}`);
}

function getErrorHelp(error: InspectorErrorItem): string {
  return getFixingMessage(error) || t('products.products.inspector.help.generic');
}

function getErrorKey(error: InspectorErrorItem, index: number): string {
  return `${getErrorCode(error)}-${index}`;
}

const urlMap: Record<number, Url> = {
  // 101: { name: 'products.products.show', params: { id: props.product.id }, query: { tab: 'media' } },
};

const tabMap: Record<number, string> = {
  101: 'media',
  102: 'price',
  103: 'variations',
  104: 'variations',
  105: 'variations',
  106: 'variations',
  107: 'variations',
  108: 'supplierProducts',
  109: 'eanCodes',
  110: 'properties',
  111: 'properties',
  112: 'properties',
  113: 'price',
  115: 'general',
  116: 'priceLists',
  117: 'variations',
  119: 'variations',
  120: 'variations',
  121: 'variations',
  122: 'variations',
  123: 'variations',
  124: 'properties',
  125: 'amazon',
  126: 'amazon',
  127: 'media',
  128: 'media',
};

function setTab(tabName: string) {
  router.push({ query: { ...route.query, tab: tabName } });
}

const refreshInspector = async () => {
  const {data} = await apolloClient.mutate({
    mutation: refreshInspectorMutation,
    variables: {data: { id: props.product.inspector.id }}

  });

  if (data && data.refreshInspector) {

    errors.value = data.refreshInspector.errors;
    color.value = getColor(data.refreshInspector.hasMissingInformation, data.refreshInspector.hasMissingOptionalInformation)

    Toast.success(t('products.products.inspector.alert.refreshSuccess'))
    window.location.reload();
  }
}

</script>

<template>
  <ApolloSubscription :subscription="inspectorSubscription" :variables="{ pk: product.inspector?.id }">
    <template v-slot:default="{ loading, error, result }">
      <template v-if="!loading && result && refetchData(result)">
        <div class="relative flex h-full min-h-0 flex-col overflow-hidden rounded-lg p-2 shadow" :class="[bgColorClass(color)]">
          <div class="px-4 py-4 sm:p-4 flex justify-between items-center">
            <h3 class="text-lg font-semibold leading-6 text-white">
              {{ getInspectorLabel(color) }}
            </h3>
            <Button @click="refreshInspector" class="text-white">
              <Icon name="refresh" class="h-6 w-6" />
            </Button>
          </div>
          <hr>
          <div class="mt-1 flex min-h-0 flex-1 flex-col overflow-hidden">
            <template v-if="errors.length === 0">
              <div class="rounded-md bg-white hover:bg-green-100 p-5 flex items-center">
                <Icon name="check-circle" class="h-6 w-6 text-green-500" />
                <span class="ml-3 text-sm font-medium text-green-800">{{ t('products.products.inspector.labels.noMissingInfo') }}</span>
              </div>
            </template>
            <template v-else>
              <div class="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
                <div v-for="(errorItem, index) in errors" :key="getErrorKey(errorItem, index)" class="rounded-md p-3 my-1 flex items-start justify-between bg-white group" :class="bgColorHoverClass(color)">
                  <div class="flex items-start">
                    <Icon name="circle-exclamation" class="h-6 w-6" :class="iconColorClass(color)" />
                    <div class="ml-4">
                      <div class="text-sm font-medium" :class="textColorClass(color)">
                        {{ getErrorTitle(errorItem) }}
                      </div>
                    <div class="mt-0.5 text-sm hidden group-hover:block" :class="textColorClass(color)">
                      {{ getErrorHelp(errorItem) }}
                    </div>
                    </div>
                  </div>
                  <div v-if="urlMap[getErrorCode(errorItem)] || tabMap[getErrorCode(errorItem)]" class="mt-4 sm:mt-0 sm:flex-shrink-0">
                    <Button
                      v-if="urlMap[getErrorCode(errorItem)]"
                      class="inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm border"
                      :class="buttonColorClass(color)"
                    >
                      <Link :path="urlMap[getErrorCode(errorItem)]">
                        {{ t('shared.button.fix') }}
                      </Link>
                    </Button>
                    <Button
                      v-else-if="tabMap[getErrorCode(errorItem)]"
                      @click="setTab(tabMap[getErrorCode(errorItem)])"
                      class="inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm border"
                      :class="buttonColorClass(color)"
                    >
                      {{ t('shared.button.fix') }}
                    </Button>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </template>
  </ApolloSubscription>
</template>

<style scoped>

.custom-scrollbar::-webkit-scrollbar {
  width: 10px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #ffffff;
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #c0c0c0;
}

.custom-scrollbar {
  padding-right: 15px;
}

</style>
