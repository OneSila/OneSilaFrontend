<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { TextInput } from "../../../../../../../shared/components/atoms/input-text";
import { Label } from "../../../../../../../shared/components/atoms/label";
import { Selector } from "../../../../../../../shared/components/atoms/selector";
import { Toggle } from "../../../../../../../shared/components/atoms/toggle";
import { Accordion } from "../../../../../../../shared/components/atoms/accordion";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { PrimaryButton } from "../../../../../../../shared/components/atoms/button-primary";
import { SecondaryButton } from "../../../../../../../shared/components/atoms/button-secondary";
import { CancelButton } from "../../../../../../../shared/components/atoms/button-cancel";
import { Icon } from "../../../../../../../shared/components/atoms/icon";
import { Toast } from "../../../../../../../shared/modules/toast";
import { processGraphQLErrors } from "../../../../../../../shared/utils";
import { useRouter } from "vue-router";
import apolloClient from "../../../../../../../../apollo-client";
import { updateWebhookIntegrationMutation, regenerateWebhookIntegrationSecretMutation } from "../../../../../../../shared/api/mutations/webhookIntegrations.js";

interface EditWebhookForm {
  id: string;
  hostname: string;
  active: boolean;
  requestsPerMinute: number;
  maxRetries: number;
  topic: string;
  version: string;
  url: string;
  secret: string;
  timeoutMs: number;
  mode: string;
}

const props = defineProps<{ data: EditWebhookForm }>();
const { t } = useI18n();

const removeTypename = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((item) => removeTypename(item));
  } else if (obj && typeof obj === 'object') {
    const { __typename, ...rest } = obj;
    Object.keys(rest).forEach((key) => {
      rest[key] = removeTypename(rest[key]);
    });
    return rest;
  }
  return obj;
};

const formData = ref<EditWebhookForm>(removeTypename(props.data));
const fieldErrors = ref<Record<string, string>>({});
const router = useRouter();
const submitButtonRef = ref();
const submitContinueButtonRef = ref();

const accordionItems = [
  { name: 'throttling', label: t('integrations.show.sections.throttling'), icon: 'gauge' }
];

const topicChoices = [
  { id: 'product', text: t('integrations.webhook.choices.topic.product') },
  { id: 'ean_code', text: t('integrations.webhook.choices.topic.ean_code') },
  { id: 'price_list', text: t('integrations.webhook.choices.topic.price_list') },
  { id: 'price_list_item', text: t('integrations.webhook.choices.topic.price_list_item') },
  { id: 'media', text: t('integrations.webhook.choices.topic.media') },
  { id: 'media_through', text: t('integrations.webhook.choices.topic.media_through') },
  { id: 'property', text: t('integrations.webhook.choices.topic.property') },
  { id: 'select_value', text: t('integrations.webhook.choices.topic.select_value') },
  { id: 'property_rule', text: t('integrations.webhook.choices.topic.property_rule') },
  { id: 'property_rule_item', text: t('integrations.webhook.choices.topic.property_rule_item') },
  { id: 'product_property', text: t('integrations.webhook.choices.topic.product_property') },
  { id: 'sales_channel_view_assign', text: t('integrations.webhook.choices.topic.sales_channel_view_assign') },
  { id: 'all', text: t('integrations.webhook.choices.topic.all') },
];

const versionChoices = [
  { id: '2025-08-01', text: t('integrations.webhook.choices.version.2025-08-01') },
];

const modeChoices = [
  { id: 'full', text: t('integrations.webhook.choices.mode.full') },
  { id: 'delta', text: t('integrations.webhook.choices.mode.delta') },
];


watch(
  () => props.data,
  (newData) => {
    formData.value = removeTypename(newData);
  },
  { deep: true }
);

const cleanupAndMutate = async (mutate) => {
  fieldErrors.value = {};
  await mutate({ variables: { data: removeTypename(formData.value) } });
};

const handleError = (errors) => {
  const validationErrors = processGraphQLErrors(errors, t);
  fieldErrors.value = validationErrors;
  if (validationErrors['__all__']) {
    Toast.error(validationErrors['__all__']);
  }
};

const goBack = () => router.push({ name: 'integrations.integrations.list' });
const handleSubmitDone = () => Toast.success(t('shared.alert.toast.submitSuccessUpdate'));
const handleSubmitAndContinueDone = () => Toast.success(t('shared.alert.toast.submitSuccessUpdate'));

const copySecret = async () => {
  try {
    await navigator.clipboard.writeText(formData.value.secret);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

const regenerateSecret = async () => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: regenerateWebhookIntegrationSecretMutation,
      variables: { instance: { id: formData.value.id } }
    });
    formData.value.secret = data?.regenerateWebhookIntegrationSecret?.secret || '';
    Toast.success(t('shared.alert.toast.submitSuccessUpdate'));
  } catch (errors) {
    handleError(errors);
  }
};
</script>

<template>
  <div class="space-y-12">
    <div class="grid grid-cols-12 gap-4">
      <div class="md:col-span-8 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('shared.labels.name') }}
        </Label>
        <TextInput v-model="formData.hostname" :placeholder="t('shared.placeholders.name')" class="w-full" />
      </div>
      <div class="md:col-span-2 col-span-6">
        <Flex class="mt-8" gap="2">
          <FlexCell>
            <Label class="font-semibold text-sm text-gray-900 mb-1">
              {{ t('shared.labels.active') }}
            </Label>
          </FlexCell>
          <FlexCell>
            <Toggle v-model="formData.active" />
          </FlexCell>
        </Flex>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <div class="md:col-span-6 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('integrations.labels.url') }}
        </Label>
        <TextInput v-model="formData.url" :placeholder="t('integrations.placeholders.url')" class="w-full" />
        <div class="mt-1 text-sm leading-6 text-gray-400">
          <p>{{ t('integrations.webhook.helpText.url') }}</p>
        </div>
      </div>
      <div class="md:col-span-6 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('integrations.labels.topic') }}
        </Label>
        <div>
          <Selector
            v-model="formData.topic"
            :options="topicChoices"
            value-by="id"
            label-by="text"
            :placeholder="t('integrations.placeholders.topic')"
            :removable="false"
            class="w-full"
          />
        </div>
        <div class="mt-1 text-sm leading-6 text-gray-400">
          <p>{{ t('integrations.webhook.helpText.topic') }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <div class="md:col-span-6 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('integrations.labels.version') }}
        </Label>
        <div>
          <Selector
            v-model="formData.version"
            :options="versionChoices"
            value-by="id"
            label-by="text"
            :placeholder="t('integrations.placeholders.version')"
            :removable="false"
            class="w-full"
          />
        </div>
        <div class="mt-1 text-sm leading-6 text-gray-400">
          <p>{{ t('integrations.webhook.helpText.version') }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <div class="md:col-span-6 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('integrations.labels.timeoutMs') }}
        </Label>
        <TextInput v-model="formData.timeoutMs" :number="true" :max-number="10000" :placeholder="t('integrations.placeholders.timeoutMs')" class="w-full" />
        <div class="mt-1 text-sm leading-6 text-gray-400">
          <p>{{ t('integrations.webhook.helpText.timeoutMs') }}</p>
        </div>
      </div>
      <div class="md:col-span-6 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('integrations.labels.mode') }}
        </Label>
        <div>
          <Selector
            v-model="formData.mode"
            :options="modeChoices"
            value-by="id"
            label-by="text"
            :placeholder="t('integrations.placeholders.mode')"
            :removable="false"
            class="w-full"
          />
        </div>
        <div class="mt-1 text-sm leading-6 text-gray-400">
          <p>{{ t('integrations.webhook.helpText.mode') }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <div class="md:col-span-6 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('integrations.labels.secret') }}
        </Label>
        <Flex gap="2" middle>
          <FlexCell grow>
            <TextInput v-model="formData.secret" secret disabled class="w-full" />
          </FlexCell>
          <FlexCell>
            <Button @click="copySecret">
              <Icon name="clipboard" class="h-5 w-5 text-gray-500" aria-hidden="true" />
            </Button>
          </FlexCell>
          <FlexCell>
            <SecondaryButton @click="regenerateSecret">
              {{ t('integrations.webhook.buttons.regenerateSecret') }}
            </SecondaryButton>
          </FlexCell>
        </Flex>
      </div>
    </div>

    <Accordion class="mt-8" :items="accordionItems">
      <template #throttling>
        <div class="grid grid-cols-12 gap-4">
          <div class="md:col-span-6 col-span-12">
            <Label class="font-semibold block text-sm text-gray-900 mb-1">
              {{ t('integrations.labels.requestsPerMinute') }}
            </Label>
            <TextInput v-model="formData.requestsPerMinute" :number="true" :min-number="1" :max-number="120" placeholder="60" class="w-full" />
            <div class="mt-1 text-sm leading-6 text-gray-400">
              <p class="text-red-500" v-if="fieldErrors['requestsPerMinute']">{{ fieldErrors['requestsPerMinute'] }}</p>
              <p>{{ t('integrations.salesChannel.helpText.maxRequestsPerMinute', { value: 120 }) }}</p>
            </div>
          </div>

          <div class="md:col-span-6 col-span-12">
            <Label class="font-semibold text-sm text-gray-900 mb-1">
              {{ t('integrations.labels.maxRetries') }}
            </Label>
            <TextInput v-model="formData.maxRetries" :number="true" :min-number="1" :max-number="20" placeholder="3" class="w-full" />
            <div class="mt-1 text-sm leading-6 text-gray-400">
              <p class="text-red-500" v-if="fieldErrors['maxRetries']">{{ fieldErrors['maxRetries'] }}</p>
              <p>{{ t('integrations.salesChannel.helpText.maxRetries') }}</p>
            </div>
          </div>
        </div>
      </template>
    </Accordion>

    <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
      <RouterLink :to="{ name: 'integrations.integrations.list' }">
        <CancelButton>
          {{ t('shared.button.back') }}
        </CancelButton>
      </RouterLink>

      <ApolloMutation :mutation="updateWebhookIntegrationMutation" @done="handleSubmitAndContinueDone" @error="handleError">
        <template #default="{ mutate, loading }">
          <SecondaryButton ref="submitContinueButtonRef" :disabled="loading" @click="cleanupAndMutate(mutate)">
            {{ t('shared.button.saveAndContinue') }}
          </SecondaryButton>
        </template>
      </ApolloMutation>

      <ApolloMutation :mutation="updateWebhookIntegrationMutation" @done="handleSubmitDone" @error="handleError">
        <template #default="{ mutate, loading }">
          <PrimaryButton ref="submitButtonRef" :disabled="loading" @click="cleanupAndMutate(mutate)">
            {{ t('shared.button.save') }}
          </PrimaryButton>
        </template>
      </ApolloMutation>
    </div>
  </div>
</template>
