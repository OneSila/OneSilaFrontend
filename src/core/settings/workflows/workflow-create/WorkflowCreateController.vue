<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { Breadcrumbs } from '../../../../shared/components/molecules/breadcrumbs';
import { Card } from '../../../../shared/components/atoms/card';
import { TextInput } from '../../../../shared/components/atoms/input-text';
import { TextEditor } from '../../../../shared/components/atoms/input-text-editor';
import { Checkbox } from '../../../../shared/components/atoms/checkbox';
import { Label } from '../../../../shared/components/atoms/label';
import { PrimaryButton } from '../../../../shared/components/atoms/button-primary';
import { CancelButton } from '../../../../shared/components/atoms/button-cancel';
import { Link } from '../../../../shared/components/atoms/link';
import { TabsMenu } from '../../../../shared/components/molecules/tabs-menu';
import SettingsTemplate from '../../SettingsTemplate.vue';
import { getTabsConfig } from '../../tabs';
import apolloClient from '../../../../../apollo-client';
import { createWorkflowMutation } from '../../../../shared/api/mutations/workflows.js';
import { processGraphQLErrors } from '../../../../shared/utils';
import { Toast } from '../../../../shared/modules/toast';

const { t } = useI18n();
const router = useRouter();

const loading = ref(false);
const form = reactive({
  name: '',
  description: '',
  sortOrder: 0,
  autoAddOnProduct: false,
});

const submit = async () => {
  if (!form.name.trim()) {
    Toast.error(t('settings.workflows.messages.requiredFields'));
    return;
  }

  try {
    loading.value = true;
    const { data } = await apolloClient.mutate({
      mutation: createWorkflowMutation,
      variables: {
        data: {
          name: form.name.trim(),
          description: form.description?.trim() || '',
          sortOrder: Number(form.sortOrder) || 0,
          autoAddOnProduct: false,
        },
      },
    });

    const workflowId = data?.createWorkflow?.id;
    if (!workflowId) {
      Toast.error(t('shared.alert.toast.unexpectedResult'));
      return;
    }

    Toast.success(t('shared.alert.toast.submitSuccessCreate'));
    await router.push({ name: 'settings.workflow.edit', params: { id: workflowId } });
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    Object.values(validationErrors).forEach((message) => Toast.error(String(message)));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <SettingsTemplate>
    <template #tabs>
      <TabsMenu :tabs="getTabsConfig(t)" :activeName="'workflows'" />
    </template>

    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'settings.workflows.list' }, name: t('settings.workflows.title') },
          { path: { name: 'settings.workflow.create' }, name: t('settings.workflows.create.title') }
        ]"
      />
    </template>

    <template #content>
      <Card>
        <div class="space-y-6">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">{{ t('settings.workflows.create.title') }}</h2>
            <p class="mt-1 text-sm text-gray-500">{{ t('settings.workflows.messages.createIntro') }}</p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <Label semi-bold>{{ t('settings.workflows.labels.name') }}</Label>
              <TextInput v-model="form.name" :placeholder="t('settings.workflows.placeholders.name')" class="mt-2 w-full" />
            </div>
            <div>
              <Label semi-bold>{{ t('settings.workflows.labels.code') }}</Label>
              <TextInput :model-value="''" :placeholder="t('settings.workflows.placeholders.codeGenerated')" disabled class="mt-2 w-full" />
              <p class="mt-2 text-xs text-gray-500">
                {{ t('settings.workflows.messages.codeGeneratedHelp') }}
              </p>
            </div>
            <div>
              <Label semi-bold>{{ t('settings.workflows.labels.sortOrder') }}</Label>
              <TextInput v-model="form.sortOrder" :placeholder="t('settings.workflows.placeholders.sortOrder')" number class="mt-2 w-full" />
            </div>
            <div>
              <Label semi-bold>{{ t('settings.workflows.labels.autoAddOnProduct') }}</Label>
              <div class="mt-3">
                <Checkbox :model-value="form.autoAddOnProduct" disabled>
                  {{ t('settings.workflows.messages.autoAddNeedsStates') }}
                </Checkbox>
              </div>
            </div>
            <div class="md:col-span-2">
              <Label semi-bold>{{ t('shared.labels.description') }}</Label>
              <TextEditor
                v-model="form.description"
                class="mt-2 h-28"
                :placeholder="t('shared.placeholders.description')"
                :scroll="true"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <Link :path="{ name: 'settings.workflows.list' }">
              <CancelButton>{{ t('shared.button.cancel') }}</CancelButton>
            </Link>
            <PrimaryButton :loading="loading" :disabled="loading" @click="submit">
              {{ t('shared.button.create') }}
            </PrimaryButton>
          </div>
        </div>
      </Card>
    </template>
  </SettingsTemplate>
</template>
