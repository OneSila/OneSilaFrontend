<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../apollo-client';
import { Toggle } from '../../atoms/toggle';
import { Checkbox } from '../../atoms/checkbox';
import { Button } from '../../atoms/button';
import { IntegrationsSelector } from '../../molecules/integrations-selector';
import { TextEditor } from '../../atoms/input-text-editor';
import { remoteLanguagesQuery } from '../../../api/queries/salesChannels.js';
import { companyLanguagesQuery } from '../../../api/queries/languages.js';
import { formatIntegrationLabel } from '../../../utils';

interface IntegrationChannel {
  id: string;
  proxyId?: string | null;
  hostname?: string | null;
  type?: string | null;
  active?: boolean | null;
}

interface LanguageOption {
  id: string;
  localCode: string | null;
  selected: boolean;
}

const props = defineProps<{
  productCount: number;
  salesChannels: IntegrationChannel[];
  initialSalesChannelIds?: string[];
}>();

const emit = defineEmits<{
  (e: 'submit', payload: any): void;
  (e: 'cancel'): void;
}>();

const { t } = useI18n();

const overrideExisting = ref(false);
const previewMode = ref(false);
const additionalInformations = ref('');
const selectedChannelIds = ref<string[]>(props.initialSalesChannelIds || []);
const channelLanguages = reactive<Record<string, { loading: boolean; languages: LanguageOption[] }>>({});
const companyLanguageMap = ref<Record<string, string>>({});
const companyLanguages = ref<Array<{ code: string; name?: string | null }>>([]);

const PRODUCT_LIMIT = 5;

const activeChannels = computed(() => props.salesChannels || []);
const salesChannelOptionsCount = computed(() => activeChannels.value.length + 1);

const formatSalesChannelLabel = (channel?: IntegrationChannel) => {
  if (!channel) {
    return t('shared.components.organisms.advancedContentGenerator.unknownChannel');
  }
  const label = formatIntegrationLabel(channel);
  return label || t('shared.components.organisms.advancedContentGenerator.unknownChannel');
};

const resolveSalesChannelLabel = (channelId: string) => {
  if (channelId === 'default') {
    return t('shared.labels.default');
  }
  return formatSalesChannelLabel(activeChannels.value.find((item) => item.id === channelId));
};

const normalizeLocalCode = (value: any): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.code || value.id || null;
  }
  return null;
};

const fetchCompanyLanguages = async () => {
  const { data } = await apolloClient.query({
    query: companyLanguagesQuery,
    fetchPolicy: 'cache-first',
  });
  const languages = data?.companyLanguages ?? [];
  companyLanguages.value = languages;
  const map: Record<string, string> = {};
  languages.forEach((language: any) => {
    map[language.code] = language.name || language.code;
  });
  companyLanguageMap.value = map;
  return languages;
};

const fetchLanguagesForChannel = async (channelId: string) => {
  channelLanguages[channelId] = { loading: true, languages: [] };

  if (channelId === 'default') {
    const languages = companyLanguages.value.length ? companyLanguages.value : await fetchCompanyLanguages();
    const mapped = languages.map((language: any) => ({
      id: language.code,
      localCode: language.code,
      selected: true,
    }));
    channelLanguages[channelId] = { loading: false, languages: mapped };
    return;
  }

  try {
    const { data } = await apolloClient.query({
      query: remoteLanguagesQuery,
      variables: { filter: { salesChannel: { id: { exact: channelId } } } },
      fetchPolicy: 'cache-first',
    });

    const languageMap = new Map<string, LanguageOption>();
    (data?.remoteLanguages?.edges || []).forEach((edge: any) => {
      const node = edge.node;
      const localCode = normalizeLocalCode(node.localInstance);
      if (!localCode || languageMap.has(localCode)) return;
      languageMap.set(localCode, {
        id: node.id,
        localCode,
        selected: true,
      });
    });

    channelLanguages[channelId] = { loading: false, languages: Array.from(languageMap.values()) };
  } catch (error) {
    channelLanguages[channelId] = { loading: false, languages: [] };
  }
};

const toggleLanguage = (channelId: string, languageId: string, selected: boolean) => {
  const entry = channelLanguages[channelId];
  if (!entry) return;
  const language = entry.languages.find((item) => item.id === languageId);
  if (!language) return;
  language.selected = selected;
};

const isChannelFullySelected = (channelId: string) => {
  const entry = channelLanguages[channelId];
  if (!entry || !entry.languages.length) return false;
  return entry.languages.every((language) => language.selected);
};

const toggleAllLanguages = (channelId: string, selected: boolean) => {
  const entry = channelLanguages[channelId];
  if (!entry) return;
  entry.languages.forEach((language) => {
    language.selected = selected;
  });
};

const salesChannels = computed(() => {
  const instructions: Array<{ salesChannel: { id: string } | null; language: string }> = [];
  selectedChannelIds.value.forEach((channelId) => {
    const entry = channelLanguages[channelId];
    if (!entry) return;
    entry.languages.forEach((language) => {
      if (!language.selected || !language.localCode) return;
      instructions.push({
        salesChannel: channelId === 'default' ? null : { id: channelId },
        language: language.localCode,
      });
    });
  });
  return instructions;
});

const hasMissingLanguages = computed(() =>
  selectedChannelIds.value.some((channelId) => {
    const entry = channelLanguages[channelId];
    if (!entry) return true;
    const selectedLanguages = entry.languages.filter((language) => language.selected);
    return !selectedLanguages.length;
  }),
);

const previewDisabled = computed(() => props.productCount > PRODUCT_LIMIT);
const previewLimitExceeded = computed(() => previewMode.value && props.productCount > PRODUCT_LIMIT);

const canSubmit = computed(() => {
  if (!selectedChannelIds.value.length) return false;
  if (!salesChannels.value.length) return false;
  if (hasMissingLanguages.value) return false;
  if (previewLimitExceeded.value) return false;
  return true;
});

const submit = () => {
  if (!canSubmit.value) return;
  emit('submit', {
    override: overrideExisting.value,
    preview: previewMode.value,
    salesChannels: salesChannels.value,
    additionalInformations: additionalInformations.value.trim() ? additionalInformations.value : null,
  });
};

watch(
  () => selectedChannelIds.value,
  (next, prev) => {
    const previous = new Set(prev || []);
    next.forEach((channelId) => {
      if (!previous.has(channelId)) {
        fetchLanguagesForChannel(channelId);
      }
    });
  },
  { deep: true },
);

watch(previewDisabled, (exceeded) => {
  if (exceeded && previewMode.value) {
    previewMode.value = false;
  }
});

onMounted(() => {
  fetchCompanyLanguages();
  selectedChannelIds.value.forEach((channelId) => {
    fetchLanguagesForChannel(channelId);
  });
});
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-6">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-lg font-semibold">
              {{ t('shared.components.organisms.advancedContentGenerator.formTitle') }}
            </h4>
            <p class="text-sm text-gray-500">
              {{ t('shared.components.organisms.advancedContentGenerator.formDescription') }}
            </p>
          </div>
          <div class="text-sm text-gray-500">
            {{ t('shared.components.organisms.advancedContentGenerator.productCount', { count: props.productCount }) }}
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h5 class="text-sm font-semibold text-gray-700">
              {{ t('shared.components.organisms.advancedContentGenerator.salesChannelsLabel') }}
            </h5>
          </div>
        <div v-if="!salesChannelOptionsCount" class="text-sm text-gray-500">
          {{ t('shared.components.organisms.advancedContentGenerator.salesChannelsEmpty') }}
        </div>
        <IntegrationsSelector
          v-if="salesChannelOptionsCount"
          v-model="selectedChannelIds"
          :integrations="activeChannels"
          :add-default="true"
          :multiple="true"
          :filterable="true"
          :placeholder="t('shared.components.organisms.advancedContentGenerator.salesChannelsPlaceholder')"
        />
      </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <div>
              <div class="text-sm font-medium text-gray-800">
                {{ t('shared.components.organisms.advancedContentGenerator.overrideLabel') }}
              </div>
              <div class="text-xs text-gray-500">
                {{ t('shared.components.organisms.advancedContentGenerator.overrideHelp') }}
              </div>
            </div>
            <Toggle v-model="overrideExisting" />
          </label>
          <label
            class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
            :class="previewDisabled ? 'pointer-events-none opacity-50' : ''"
            :aria-disabled="previewDisabled"
          >
            <div>
              <div class="text-sm font-medium text-gray-800">
                {{ t('shared.components.organisms.advancedContentGenerator.previewLabel') }}
              </div>
              <div class="text-xs text-gray-500">
                {{ t('shared.components.organisms.advancedContentGenerator.previewHelp') }}
              </div>
              <div class="text-xs text-gray-500">
                {{ t('shared.components.organisms.advancedContentGenerator.previewNote') }}
              </div>
            </div>
            <Toggle v-model="previewMode" />
          </label>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-semibold text-gray-700">
          {{ t('shared.components.organisms.advancedContentGenerator.additionalInformationsLabel') }}
        </label>
        <p class="text-xs text-gray-500">
          {{ t('shared.components.organisms.advancedContentGenerator.additionalInformationsHelp') }}
        </p>
        <TextEditor
          v-model="additionalInformations"
          class="w-full h-32"
          :placeholder="t('shared.components.organisms.advancedContentGenerator.additionalInformationsPlaceholder')"
        />
      </div>

      <div v-for="channelId in selectedChannelIds" :key="channelId" class="space-y-3">
        <div class="flex items-center justify-between">
          <h6 class="text-sm font-semibold text-gray-700">
            {{ t('shared.components.organisms.advancedContentGenerator.languagesTitle', {
              channel: resolveSalesChannelLabel(channelId),
            }) }}
          </h6>
        </div>

        <div v-if="channelLanguages[channelId]?.loading" class="text-sm text-gray-500">
          {{ t('shared.labels.loading') }}
        </div>

        <div v-else-if="!(channelLanguages[channelId]?.languages || []).length" class="text-sm text-gray-500">
          {{ t('shared.components.organisms.advancedContentGenerator.languagesEmpty') }}
        </div>

        <div v-else class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="w-full min-w-max divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500 w-16">
                  <div class="flex items-center justify-start gap-2">
                    <Checkbox
                      :model-value="isChannelFullySelected(channelId)"
                      @update:modelValue="(value) => toggleAllLanguages(channelId, value)"
                    />
                    <span>{{ t('shared.components.organisms.advancedContentGenerator.selectColumn') }}</span>
                  </div>
                </th>
              <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                {{ t('shared.components.organisms.advancedContentGenerator.localLanguageColumn') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-for="language in channelLanguages[channelId].languages" :key="language.id">
              <td class="px-3 py-2 text-center">
                  <Checkbox
                    :model-value="language.selected"
                    @update:modelValue="(value) => toggleLanguage(channelId, language.id, value)"
                  />
              </td>
              <td class="px-3 py-2 text-gray-700">
                {{ companyLanguageMap[language.localCode || ''] || language.localCode }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>

    <div class="flex items-center justify-end gap-3 pt-2">
      <div v-if="!canSubmit" class="text-xs text-red-500">
        {{ t('shared.components.organisms.advancedContentGenerator.missingSelection') }}
      </div>
      <Button class="btn btn-outline-dark" @click="emit('cancel')">
        {{ t('shared.button.cancel') }}
      </Button>
      <Button class="btn btn-primary" :disabled="!canSubmit" @click="submit">
        {{ t('shared.button.generate') }}
      </Button>
    </div>
  </div>
</template>
