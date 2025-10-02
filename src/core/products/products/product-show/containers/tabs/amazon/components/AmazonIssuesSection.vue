<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { Link } from '../../../../../../../../shared/components/atoms/link';

interface AmazonProductIssue {
  id: string;
  message?: string | null;
  severity?: string | null;
  createdAt?: string | null;
}

interface VariationValidationIssues {
  productId: string;
  localInstance?: {
    id: string;
    name?: string | null;
    sku?: string | null;
  } | null;
  issues: AmazonProductIssue[];
}

type VariationOtherIssues = VariationValidationIssues;

const props = defineProps<{
  validationIssues: AmazonProductIssue[];
  otherIssues: AmazonProductIssue[];
  isConfigurable: boolean;
  variationValidationIssues: VariationValidationIssues[];
  variationOtherIssues: VariationOtherIssues[];
}>();

const { t } = useI18n();

const variationValidationIssues = ref<VariationValidationIssues[]>(props.variationValidationIssues ?? []);
const variationOtherIssues = ref<VariationOtherIssues[]>(props.variationOtherIssues ?? []);

watch(
  () => props.variationValidationIssues,
  (newVariationValidationIssues) => {
    variationValidationIssues.value = newVariationValidationIssues ?? [];
  }
);

watch(
  () => props.variationOtherIssues,
  (newVariationOtherIssues) => {
    variationOtherIssues.value = newVariationOtherIssues ?? [];
  }
);

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const getVariationIdentifier = (variation: VariationValidationIssues) =>
  variation.localInstance?.sku ||
  variation.localInstance?.name ||
  t('products.products.amazon.unnamedVariation');
</script>

<template>
  <div>
    <div class="mb-4">
      <h4 class="font-semibold mb-2">{{ t('products.products.amazon.validationIssues') }}</h4>
      <p class="text-xs text-gray-500 mb-2">{{ t('products.products.amazon.validationIssuesDescription') }}</p>
      <div v-if="validationIssues.length">
        <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
          <thead>
            <tr>
              <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.message') }}</th>
              <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.severity') }}</th>
              <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.fetchedAt') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="issue in validationIssues" :key="issue.id">
              <td class="break-words max-w-xs">{{ issue.message }}</td>
              <td
                class="capitalize flex items-center gap-1"
                :class="{ 'text-red-600': issue.severity === 'ERROR', 'text-yellow-600': issue.severity === 'WARNING' }"
              >
                <Icon :name="issue.severity === 'ERROR' ? 'circle-xmark' : 'circle-exclamation'" class="w-4 h-4" />
                {{ issue.severity }}
              </td>
              <td>{{ formatDate(issue.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-sm text-gray-500">
        {{ t('shared.labels.noIssues') }}
      </div>

      <div v-if="isConfigurable" class="mt-4 space-y-3">
        <div v-if="variationValidationIssues.length" class="space-y-4">
          <h4 class="font-semibold mb-2">{{ t('products.products.amazon.variationValidationIssuesNote') }}</h4>
          <div
            v-for="variation in variationValidationIssues"
            :key="variation.productId"
            class="border border-gray-200 rounded-md"
          >
            <div class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
              <span class="font-semibold text-sm">
                {{ t('products.products.amazon.variationIssuesHeading', { identifier: getVariationIdentifier(variation) }) }}
              </span>
              <Link
                v-if="variation.localInstance?.id"
                class="flex items-center gap-1 text-xs text-primary hover:underline"
                :path="{ name: 'products.products.show', params: { id: variation.localInstance.id } }"
                target="_blank"
              >
                <Icon name="eye" class="w-3 h-3 mr-1" />
                <span>{{ t('products.products.amazon.openVariation') }}</span>
              </Link>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
                <thead>
                  <tr>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.message') }}</th>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.severity') }}</th>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.fetchedAt') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="issue in variation.issues" :key="issue.id">
                    <td class="break-words max-w-xs">{{ issue.message }}</td>
                    <td
                      class="capitalize flex items-center gap-1"
                      :class="{ 'text-red-600': issue.severity === 'ERROR', 'text-yellow-600': issue.severity === 'WARNING' }"
                    >
                      <Icon :name="issue.severity === 'ERROR' ? 'circle-xmark' : 'circle-exclamation'" class="w-4 h-4" />
                      {{ issue.severity }}
                    </td>
                    <td>{{ formatDate(issue.createdAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div v-if="variationOtherIssues.length" class="space-y-4">
          <h4 class="font-semibold mb-2">{{ t('products.products.amazon.variationOtherIssuesNote') }}</h4>
          <div
            v-for="variation in variationOtherIssues"
            :key="variation.productId"
            class="border border-gray-200 rounded-md"
          >
            <div class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
              <span class="font-semibold text-sm">
                {{ t('products.products.amazon.variationIssuesHeading', { identifier: getVariationIdentifier(variation) }) }}
              </span>
              <Link
                v-if="variation.localInstance?.id"
                class="flex items-center gap-1 text-xs text-primary hover:underline"
                :path="{ name: 'products.products.show', params: { id: variation.localInstance.id } }"
                target="_blank"
              >
                <Icon name="eye" class="w-3 h-3 mr-1" />
                <span>{{ t('products.products.amazon.openVariation') }}</span>
              </Link>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
                <thead>
                  <tr>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.message') }}</th>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.severity') }}</th>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.fetchedAt') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="issue in variation.issues" :key="issue.id">
                    <td class="break-words max-w-xs">{{ issue.message }}</td>
                    <td
                      class="capitalize flex items-center gap-1"
                      :class="{ 'text-red-600': issue.severity === 'ERROR', 'text-yellow-600': issue.severity === 'WARNING' }"
                    >
                      <Icon :name="issue.severity === 'ERROR' ? 'circle-xmark' : 'circle-exclamation'" class="w-4 h-4" />
                      {{ issue.severity }}
                    </td>
                    <td>{{ formatDate(issue.createdAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t my-4"></div>

    <div>
      <h4 class="font-semibold mb-2">{{ t('products.products.amazon.otherIssues') }}</h4>
      <p class="text-xs text-gray-500 mb-2">{{ t('products.products.amazon.otherIssuesDescription') }}</p>
      <div v-if="otherIssues.length">
        <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
          <thead>
            <tr>
              <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.message') }}</th>
              <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.severity') }}</th>
              <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.fetchedAt') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="issue in otherIssues" :key="issue.id">
              <td class="break-words max-w-xs">{{ issue.message }}</td>
              <td
                class="capitalize flex items-center gap-1"
                :class="{ 'text-red-600': issue.severity === 'ERROR', 'text-yellow-600': issue.severity === 'WARNING' }"
              >
                <Icon :name="issue.severity === 'ERROR' ? 'circle-xmark' : 'circle-exclamation'" class="w-4 h-4" />
                {{ issue.severity }}
              </td>
              <td>{{ formatDate(issue.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-sm text-gray-500">
        {{ t('shared.labels.noIssues') }}
      </div>
    </div>
  </div>
</template>

