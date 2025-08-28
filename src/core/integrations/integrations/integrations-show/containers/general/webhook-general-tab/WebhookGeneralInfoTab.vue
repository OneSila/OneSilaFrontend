<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { TextInput } from "../../../../../../../shared/components/atoms/input-text";
import { Label } from "../../../../../../../shared/components/atoms/label";
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
  userAgent: string;
  timeoutMs: number;
  mode: string;
  retentionPolicy: string;
}

const props = defineProps<{ data: EditWebhookForm }>();
const { t } = useI18n();
const formData = ref<EditWebhookForm>({ ...props.data });
const fieldErrors = ref<Record<string, string>>({});
const router = useRouter();
const submitButtonRef = ref();
const submitContinueButtonRef = ref();

const accordionItems = [
  { name: 'throttling', label: t('integrations.show.sections.throttling'), icon: 'gauge' }
];

watch(() => props.data, (newData) => {
  formData.value = { ...newData };
}, { deep: true });

const cleanupAndMutate = async (mutate) => {
  fieldErrors.value = {};
  await mutate({ variables: { data: formData.value } });
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
      variables: { data: { id: formData.value.id } }
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
        <TextInput v-model="formData.topic" :placeholder="t('integrations.placeholders.topic')" class="w-full" />
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
        <TextInput v-model="formData.version" :placeholder="t('integrations.placeholders.version')" class="w-full" />
        <div class="mt-1 text-sm leading-6 text-gray-400">
          <p>{{ t('integrations.webhook.helpText.version') }}</p>
        </div>
      </div>
      <div class="md:col-span-6 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('integrations.labels.userAgent') }}
        </Label>
        <TextInput v-model="formData.userAgent" :placeholder="t('integrations.placeholders.userAgent')" class="w-full" />
        <div class="mt-1 text-sm leading-6 text-gray-400">
          <p>{{ t('integrations.webhook.helpText.userAgent') }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <div class="md:col-span-6 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('integrations.labels.timeoutMs') }}
        </Label>
        <TextInput v-model="formData.timeoutMs" :number="true" :placeholder="t('integrations.placeholders.timeoutMs')" class="w-full" />
        <div class="mt-1 text-sm leading-6 text-gray-400">
          <p>{{ t('integrations.webhook.helpText.timeoutMs') }}</p>
        </div>
      </div>
      <div class="md:col-span-6 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('integrations.labels.mode') }}
        </Label>
        <TextInput v-model="formData.mode" :placeholder="t('integrations.placeholders.mode')" class="w-full" />
        <div class="mt-1 text-sm leading-6 text-gray-400">
          <p>{{ t('integrations.webhook.helpText.mode') }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <div class="md:col-span-6 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('integrations.labels.retentionPolicy') }}
        </Label>
        <TextInput v-model="formData.retentionPolicy" :placeholder="t('integrations.placeholders.retentionPolicy')" class="w-full" />
        <div class="mt-1 text-sm leading-6 text-gray-400">
          <p>{{ t('integrations.webhook.helpText.retentionPolicy') }}</p>
        </div>
      </div>
      <div class="md:col-span-6 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('integrations.labels.secret') }}
        </Label>
        <div class="flex gap-2">
          <input
            type="password"
            :value="formData.secret"
            disabled
            class="text-input border border-gray-300 shadow-sm rounded-md px-3 py-2 text-sm placeholder:italic focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 w-full"
          />
          <Button @click="copySecret" class="flex-shrink-0">
            <Icon name="clipboard" class="h-5 w-5 text-gray-500" aria-hidden="true" />
          </Button>
          <Button @click="regenerateSecret" class="flex-shrink-0">
            {{ t('integrations.webhook.buttons.regenerateSecret') }}
          </Button>
        </div>
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
