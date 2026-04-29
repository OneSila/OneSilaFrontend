<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { TextInput } from "../../../../../../../shared/components/atoms/input-text";
import { Label } from "../../../../../../../shared/components/atoms/label";
import { Toggle } from "../../../../../../../shared/components/atoms/toggle";
import { PrimaryButton } from "../../../../../../../shared/components/atoms/button-primary";
import { SecondaryButton } from "../../../../../../../shared/components/atoms/button-secondary";
import { CancelButton } from "../../../../../../../shared/components/atoms/button-cancel";
import { Accordion } from "../../../../../../../shared/components/atoms/accordion";
import { Toast } from "../../../../../../../shared/modules/toast";
import { processGraphQLErrors } from "../../../../../../../shared/utils";
import { updateManualSalesChannelMutation } from "../../../../../../../shared/api/mutations/salesChannels.js";
import GptSettingsForm from "../components/GptSettingsForm.vue";

interface EditManualForm {
  id: string;
  hostname: string;
  active: boolean;
  gptEnable: boolean;
  gptEnableCheckout: boolean;
  gptSellerName: string;
  gptSellerUrl: string;
  gptSellerPrivacyPolicy: string;
  gptSellerTos: string;
  gptReturnPolicy: string;
  gptReturnWindow: number | null;
}

interface SalesChannelGptFeed {
  id: string;
  fileUrl?: string | null;
  lastSyncedAt?: string | null;
  file?: {
    url?: string | null;
  } | null;
}

const { t } = useI18n();
const router = useRouter();
const emit = defineEmits<{ (e: 'gpt-feed-updated', value: SalesChannelGptFeed | null): void }>();
const props = defineProps<{ data: EditManualForm; gptFeed: SalesChannelGptFeed | null; initialGptEnable: boolean; salesChannelId: string | null }>();

const formData = ref<EditManualForm>({
  ...props.data,
  gptEnable: props.data.gptEnable ?? false,
  gptEnableCheckout: props.data.gptEnableCheckout ?? false,
  gptSellerName: props.data.gptSellerName ?? '',
  gptSellerUrl: props.data.gptSellerUrl ?? '',
  gptSellerPrivacyPolicy: props.data.gptSellerPrivacyPolicy ?? '',
  gptSellerTos: props.data.gptSellerTos ?? '',
  gptReturnPolicy: props.data.gptReturnPolicy ?? '',
  gptReturnWindow: props.data.gptReturnWindow ?? null,
});
const submitButtonRef = ref();
const submitContinueButtonRef = ref();
const fieldErrors = ref<Record<string, string>>({});

const accordionItems = [
  { name: 'gpt', label: t('integrations.show.sections.gpt'), icon: 'robot' },
];

watch(
  () => props.data,
  (newData) => {
    formData.value = {
      ...newData,
      gptEnable: newData.gptEnable ?? false,
      gptEnableCheckout: newData.gptEnableCheckout ?? false,
      gptSellerName: newData.gptSellerName ?? '',
      gptSellerUrl: newData.gptSellerUrl ?? '',
      gptSellerPrivacyPolicy: newData.gptSellerPrivacyPolicy ?? '',
      gptSellerTos: newData.gptSellerTos ?? '',
      gptReturnPolicy: newData.gptReturnPolicy ?? '',
      gptReturnWindow: newData.gptReturnWindow ?? null,
    };
  },
  { deep: true }
);

const cleanupAndMutate = async (mutate) => {
  fieldErrors.value = {};
  await mutate({ variables: { data: formData.value } });
};

const handleError = (errors) => {
  const validationErrors = processGraphQLErrors(errors, t) as Record<string, string>;
  fieldErrors.value = validationErrors;
  if (validationErrors.__all__) {
    Toast.error(validationErrors.__all__);
  }
};

const handleSubmitDone = () => {
  Toast.success(t('shared.alert.toast.submitSuccessUpdate'));
  router.push({ name: 'integrations.integrations.list' });
};

const handleSubmitAndContinueDone = () => {
  Toast.success(t('shared.alert.toast.submitSuccessUpdate'));
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
        <p class="text-red-500 text-sm mt-1" v-if="fieldErrors.hostname">{{ fieldErrors.hostname }}</p>
      </div>
      <div class="md:col-span-4 col-span-12">
        <Flex class="mt-8" gap="2">
          <FlexCell>
            <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
              {{ t('shared.labels.active') }}
            </Label>
          </FlexCell>
          <FlexCell>
            <Toggle v-model="formData.active" />
          </FlexCell>
        </Flex>
      </div>
    </div>

    <Accordion class="mt-8" :items="accordionItems">
      <template #gpt>
        <GptSettingsForm
          :form-data="formData"
          :field-errors="fieldErrors"
          :hostname="formData.hostname"
          :gpt-feed="props.gptFeed"
          :initial-gpt-enable="props.initialGptEnable"
          :sales-channel-id="props.salesChannelId"
          @gpt-feed-updated="emit('gpt-feed-updated', $event)"
        />
      </template>
    </Accordion>

    <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
      <RouterLink :to="{ name: 'integrations.integrations.list' }">
        <CancelButton>
          {{ t('shared.button.back') }}
        </CancelButton>
      </RouterLink>

      <ApolloMutation :mutation="updateManualSalesChannelMutation" @done="handleSubmitAndContinueDone" @error="handleError">
        <template #default="{ mutate, loading }">
          <SecondaryButton ref="submitContinueButtonRef" :disabled="loading" @click="cleanupAndMutate(mutate)">
            {{ t('shared.button.saveAndContinue') }}
          </SecondaryButton>
        </template>
      </ApolloMutation>

      <ApolloMutation :mutation="updateManualSalesChannelMutation" @done="handleSubmitDone" @error="handleError">
        <template #default="{ mutate, loading }">
          <PrimaryButton ref="submitButtonRef" :disabled="loading" @click="cleanupAndMutate(mutate)">
            {{ t('shared.button.save') }}
          </PrimaryButton>
        </template>
      </ApolloMutation>
    </div>
  </div>
</template>
