<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import RemotelyMappedRemoteProductType from '../remote-product-types/containers/RemotelyMappedRemoteProductType.vue';
import { miraklMappedRemoteProductTypeConfig } from '../remote-product-types/configs';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { Link } from '../../../../../../../../shared/components/atoms/link';
import { Modal } from '../../../../../../../../shared/components/atoms/modal';
import miraklTemplatePlaceholder from '../../../../../../../../assets/images/integrations/mirakl/template-download-placeholder.png';

defineProps<{ productType: any | null }>();

const { t } = useI18n();
const showImageModal = ref(false);
</script>

<template>
  <RemotelyMappedRemoteProductType :product-type="productType" :config="miraklMappedRemoteProductTypeConfig">
    <template #help-section>
      <div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div class="bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5 border-b border-slate-200">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            {{ t('integrations.show.mirakl.productRules.templateHelp.eyebrow') }}
          </p>
          <h2 class="mt-2 text-xl font-semibold text-slate-900">
            {{ t('integrations.show.mirakl.productRules.templateHelp.title') }}
          </h2>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            {{ t('integrations.show.mirakl.productRules.templateHelp.description') }}
          </p>
        </div>

        <div class="space-y-5 p-5">
          <ol class="space-y-3">
            <li class="flex gap-3 text-sm leading-6 text-slate-600">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">1</span>
              <span>{{ t('integrations.show.mirakl.productRules.templateHelp.steps.step1') }}</span>
            </li>
            <li class="flex gap-3 text-sm leading-6 text-slate-600">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">2</span>
              <span>{{ t('integrations.show.mirakl.productRules.templateHelp.steps.step2') }}</span>
            </li>
            <li class="flex gap-3 text-sm leading-6 text-slate-600">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">3</span>
              <span>{{ t('integrations.show.mirakl.productRules.templateHelp.steps.step3') }}</span>
            </li>
            <li class="flex gap-3 text-sm leading-6 text-slate-600">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">4</span>
              <span>{{ t('integrations.show.mirakl.productRules.templateHelp.steps.step4') }}</span>
            </li>
          </ol>

          <button
            type="button"
            class="group relative block w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-left"
            @click="showImageModal = true"
          >
            <img
              :src="miraklTemplatePlaceholder"
              :alt="t('integrations.show.mirakl.productRules.templateHelp.imageAlt')"
              class="h-auto w-full transition duration-200 group-hover:scale-[1.01]"
            />

            <span class="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition group-hover:bg-slate-900/25">
              <span class="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-slate-700 opacity-0 shadow-sm transition group-hover:opacity-100">
                <Icon name="search" size="lg" />
              </span>
            </span>
          </button>
        </div>
      </div>

      <Modal v-model="showImageModal" @closed="showImageModal = false">
        <div class="w-[min(96vw,1400px)] rounded-[1.5rem] bg-white p-4 sm:p-6">
          <div class="mb-3 flex justify-end">
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
              @click="showImageModal = false"
            >
              <Icon name="x" size="sm" />
            </button>
          </div>

          <img
            :src="miraklTemplatePlaceholder"
            :alt="t('integrations.show.mirakl.productRules.templateHelp.imageAlt')"
            class="max-h-[86vh] w-full rounded-xl border border-slate-200 bg-slate-50 object-contain"
          />
        </div>
      </Modal>
    </template>

    <template #schema="{ mappedItems, helpers }">
      <div class="max-h-[700px] overflow-y-auto rounded-md custom-scrollbar overflow-x-auto">
        <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
          <thead>
            <tr>
              <th class="p-2 text-left">{{ t('shared.labels.name') }}</th>
              <th class="p-2 text-left">{{ t('shared.labels.code') }}</th>
              <th class="p-2 text-left">{{ t('integrations.show.mirakl.properties.labels.requirementLevel') }}</th>
              <th class="p-2 text-left">{{ t('integrations.show.mirakl.productRules.labels.required') }}</th>
              <th class="p-2 text-left">{{ t('integrations.show.mirakl.productRules.labels.variant') }}</th>
              <th class="p-2 text-left">{{ t('integrations.show.mapping.mappedLocally') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="entry in mappedItems" :key="entry.item.id">
              <td class="p-2">
                <div class="flex flex-col">
                  <Link v-if="entry.propertyPath" :path="entry.propertyPath" class="font-medium">
                    {{ helpers.getItemName(entry.item) }}
                  </Link>
                  <span v-else class="font-medium">{{ helpers.getItemName(entry.item) }}</span>
                  <span v-if="entry.item.localInstance?.property?.name" class="text-xs text-gray-500">
                    {{ entry.item.localInstance.property.name }}
                  </span>
                </div>
              </td>
              <td class="p-2">{{ helpers.getItemCode(entry.item) || '—' }}</td>
              <td class="p-2">{{ entry.item.requirementLevel || '—' }}</td>
              <td class="p-2">
                <Icon v-if="entry.item.required" name="check-circle" class="text-green-500" />
                <Icon v-else name="times-circle" class="text-red-500" />
              </td>
              <td class="p-2">
                <Icon v-if="entry.item.variant" name="check-circle" class="text-green-500" />
                <Icon v-else name="times-circle" class="text-red-500" />
              </td>
              <td class="p-2">
                <Icon v-if="helpers.isItemMappedLocally(entry.item)" name="check-circle" class="text-green-500" />
                <Icon v-else name="times-circle" class="text-red-500" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </RemotelyMappedRemoteProductType>
</template>
