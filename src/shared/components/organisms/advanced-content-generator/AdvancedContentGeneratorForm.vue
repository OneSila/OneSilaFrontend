<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../apollo-client';
import { Toggle } from '../../atoms/toggle';
import { Checkbox } from '../../atoms/checkbox';
import { Button } from '../../atoms/button';
import { Selector } from '../../atoms/selector';
import { TextEditor } from '../../atoms/input-text-editor';
import { remoteLanguagesQuery } from '../../../api/queries/salesChannels.js';
import { companyLanguagesQuery } from '../../../api/queries/languages.js';

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
  isDefault: boolean;
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

const activeChannels = computed(() => props.salesChannels || []);
const salesChannelOptions = computed(() =>
  activeChannels.value.map((channel) => ({
    id: channel.id,
    label: formatSalesChannelLabel(channel),
  })),
);

const formatSalesChannelLabel = (channel?: IntegrationChannel) => {
  if (!channel) {
    return t('shared.components.organisms.advancedContentGenerator.unknownChannel');
  }
  return channel.hostname || channel.type || channel.id || t('shared.components.organisms.advancedContentGenerator.unknownChannel');
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
  const map: Record<string, string> = {};
  languages.forEach((language: any) => {
    map[language.code] = language.name || language.code;
  });
  companyLanguageMap.value = map;
};

const fetchLanguagesForChannel = async (channelId: string) => {
  channelLanguages[channelId] = { loading: true, languages: [] };
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
        isDefault: false,
      });
    });

    const languages = Array.from(languageMap.values());

    if (languages.length) {
      languages[0].isDefault = true;
    }

    channelLanguages[channelId] = { loading: false, languages };
  } catch (error) {
    channelLanguages[channelId] = { loading: false, languages: [] };
  }
};

const ensureDefaultLanguage = (channelId: string) => {
  const entry = channelLanguages[channelId];
  if (!entry) return;
  const selectedLanguages = entry.languages.filter((language) => language.selected);
  if (!selectedLanguages.length) {
    entry.languages.forEach((language) => {
      language.isDefault = false;
    });
    return;
  }

  if (!selectedLanguages.some((language) => language.isDefault)) {
    selectedLanguages[0].isDefault = true;
  }

  entry.languages.forEach((language) => {
    if (!language.selected) {
      language.isDefault = false;
    }
  });
};

const toggleLanguage = (channelId: string, languageId: string, selected: boolean) => {
  const entry = channelLanguages[channelId];
  if (!entry) return;
  const language = entry.languages.find((item) => item.id === languageId);
  if (!language) return;
  language.selected = selected;
  if (!selected) {
    language.isDefault = false;
  }
  ensureDefaultLanguage(channelId);
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
    if (!selected) {
      language.isDefault = false;
    }
  });
  ensureDefaultLanguage(channelId);
};

const setDefaultLanguage = (channelId: string, languageId: string) => {
  const entry = channelLanguages[channelId];
  if (!entry) return;
  entry.languages.forEach((language) => {
    language.isDefault = language.id === languageId;
    if (language.isDefault) {
      language.selected = true;
    }
  });
};

const toggleDefaultLanguage = (channelId: string, languageId: string, enabled: boolean) => {
  if (enabled) {
    setDefaultLanguage(channelId, languageId);
    return;
  }

  const entry = channelLanguages[channelId];
  if (!entry) return;
  const language = entry.languages.find((item) => item.id === languageId);
  if (!language) return;
  language.isDefault = false;
  ensureDefaultLanguage(channelId);
};

const salesChannels = computed(() => {
  const instructions: Array<{ salesChannel: { id: string }; language: string; isDefault: boolean }> = [];
  selectedChannelIds.value.forEach((channelId) => {
    const entry = channelLanguages[channelId];
    if (!entry) return;
    entry.languages.forEach((language) => {
      if (!language.selected || !language.localCode) return;
      instructions.push({
        salesChannel: { id: channelId },
        language: language.localCode,
        isDefault: language.isDefault,
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
    if (!selectedLanguages.length) return true;
    return !selectedLanguages.some((language) => language.isDefault);
  }),
);

const previewLimitExceeded = computed(() => previewMode.value && props.productCount > 20);

const canSubmit = computed(() => {
  if (previewLimitExceeded.value) return false;
  if (!selectedChannelIds.value.length) return false;
  if (!salesChannels.value.length) return false;
  if (hasMissingLanguages.value) return false;
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

onMounted(() => {
  fetchCompanyLanguages();
  selectedChannelIds.value.forEach((channelId) => {
    fetchLanguagesForChannel(channelId);
  });
});
</script>

<template>
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
        <div v-if="!activeChannels.length" class="text-sm text-gray-500">
          {{ t('shared.components.organisms.advancedContentGenerator.salesChannelsEmpty') }}
        </div>
        <Selector
          v-if="activeChannels.length"
          v-model="selectedChannelIds"
          :options="salesChannelOptions"
          label-by="label"
          value-by="id"
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
        <label class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
          <div>
            <div class="text-sm font-medium text-gray-800">
              {{ t('shared.components.organisms.advancedContentGenerator.previewLabel') }}
            </div>
            <div class="text-xs text-gray-500">
              {{ t('shared.components.organisms.advancedContentGenerator.previewHelp') }}
            </div>
          </div>
          <Toggle v-model="previewMode" />
        </label>
      </div>

      <div v-if="previewLimitExceeded" class="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
        {{ t('shared.components.organisms.advancedContentGenerator.previewLimitExceeded') }}
      </div>
    </div>

    <div class="space-y-2">
      <label class="text-sm font-semibold text-gray-700">
        {{ t('shared.components.organisms.advancedContentGenerator.additionalInformationsLabel') }}
      </label>
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
            channel: formatSalesChannelLabel(activeChannels.find((item) => item.id === channelId)),
          }) }}
        </h6>
        <span class="text-xs text-gray-400">
          {{ t('shared.components.organisms.advancedContentGenerator.defaultLanguageHint') }}
        </span>
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
              <th class="px-3 py-2 text-center text-xs font-semibold text-gray-500">
                {{ t('shared.components.organisms.advancedContentGenerator.defaultColumn') }}
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
              <td class="px-3 py-2 text-center">
                <div :class="language.selected ? '' : 'pointer-events-none opacity-50'">
                  <Toggle
                    :model-value="language.isDefault"
                    @update:modelValue="(value) => toggleDefaultLanguage(channelId, language.id, value)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
