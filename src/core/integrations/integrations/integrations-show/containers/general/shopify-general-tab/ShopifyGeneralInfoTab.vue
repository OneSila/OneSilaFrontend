<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import { useI18n } from 'vue-i18n';
import { TextInput } from "../../../../../../../shared/components/atoms/input-text";
import { Label } from "../../../../../../../shared/components/atoms/label";
import { Toggle } from "../../../../../../../shared/components/atoms/toggle";
import { Accordion } from "../../../../../../../shared/components/atoms/accordion";
import { PrimaryButton } from "../../../../../../../shared/components/atoms/button-primary";
import { SecondaryButton } from "../../../../../../../shared/components/atoms/button-secondary";
import { CancelButton } from "../../../../../../../shared/components/atoms/button-cancel";
import { Toast } from "../../../../../../../shared/modules/toast";
import { useEnterKeyboardListener, useShiftBackspaceKeyboardListener, useShiftEnterKeyboardListener } from "../../../../../../../shared/modules/keyboard";
import { useRouter } from "vue-router";
import {
  getShopifyRedirectUrlMutation,
  updateShopifySalesChannelMutation
} from "../../../../../../../shared/api/mutations/salesChannels.js";
import { processGraphQLErrors } from "../../../../../../../shared/utils";
import { cleanShopHostname } from "../../../../configs";
import apolloClient from "../../../../../../../../apollo-client";
import {FieldType, PropertyTypes} from "../../../../../../../shared/utils/constants";
import {propertiesQuery} from "../../../../../../../shared/api/queries/properties";
import {QueryFormField} from "../../../../../../../shared/components/organisms/general-form/formConfig";
import {
  FieldQuery
} from "../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";

interface EditShopifyForm {
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
  /*
  apiKey: string;
  apiSecret: string;
  */
  accessToken?: string;
  state?: string;
  vendorProperty: {
    id: string;
  };
}

const props = defineProps<{ data: EditShopifyForm }>();

const { t } = useI18n();
const formData = ref<EditShopifyForm>({ ...props.data });
const fieldErrors = ref<Record<string, string>>({});
const router = useRouter();
const submitButtonRef = ref();
const submitContinueButtonRef = ref();

const accordionItems = [
  { name: 'throttling', label: t('integrations.show.sections.throttling'), icon: 'gauge' },
  { name: 'sync', label: t('integrations.show.sections.syncPreferences'), icon: 'sync' }
];

watch(() => props.data, (newData) => {
  formData.value = { ...newData };
}, { deep: true });

const cleanupAndMutate = async (mutate) => {
  fieldErrors.value = {};

  const payload = { ...formData.value };

  if (!payload.vendorProperty?.id) {
    delete (payload as any).vendorProperty;
  }

  await mutate({ variables: { data: payload } });
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

const handleRetryConnect = async () => {
  try {
    fieldErrors.value = {};

    // Step 1: Refresh the state by calling updateShopifySalesChannel
    const { data: updateData } = await apolloClient.mutate({
      mutation: updateShopifySalesChannelMutation,
      variables: {
        data: { id: formData.value.id },
      },
    });

    const updated = updateData?.updateShopifySalesChannel;

    if (!updated?.id) {
      Toast.error(t('integrations.salesChannel.shopify.retry.failedGeneric'));
      return;
    }

    // Step 2: Get the new redirect URL
    const { data: redirectData } = await apolloClient.mutate({
      mutation: getShopifyRedirectUrlMutation,
      variables: {
        data: { id: updated.id },
      },
    });

    const result = redirectData?.getShopifyRedirectUrl;

    if (result?.redirectUrl) {
      window.location.href = result.redirectUrl;
      return;
    }

    Toast.error(t('integrations.salesChannel.shopify.retry.failedRedirect'));

  } catch (error) {
    Toast.error(t('integrations.salesChannel.shopify.retry.failedException'));
    console.error(error);
  }
};


const propertyField = computed(() => ({
    type: FieldType.Query,
    name: 'property',
    label: t('properties.properties.show.title'),
    labelBy: 'name',
    valueBy: 'id',
    query: propertiesQuery,
    queryVariables: { filter: {'type': {'exact': PropertyTypes.SELECT }, 'isProductType': {'exact': false }} },
    dataKey: 'properties',
    isEdge: true,
    multiple: false,
    filterable: true,
    formMapIdentifier: 'id',
}));

useEnterKeyboardListener(onSubmitPressed);
useShiftEnterKeyboardListener(onSubmitAndContinuePressed);
useShiftBackspaceKeyboardListener(goBack);
</script>

<template>
  <div class="space-y-12">
    <!-- Hostname, active, SSL -->
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
      <Flex vertical>
        <FlexCell>
          <Label class="font-semibold block text-sm leading-6 text-gray-900">
            {{ t('integrations.labels.vendorProperty') }}
          </Label>
        </FlexCell>
        <FlexCell>
          <FieldQuery v-model="formData.vendorProperty.id" :field="propertyField as QueryFormField" />
          <div class="mt-1 text-sm leading-6 text-gray-400">
            <p>{{ t('integrations.salesChannel.helpText.shopifyVendorProperty') }}</p>
          </div>
        </FlexCell>
      </Flex>
    </div>
  </div>

  <!--
  <div class="grid grid-cols-12 gap-4">
    <div class="md:col-span-6 col-span-12">
      <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
        {{ t('integrations.labels.apiKey') }}
      </Label>
      <TextInput v-model="formData.apiKey" disabled class="w-full" />
    </div>
    <div class="md:col-span-6 col-span-12">
      <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
        {{ t('integrations.labels.apiSecret') }}
      </Label>
      <TextInput v-model="formData.apiSecret" disabled :secret="true" class="w-full" />
    </div>
  </div>
  -->

  <div class="grid grid-cols-12 gap-4">
    <div class="md:col-span-12 col-span-12">
      <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
        {{ t('integrations.labels.accessToken') }}
      </Label>
      <TextInput v-model="formData.accessToken" class="w-full" />
    </div>
  </div>

    <!-- Accordion -->
    <Accordion class="mt-8" :items="accordionItems">
      <!-- Throttling -->
      <template #throttling>
        <div class="grid grid-cols-12 gap-4">
          <div class="md:col-span-6 col-span-12">
            <Label class="font-semibold block text-sm text-gray-900 mb-1">
              {{ t('integrations.labels.requestsPerMinute') }}
            </Label>
            <TextInput v-model="formData.requestsPerMinute" :number="true" :min-number="1" :max-number="120" placeholder="60" class="w-full" />
            <div class="mt-1 text-sm leading-6 text-gray-400">
              <p class="text-red-500" v-if="fieldErrors['requestsPerMinute']">{{ fieldErrors['requestsPerMinute'] }}</p>
              <p>
                {{ t('integrations.salesChannel.helpText.maxRequestsPerMinute', { value: 120 }) }}
              </p>
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

      <!-- Sync -->
      <template #sync>
        <div class="space-y-4">
          <div class="grid grid-cols-12 items-center" v-for="toggleField in ['useConfigurableName', 'syncContents', 'syncEanCodes', 'syncPrices', 'importOrders']" :key="toggleField">
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
        </div>
      </template>
    </Accordion>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 pt-4 sm:px-8">

      <div class="md:col-span-12 col-span-12" v-if="!formData.accessToken">
        <PrimaryButton @click="handleRetryConnect">
          {{ t('shared.button.retry') }}
        </PrimaryButton>
      </div>


      <RouterLink :to="{ name: 'integrations.integrations.list' }">
        <CancelButton>
          {{ t('shared.button.back') }}
        </CancelButton>
      </RouterLink>

      <ApolloMutation :mutation="updateShopifySalesChannelMutation" @done="handleSubmitAndContinueDone" @error="handleError">
        <template #default="{ mutate, loading }">
          <SecondaryButton ref="submitContinueButtonRef" :disabled="loading" @click="cleanupAndMutate(mutate)">
            {{ t('shared.button.saveAndContinue') }}
          </SecondaryButton>
        </template>
      </ApolloMutation>

      <ApolloMutation :mutation="updateShopifySalesChannelMutation" @done="handleSubmitDone" @error="handleError">
        <template #default="{ mutate, loading }">
          <PrimaryButton ref="submitButtonRef" :disabled="loading" @click="cleanupAndMutate(mutate)">
            {{ t('shared.button.save') }}
          </PrimaryButton>
        </template>
      </ApolloMutation>
    </div>
  </div>

  <div v-if="!formData.accessToken" class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 mt-4" role="alert">
    <span class="font-medium flex items-center gap-1">
      ⚠️ {{ t('integrations.show.shopifyNotConnectedBanner.title') }}
    </span>
    {{ t('integrations.show.shopifyNotConnectedBanner.content') }}
  </div>

</template>
