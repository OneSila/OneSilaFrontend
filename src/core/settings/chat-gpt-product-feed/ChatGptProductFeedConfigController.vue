<script setup lang="ts">
import { onMounted, Ref, ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../apollo-client';
import { Breadcrumbs } from '../../../shared/components/molecules/breadcrumbs';
import { TabsMenu } from '../../../shared/components/molecules/tabs-menu';
import { GeneralForm } from '../../../shared/components/organisms/general-form';
import { FormConfig } from '../../../shared/components/organisms/general-form/formConfig';
import SettingsTemplate from '../SettingsTemplate.vue';
import { getTabsConfig } from '../tabs';
import { chatGptProductFeedConfigsQuery } from '../../../shared/api/queries/chatGptProductFeed.js';
import {
  chatGptProductFeedFormConfigConstructor,
  updateValueFieldDependencies,
  CHAT_GPT_PROPERTY_VALUE_DEPENDENCIES,
} from './configs';
import ChatGptProductFeedInfoPanel from './ChatGptProductFeedInfoPanel.vue';

const { t } = useI18n();

const formConfig: Ref<FormConfig | null> = ref(null);
const isLoading = ref(true);
const loadError = ref(false);
const fieldsToClear = ref<string[] | null>(null);
const previousPropertyValues = ref<Record<string, string | null>>({});

const extractId = (value: any): string | null => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && 'id' in value && value.id != null) {
    return value.id as string;
  }

  return null;
};

onMounted(async () => {
  try {
    const { data } = await apolloClient.query({
      query: chatGptProductFeedConfigsQuery,
      fetchPolicy: 'network-only',
    });

    const node = data?.chatGptProductFeedConfigs?.edges?.[0]?.node;

    if (!node) {
      loadError.value = true;
      return;
    }

    const baseConfig = chatGptProductFeedFormConfigConstructor(t);

    formConfig.value = {
      ...baseConfig,
      mutationId: node.id,
      queryDataKey: 'chatGptProductFeedConfig',
      queryData: {
        chatGptProductFeedConfig: node,
      },
    } as FormConfig;

    Object.keys(CHAT_GPT_PROPERTY_VALUE_DEPENDENCIES).forEach((propertyField) => {
      const propertyValue = node[propertyField];
      previousPropertyValues.value[propertyField] = propertyValue?.id ?? null;
    });

    updateValueFieldDependencies(formConfig.value.fields, node);
  } catch (error) {
    console.error(error);
    loadError.value = true;
  } finally {
    isLoading.value = false;
  }
});

const handleFormUpdate = (form: Record<string, any>) => {
  if (!formConfig.value) {
    return;
  }

  const fieldsNeedingReset: string[] = [];

  Object.entries(CHAT_GPT_PROPERTY_VALUE_DEPENDENCIES).forEach(([propertyField, dependentFields]) => {
    const currentId = extractId(form[propertyField]);
    const previousId = previousPropertyValues.value[propertyField];

    if (previousId === undefined) {
      previousPropertyValues.value[propertyField] = currentId;
      return;
    }

    if (previousId !== currentId) {
      fieldsNeedingReset.push(...dependentFields);
      previousPropertyValues.value[propertyField] = currentId;
    }
  });

  if (fieldsNeedingReset.length > 0) {
    fieldsToClear.value = fieldsNeedingReset;
    nextTick(() => {
      fieldsToClear.value = null;
    });
  }

  updateValueFieldDependencies(formConfig.value.fields, form);
};

const handleSetData = (data: any) => {
  if (!formConfig.value) {
    return;
  }

  const config = data?.chatGptProductFeedConfig ?? data ?? {};

  Object.keys(CHAT_GPT_PROPERTY_VALUE_DEPENDENCIES).forEach((propertyField) => {
    const propertyValue = config[propertyField];
    previousPropertyValues.value[propertyField] = propertyValue?.id ?? extractId(propertyValue);
  });

  updateValueFieldDependencies(formConfig.value.fields, config);
};
</script>

<template>
  <SettingsTemplate>
    <template #tabs>
      <TabsMenu :tabs="getTabsConfig(t)" :activeName="'chatGptProductFeed'" />
    </template>

    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          {
            path: { name: 'settings.chatGptProductFeedConfig' },
            name: t('settings.chatGptProductFeed.title'),
          },
        ]"
      />
    </template>

    <template #content>
      <div v-if="isLoading" class="flex justify-center py-10">
        <span class="animate-spin border-2 border-black dark:border-white !border-l-transparent rounded-full w-5 h-5 inline-flex"></span>
      </div>
      <div
        v-else-if="loadError"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ t('settings.chatGptProductFeed.messages.loadError') }}
      </div>
      <div v-else class="grid gap-6 xl:grid-cols-3">
        <div class="xl:col-span-2">
          <GeneralForm
            v-if="formConfig"
            :config="formConfig as FormConfig"
            :fields-to-clear="fieldsToClear"
            @form-updated="handleFormUpdate"
            @set-data="handleSetData"
          />
        </div>
        <div class="xl:col-span-1">
          <ChatGptProductFeedInfoPanel />
        </div>
      </div>
    </template>
  </SettingsTemplate>
</template>
