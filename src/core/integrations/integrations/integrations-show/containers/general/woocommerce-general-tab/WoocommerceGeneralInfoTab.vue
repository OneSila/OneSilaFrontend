<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { TextInput } from "../../../../../../../shared/components/atoms/input-text";
import { Label } from "../../../../../../../shared/components/atoms/label";
import { Toggle } from "../../../../../../../shared/components/atoms/toggle";
import { PrimaryButton } from "../../../../../../../shared/components/atoms/button-primary";
import { SecondaryButton } from "../../../../../../../shared/components/atoms/button-secondary";
import { CancelButton } from "../../../../../../../shared/components/atoms/button-cancel";
import { Toast } from "../../../../../../../shared/modules/toast";
import { processGraphQLErrors } from "../../../../../../../shared/utils";
import { useRouter } from "vue-router";
import { updateWoocommerceSalesChannelMutation } from "../../../../../../../shared/api/mutations/salesChannels.js";

interface EditWoocommerceForm {
  id: string;
  hostname: string;
  active: boolean;
  verifySsl: boolean;
  requestsPerMinute: number;
  maxRetries: number;
  useConfigurableName: boolean;
  syncContents: boolean;
  syncEanCodes: boolean;
  syncPrices: boolean;
  importOrders: boolean;
  consumerKey: string;
  consumerSecretKey: string;
}

const props = defineProps<{ data: EditWoocommerceForm }>();
const { t } = useI18n();
const formData = ref<EditWoocommerceForm>({ ...props.data });
const fieldErrors = ref<Record<string, string>>({});
const router = useRouter();
const submitButtonRef = ref();
const submitContinueButtonRef = ref();

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

</script>

<template>
  <div class="space-y-12">
    <div class="grid grid-cols-12 gap-4">
      <div class="md:col-span-8 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('integrations.labels.hostname') }}
        </Label>
        <TextInput v-model="formData.hostname" placeholder="https://example.com" disabled class="w-full" />
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
          {{ t('integrations.labels.consumerKey') }}
        </Label>
        <TextInput v-model="formData.consumerKey" class="w-full" :placeholder="t('integrations.placeholders.consumerKey')" />
      </div>
      <div class="md:col-span-6 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('integrations.labels.consumerSecret') }}
        </Label>
        <TextInput v-model="formData.consumerSecretKey" class="w-full" :placeholder="t('integrations.placeholders.consumerSecret')" />
      </div>
    </div>

    <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
      <RouterLink :to="{ name: 'integrations.integrations.list' }">
        <CancelButton>
          {{ t('shared.button.back') }}
        </CancelButton>
      </RouterLink>

      <ApolloMutation :mutation="updateWoocommerceSalesChannelMutation" @done="handleSubmitAndContinueDone" @error="handleError">
        <template #default="{ mutate, loading }">
          <SecondaryButton ref="submitContinueButtonRef" :disabled="loading" @click="cleanupAndMutate(mutate)">
            {{ t('shared.button.saveAndContinue') }}
          </SecondaryButton>
        </template>
      </ApolloMutation>

      <ApolloMutation :mutation="updateWoocommerceSalesChannelMutation" @done="handleSubmitDone" @error="handleError">
        <template #default="{ mutate, loading }">
          <PrimaryButton ref="submitButtonRef" :disabled="loading" @click="cleanupAndMutate(mutate)">
            {{ t('shared.button.save') }}
          </PrimaryButton>
        </template>
      </ApolloMutation>
    </div>
  </div>
</template>
