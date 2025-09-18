<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { Label } from "../../../../../../../shared/components/atoms/label";
import { TextInput } from "../../../../../../../shared/components/atoms/input-text";
import { Selector } from "../../../../../../../shared/components/atoms/selector";
import { Toggle } from "../../../../../../../shared/components/atoms/toggle";
import { PrimaryButton } from "../../../../../../../shared/components/atoms/button-primary";
import { SecondaryButton } from "../../../../../../../shared/components/atoms/button-secondary";
import { CancelButton } from "../../../../../../../shared/components/atoms/button-cancel";
import { Toast } from "../../../../../../../shared/modules/toast";
import { useEnterKeyboardListener, useShiftBackspaceKeyboardListener, useShiftEnterKeyboardListener } from "../../../../../../../shared/modules/keyboard";
import { processGraphQLErrors } from "../../../../../../../shared/utils";
import { getEbaySalesChannelViewQuery } from "../../../../../../../shared/api/queries/salesChannels.js";
import { updateEbaySalesChannelViewMutation } from "../../../../../../../shared/api/mutations/salesChannels.js";
import apolloClient from "../../../../../../../../apollo-client";

interface EbayChoiceOption {
  label: string;
  value: string;
}

interface EbayStoreForm {
  id: string;
  name: string;
  url: string | null;
  fulfillmentPolicyId: string | null;
  fulfillmentPolicyChoices?: EbayChoiceOption[];
  paymentPolicyId: string | null;
  paymentPolicyChoices?: EbayChoiceOption[];
  returnPolicyId: string | null;
  returnPolicyChoices?: EbayChoiceOption[];
  merchantLocationKey: string | null;
  merchantLocationChoices?: EbayChoiceOption[];
  lengthUnit: string | null;
  weightUnit: string | null;
  isDefault: boolean;
}

const props = defineProps<{
  storeId: string;
  integrationId: string;
  integrationType: string;
}>();

const { t } = useI18n();
const router = useRouter();

const formData = ref<EbayStoreForm | null>(null);
const fieldErrors = ref<Record<string, string>>({});
const isLoading = ref(false);
const isSaving = ref(false);
const isSavingAndContinue = ref(false);
const submitButtonRef = ref();
const submitContinueButtonRef = ref();

const storesRoute = computed(() => ({
  name: 'integrations.integrations.show',
  params: { type: props.integrationType, id: props.integrationId },
  query: { tab: 'stores' },
}));

const withDefaults = (data: any): EbayStoreForm => ({
  id: data.id,
  name: data.name ?? '',
  url: data.url ?? '',
  fulfillmentPolicyId: data.fulfillmentPolicyId ?? null,
  fulfillmentPolicyChoices: data.fulfillmentPolicyChoices ?? [],
  paymentPolicyId: data.paymentPolicyId ?? null,
  paymentPolicyChoices: data.paymentPolicyChoices ?? [],
  returnPolicyId: data.returnPolicyId ?? null,
  returnPolicyChoices: data.returnPolicyChoices ?? [],
  merchantLocationKey: data.merchantLocationKey ?? null,
  merchantLocationChoices: data.merchantLocationChoices ?? [],
  lengthUnit: data.lengthUnit ?? null,
  weightUnit: data.weightUnit ?? null,
  isDefault: data.isDefault ?? false,
});

const defaultLengthUnitOptions = computed<EbayChoiceOption[]>(() => [
  { value: 'CENTIMETER', label: t('integrations.ebay.lengthUnits.centimeter') },
  { value: 'METER', label: t('integrations.ebay.lengthUnits.meter') },
  { value: 'INCH', label: t('integrations.ebay.lengthUnits.inch') },
  { value: 'FEET', label: t('integrations.ebay.lengthUnits.foot') },
]);

const defaultWeightUnitOptions = computed<EbayChoiceOption[]>(() => [
  { value: 'GRAM', label: t('integrations.ebay.weightUnits.gram') },
  { value: 'KILOGRAM', label: t('integrations.ebay.weightUnits.kilogram') },
  { value: 'OUNCE', label: t('integrations.ebay.weightUnits.ounce') },
  { value: 'POUND', label: t('integrations.ebay.weightUnits.pound') },
]);

const lengthUnitOptions = defaultLengthUnitOptions;

const weightUnitOptions = defaultWeightUnitOptions;

const fulfillmentPolicyOptions = computed(() =>
  formData.value?.fulfillmentPolicyChoices ?? [],
);

const paymentPolicyOptions = computed(() =>
  formData.value?.paymentPolicyChoices ?? [],
);

const returnPolicyOptions = computed(() =>
  formData.value?.returnPolicyChoices ?? [],
);

const merchantLocationOptions = computed(() =>
  formData.value?.merchantLocationChoices ?? [],
);

const goBack = () => {
  router.push(storesRoute.value);
};

const onSubmitPressed = () => submitButtonRef.value?.$el.click();
const onSubmitAndContinuePressed = () => submitContinueButtonRef.value?.$el.click();

useEnterKeyboardListener(onSubmitPressed);
useShiftEnterKeyboardListener(onSubmitAndContinuePressed);
useShiftBackspaceKeyboardListener(goBack);

const handleError = (errors) => {
  const validationErrors = processGraphQLErrors(errors, t);
  fieldErrors.value = validationErrors;
  if (validationErrors['__all__']) {
    Toast.error(validationErrors['__all__']);
  }
};

const loadStore = async () => {
  if (!props.storeId) {
    formData.value = null;
    return;
  }
  isLoading.value = true;
  fieldErrors.value = {};
  try {
    const { data } = await apolloClient.query({
      query: getEbaySalesChannelViewQuery,
      variables: { id: props.storeId },
      fetchPolicy: 'network-only',
    });
    const storeView = data?.ebaySalesChannelView;
    if (!storeView) {
      formData.value = null;
      Toast.error(t('shared.alert.toast.unexpectedResult'));
      return;
    }
    formData.value = withDefaults(storeView);
  } catch (errors) {
    formData.value = null;
    Toast.error(t('shared.alert.toast.unexpectedResult'));
  } finally {
    isLoading.value = false;
  }
};

const buildPayload = () => {
  if (!formData.value) {
    return null;
  }
  const {
    fulfillmentPolicyChoices,
    paymentPolicyChoices,
    returnPolicyChoices,
    merchantLocationChoices,
    ...payload
  } = formData.value;

  return {
    ...payload,
    url: payload.url === '' ? null : payload.url,
  };
};

const mutateStore = async () => {
  const payload = buildPayload();
  if (!payload) {
    return null;
  }
  fieldErrors.value = {};
  try {
    const { data } = await apolloClient.mutate({
      mutation: updateEbaySalesChannelViewMutation,
      variables: { data: payload },
    });
    const result = data?.updateEbaySalesChannelView;
    if (!result) {
      Toast.error(t('shared.alert.toast.unexpectedResult'));
      return null;
    }
    formData.value = withDefaults(result);
    return result;
  } catch (errors) {
    handleError(errors);
    return null;
  }
};

const handleSaveAndContinue = async () => {
  isSavingAndContinue.value = true;
  const result = await mutateStore();
  isSavingAndContinue.value = false;
  if (result) {
    Toast.success(t('shared.alert.toast.submitSuccessUpdate'));
  }
};

const handleSave = async () => {
  isSaving.value = true;
  const result = await mutateStore();
  isSaving.value = false;
  if (result) {
    Toast.success(t('shared.alert.toast.submitSuccessUpdate'));
    goBack();
  }
};

onMounted(loadStore);

watch(() => props.storeId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadStore();
  }
});
</script>

<template>
  <div class="space-y-6">
    <div v-if="isLoading" class="flex justify-center py-10">
      <span class="animate-spin border-2 border-black dark:border-white !border-l-transparent rounded-full w-6 h-6 inline-flex"></span>
    </div>

    <div v-else-if="formData" class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div class="px-4 py-6 sm:p-8 space-y-6">
        <div>
          <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
            {{ t('shared.labels.name') }}
          </Label>
          <TextInput v-model="formData.name" :placeholder="t('shared.placeholders.name')" class="w-full" />
          <p v-if="fieldErrors.name" class="mt-1 text-sm text-red-500">{{ fieldErrors.name }}</p>
        </div>

        <div>
          <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
            {{ t('shared.labels.url') }}
          </Label>
          <TextInput v-model="formData.url" class="w-full" />
          <p v-if="fieldErrors.url" class="mt-1 text-sm text-red-500">{{ fieldErrors.url }}</p>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <Label class="font-semibold text-sm text-gray-900">
              {{ t('integrations.labels.isDefaultMarketplace') }}
            </Label>
            <Toggle v-model="formData.isDefault" />
          </div>
          <p v-if="fieldErrors.isDefault" class="mt-1 text-sm text-red-500">{{ fieldErrors.isDefault }}</p>
        </div>

        <div>
          <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
            {{ t('integrations.labels.fulfillmentPolicy') }}
          </Label>
          <Selector
            v-model="formData.fulfillmentPolicyId"
            :options="fulfillmentPolicyOptions"
            label-by="label"
            value-by="value"
            :placeholder="t('shared.components.molecules.selector.defaultPlaceholder')"
          />
          <p v-if="fieldErrors.fulfillmentPolicyId" class="mt-1 text-sm text-red-500">{{ fieldErrors.fulfillmentPolicyId }}</p>
        </div>

        <div>
          <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
            {{ t('integrations.labels.paymentPolicy') }}
          </Label>
          <Selector
            v-model="formData.paymentPolicyId"
            :options="paymentPolicyOptions"
            label-by="label"
            value-by="value"
            :placeholder="t('shared.components.molecules.selector.defaultPlaceholder')"
          />
          <p v-if="fieldErrors.paymentPolicyId" class="mt-1 text-sm text-red-500">{{ fieldErrors.paymentPolicyId }}</p>
        </div>

        <div>
          <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
            {{ t('integrations.labels.returnPolicy') }}
          </Label>
          <Selector
            v-model="formData.returnPolicyId"
            :options="returnPolicyOptions"
            label-by="label"
            value-by="value"
            :placeholder="t('shared.components.molecules.selector.defaultPlaceholder')"
          />
          <p v-if="fieldErrors.returnPolicyId" class="mt-1 text-sm text-red-500">{{ fieldErrors.returnPolicyId }}</p>
        </div>

        <div>
          <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
            {{ t('integrations.labels.merchantLocation') }}
          </Label>
          <Selector
            v-model="formData.merchantLocationKey"
            :options="merchantLocationOptions"
            label-by="label"
            value-by="value"
            :placeholder="t('shared.components.molecules.selector.defaultPlaceholder')"
          />
          <p v-if="fieldErrors.merchantLocationKey" class="mt-1 text-sm text-red-500">{{ fieldErrors.merchantLocationKey }}</p>
        </div>

        <div>
          <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
            {{ t('integrations.labels.lengthUnit') }}
          </Label>
          <Selector
            v-model="formData.lengthUnit"
            :options="lengthUnitOptions"
            label-by="label"
            value-by="value"
            :placeholder="t('shared.components.molecules.selector.defaultPlaceholder')"
          />
          <p v-if="fieldErrors.lengthUnit" class="mt-1 text-sm text-red-500">{{ fieldErrors.lengthUnit }}</p>
        </div>

        <div>
          <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
            {{ t('integrations.labels.weightUnit') }}
          </Label>
          <Selector
            v-model="formData.weightUnit"
            :options="weightUnitOptions"
            label-by="label"
            value-by="value"
            :placeholder="t('shared.components.molecules.selector.defaultPlaceholder')"
          />
          <p v-if="fieldErrors.weightUnit" class="mt-1 text-sm text-red-500">{{ fieldErrors.weightUnit }}</p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
        <RouterLink :to="storesRoute">
          <CancelButton>
            {{ t('shared.button.back') }}
          </CancelButton>
        </RouterLink>

        <SecondaryButton
          ref="submitContinueButtonRef"
          :disabled="isSavingAndContinue"
          @click="handleSaveAndContinue"
        >
          {{ t('shared.button.saveAndContinue') }}
        </SecondaryButton>

        <PrimaryButton
          ref="submitButtonRef"
          :disabled="isSaving"
          @click="handleSave"
        >
          {{ t('shared.button.save') }}
        </PrimaryButton>
      </div>
    </div>
  </div>
</template>
