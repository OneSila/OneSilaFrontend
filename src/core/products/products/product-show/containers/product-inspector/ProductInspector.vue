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
import {ref, Ref} from "vue";

interface InspectorSubscriptionResult {
  inspector: {
    hasMissingInformation: boolean;
    hasMissingOptionalInformation: boolean;
    color: string | number;
    errors: string[];
  };
}

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const props = defineProps<{ product: Product }>();
const color: Ref<string | number> = ref('');
const errors: Ref<string[]> = ref([]);

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
  114: 'inventory',
  115: 'general',
  116: 'priceLists',
  117: 'variations',
  118: 'variations',
  119: 'variations',
  120: 'variations',
  121: 'variations',
  122: 'variations',
  123: 'variations',
  124: 'properties',
};

function setTab(tabName: string) {
  router.push({ query: { ...route.query, tab: tabName } });
}

const refreshInspector = async () => {
  const {data} = await apolloClient.mutate({
    mutation: refreshInspectorMutation,
    variables: {data: { id: props.product.inspector.id }}

  });

  if (data && data.refreshInepsctor) {

    errors.value = data.refreshInepsctor.errors;
    color.value = getColor(data.refreshInepsctor.hasMissingInformation, data.refreshInepsctor.hasMissingOptionalInformation)

    Toast.success(t('products.products.inspector.alert.refreshSuccess'))
  }
}

</script>

<template>
  <ApolloSubscription :subscription="inspectorSubscription" :variables="{ pk: product.inspector?.id }">
    <template v-slot:default="{ loading, error, result }">
      <template v-if="!loading && result && refetchData(result)">
        <div class="p-2" :class="['shadow sm:rounded-lg relative', bgColorClass(color)]">
          <div class="px-4 py-4 sm:p-4 flex justify-between items-center">
            <h3 class="text-lg font-semibold leading-6 text-white">
              {{ getInspectorLabel(color) }}
            </h3>
            <Button @click="refreshInspector" class="text-white">
              <Icon name="refresh" class="h-6 w-6" />
            </Button>
          </div>
          <hr>
          <div class="mt-1 space-y-4">
            <template v-if="errors.length === 0">
              <div class="rounded-md bg-white hover:bg-green-100 p-5 flex items-center">
                <Icon name="check-circle" class="h-6 w-6 text-green-500" />
                <span class="ml-3 text-sm font-medium text-green-800">{{ t('products.products.inspector.labels.noMissingInfo') }}</span>
              </div>
            </template>
            <template v-else>
            <div class="custom-scrollbar overflow-y-auto max-h-48 space-y-4">
                <div v-for="errorCode in errors" :key="errorCode" class="rounded-md p-3 my-1 flex items-start justify-between bg-white group" :class="bgColorHoverClass(color)">
                  <div class="flex items-start">
                    <Icon name="circle-exclamation" class="h-6 w-6" :class="iconColorClass(color)" />
                    <div class="ml-4">
                      <div class="text-sm font-medium" :class="textColorClass(color)">
                        {{ t(`products.products.inspector.errors.${errorCode}`) }}
                      </div>
                    <div class="mt-0.5 text-sm hidden group-hover:block" :class="textColorClass(color)">
                      {{ t(`products.products.inspector.help.${errorCode}`) }}
                    </div>
                    </div>
                  </div>
                  <div v-if="urlMap[errorCode] || tabMap[errorCode]" class="mt-4 sm:mt-0 sm:flex-shrink-0">
                    <Button
                      v-if="urlMap[errorCode]"
                      class="inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm border"
                      :class="buttonColorClass(color)"
                    >
                      <Link :path="urlMap[errorCode]">
                        {{ t('shared.button.fix') }}
                      </Link>
                    </Button>
                    <Button
                      v-else-if="tabMap[errorCode]"
                      @click="setTab(tabMap[errorCode])"
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
/* Custom scrollbar styling */
.custom-scrollbar::-webkit-scrollbar {
  width: 10px; /* Adjust the width of the scrollbar */
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent; /* Make the track invisible or apply a custom color */
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #ffffff; /* Color of the scrollbar thumb */
  border-radius: 10px; /* Rounded corners */
  border: 2px solid transparent; /* Adds space around thumb for a floating effect */
  background-clip: padding-box;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #c0c0c0; /* Darker color on hover */
}

.custom-scrollbar {
  padding-right: 15px; /* Add padding to move content away from the scrollbar */
}
</style>