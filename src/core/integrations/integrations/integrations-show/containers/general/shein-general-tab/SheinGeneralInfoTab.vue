<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { TextInput } from "../../../../../../../shared/components/atoms/input-text";
import { Label } from "../../../../../../../shared/components/atoms/label";
import { Toggle } from "../../../../../../../shared/components/atoms/toggle";
import { Accordion } from "../../../../../../../shared/components/atoms/accordion";
import { PrimaryButton } from "../../../../../../../shared/components/atoms/button-primary";
import { SecondaryButton } from "../../../../../../../shared/components/atoms/button-secondary";
import { CancelButton } from "../../../../../../../shared/components/atoms/button-cancel";
import { Toast } from "../../../../../../../shared/modules/toast";
import {
  useEnterKeyboardListener,
  useShiftBackspaceKeyboardListener,
  useShiftEnterKeyboardListener,
} from "../../../../../../../shared/modules/keyboard";
import { useRouter, useRoute } from 'vue-router';
import { sheinChannelsQuerySelector } from "../../../../../../../shared/api/queries/salesChannels.js";
import {
  syncSheinSalesChannelMappingsMutation,
  updateSheinSalesChannelMutation,
} from "../../../../../../../shared/api/mutations/salesChannels.js";
import { processGraphQLErrors } from "../../../../../../../shared/utils";
import { MappingImporter } from "../../../../../../../shared/components/organisms/mapping-importer";

interface EditSheinForm {
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
  startingStock: number | null;
  openKeyId?: string | null;
}

const props = defineProps<{ data: EditSheinForm }>();
const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const formData = ref<EditSheinForm>({
  ...props.data,
  startingStock: props.data.startingStock ?? null,
});
const fieldErrors = ref<Record<string, string>>({});
const submitButtonRef = ref();
const submitContinueButtonRef = ref();

watch(
  () => props.data,
  (newData) => {
    formData.value = {
      ...newData,
      startingStock: newData.startingStock ?? null,
    };
  },
  { deep: true },
);

const openAccordionItem = computed(() => String(route.query.accordion || ''));

const accordionItems = [
  { name: 'throttling', label: t('integrations.show.sections.throttling'), icon: 'gauge' },
  { name: 'sync', label: t('integrations.show.sections.syncPreferences'), icon: 'sync' },
];

const cleanupAndMutate = async (mutate) => {
  fieldErrors.value = {};
  try {
    await mutate({ variables: { data: formData.value } });
  } catch (error) {
    handleError(error);
  }
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

const onSubmitPressed = () => submitButtonRef.value?.$el.click();
const onSubmitAndContinuePressed = () => submitContinueButtonRef.value?.$el.click();

useEnterKeyboardListener(onSubmitPressed);
useShiftEnterKeyboardListener(onSubmitAndContinuePressed);
useShiftBackspaceKeyboardListener(goBack);
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

    <Accordion class="mt-8" :items="accordionItems" :default-active="openAccordionItem" :key="openAccordionItem">
      <template #throttling>
        <div class="grid grid-cols-12 gap-4">
          <div class="md:col-span-6 col-span-12">
            <Label class="font-semibold block text-sm text-gray-900 mb-1">
              {{ t('integrations.labels.requestsPerMinute') }}
            </Label>
            <TextInput v-model="formData.requestsPerMinute" :number="true" placeholder="60" class="w-full" />
            <div class="mt-1 text-sm leading-6 text-gray-400">
              <p class="text-red-500" v-if="fieldErrors['requestsPerMinute']">{{ fieldErrors['requestsPerMinute'] }}</p>
              <p>{{ t('integrations.salesChannel.helpText.requestsPerMinute') }}</p>
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

      <template #sync>
        <div class="space-y-4">
          <div
            class="grid grid-cols-12 items-center"
            v-for="toggleField in ['useConfigurableName','syncContents','syncEanCodes','syncPrices','importOrders']"
            :key="toggleField"
          >
            <div class="md:col-span-4 col-span-12">
              <Flex gap="2">
                <FlexCell>
                  <Label class="font-semibold text-sm text-gray-900 mb-1">
                    {{ t(`integrations.labels.${toggleField}`) }}
                  </Label>
                </FlexCell>
                <FlexCell>
                  <Toggle v-model="formData[toggleField]" />
                </FlexCell>
              </Flex>
            </div>
            <div class="md:col-span-8 col-span-12 text-sm text-gray-400">
              {{ t(`integrations.salesChannel.helpText.${toggleField}`) }}
            </div>
          </div>
          <div class="pt-4 mt-4 border-t border-gray-200 grid grid-cols-12 gap-4 items-start">
            <div class="md:col-span-4 col-span-12">
              <Flex class="items-center" gap="2">
                <FlexCell>
                  <Label class="font-semibold text-sm text-gray-900">
                    {{ t('integrations.labels.startingStock') }}
                  </Label>
                </FlexCell>
                <FlexCell>
                  <TextInput
                    :model-value="formData.startingStock ?? ''"
                    :number="true"
                    :min-number="0"
                    class="w-full md:w-24"
                    @update:modelValue="(value) => { formData.startingStock = Number.isNaN(value) ? null : value; }"
                  />
                </FlexCell>
              </Flex>
              <p class="text-red-500 text-sm mt-1" v-if="fieldErrors['startingStock']">{{ fieldErrors['startingStock'] }}</p>
            </div>
            <div class="md:col-span-8 col-span-12 text-sm text-gray-400">
              {{ t('integrations.salesChannel.helpText.startingStock') }}
            </div>
          </div>
        </div>
      </template>
    </Accordion>

    <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 pt-4 sm:px-8">
      <RouterLink :to="{ name: 'integrations.integrations.list' }">
        <CancelButton>
          {{ t('shared.button.back') }}
        </CancelButton>
      </RouterLink>

      <MappingImporter
        v-if="formData.id"
        :target-sales-channel-id="formData.id"
        :channels-query="sheinChannelsQuerySelector"
        channels-query-key="sheinChannels"
        :sync-mutation="syncSheinSalesChannelMappingsMutation"
        channel-label-key="integrations.integrationTypes.shein"
      />

      <ApolloMutation :mutation="updateSheinSalesChannelMutation" @done="handleSubmitAndContinueDone" @error="handleError">
        <template #default="{ mutate, loading }">
          <SecondaryButton ref="submitContinueButtonRef" :disabled="loading" @click="cleanupAndMutate(mutate)">
            {{ t('shared.button.saveAndContinue') }}
          </SecondaryButton>
        </template>
      </ApolloMutation>

      <ApolloMutation :mutation="updateSheinSalesChannelMutation" @done="handleSubmitDone" @error="handleError">
        <template #default="{ mutate, loading }">
          <PrimaryButton ref="submitButtonRef" :disabled="loading" @click="cleanupAndMutate(mutate)">
            {{ t('shared.button.save') }}
          </PrimaryButton>
        </template>
      </ApolloMutation>
    </div>
  </div>

  <div v-if="!formData.openKeyId" class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 mt-4" role="alert">
    <span class="font-medium flex items-center gap-1">
      ⚠️ {{ t('integrations.show.sheinNotConnectedBanner.title') }}
    </span>
    {{ t('integrations.show.sheinNotConnectedBanner.content') }}
  </div>
</template>
