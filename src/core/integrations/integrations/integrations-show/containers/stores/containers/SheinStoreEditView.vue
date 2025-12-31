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
import { getSheinSalesChannelViewQuery } from "../../../../../../../shared/api/queries/salesChannels.js";
import { updateSheinSalesChannelViewMutation } from "../../../../../../../shared/api/mutations/salesChannels.js";
import apolloClient from "../../../../../../../../apollo-client";

interface ChoiceOption {
  label: string;
  value: string;
}

interface SheinStoreForm {
  id: string;
  name: string;
  url: string | null;
  siteStatus: number | null;
  storeType: number | null;
  isDefault: boolean;
  merchantLocationKey: string | null;
  merchantLocationChoices?: unknown[];
}

const props = defineProps<{
  storeId: string;
  integrationId: string;
  integrationType: string;
}>();

const { t } = useI18n();
const router = useRouter();

const formData = ref<SheinStoreForm | null>(null);
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

const normalizeChoices = (raw: unknown[] | null | undefined): ChoiceOption[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  const options: ChoiceOption[] = [];
  raw.forEach((entry) => {
    if (typeof entry === 'string') {
      options.push({ value: entry, label: entry });
      return;
    }
    if (entry && typeof entry === 'object') {
      const warehouseCode = (entry as any).warehouseCode;
      const warehouseName = (entry as any).warehouseName;
      const saleCountryList = (entry as any).saleCountryList;
      if (typeof warehouseCode === 'string') {
        const namePart = typeof warehouseName === 'string' && warehouseName.trim() !== '' ? warehouseName : warehouseCode;
        const countriesPart = Array.isArray(saleCountryList) && saleCountryList.length
          ? ` · ${saleCountryList.filter((v: any) => typeof v === 'string').join(',')}`
          : '';
        options.push({ value: warehouseCode, label: `${namePart} (${warehouseCode})${countriesPart}` });
        return;
      }

      const value = (entry as any).value;
      const label = (entry as any).label;
      if (typeof value === 'string' && typeof label === 'string') {
        options.push({ value, label });
        return;
      }
      const candidate = (entry as any).key ?? (entry as any).code ?? (entry as any).name;
      if (typeof candidate === 'string') {
        options.push({ value: candidate, label: candidate });
      }
    }
  });
  return options;
};

const merchantLocationOptions = computed<ChoiceOption[]>(() =>
  normalizeChoices(formData.value?.merchantLocationChoices),
);

const withDefaults = (data: any): SheinStoreForm => ({
  id: data.id,
  name: data.name ?? '',
  url: data.url ?? '',
  siteStatus: typeof data.siteStatus === 'number' ? data.siteStatus : null,
  storeType: typeof data.storeType === 'number' ? data.storeType : null,
  isDefault: data.isDefault ?? false,
  merchantLocationKey: data.merchantLocationKey ?? null,
  merchantLocationChoices: data.merchantLocationChoices ?? [],
});

const storeStatusChecked = computed(() => formData.value?.siteStatus === 1);
const storeStatusLabel = computed(() =>
  storeStatusChecked.value ? t('shared.labels.active') : t('shared.labels.inactive'),
);

const storeTypeLabel = computed(() => {
  const value = formData.value?.storeType;
  if (value === 1) {
    return t('integrations.show.stores.shein.storeType.platform');
  }
  if (value === 2) {
    return t('integrations.show.stores.shein.storeType.selfOperated');
  }
  return value === null || value === undefined ? '' : String(value);
});

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
      query: getSheinSalesChannelViewQuery,
      variables: { id: props.storeId },
      fetchPolicy: 'network-only',
    });
    const storeView = data?.sheinSalesChannelViews?.edges?.[0]?.node ?? null;
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
  const { merchantLocationChoices, siteStatus, storeType, ...payload } = formData.value;
  const normalizedUrl = payload.url === '' ? null : payload.url;
  const normalizedMerchantLocationKey = payload.merchantLocationKey === '' ? null : payload.merchantLocationKey;
  return { ...payload, url: normalizedUrl, merchantLocationKey: normalizedMerchantLocationKey };
};

const mutateStore = async () => {
  const payload = buildPayload();
  if (!payload) {
    return null;
  }
  fieldErrors.value = {};
  try {
    const { data } = await apolloClient.mutate({
      mutation: updateSheinSalesChannelViewMutation,
      variables: { data: payload },
    });
    const result = data?.updateSheinSalesChannelView;
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
            {{ t('integrations.show.stores.labels.siteStatus') }}
          </Label>
          <div class="flex items-center gap-x-3">
            <div class="pointer-events-none opacity-70">
              <Toggle :model-value="storeStatusChecked" />
            </div>
            <span class="text-sm text-gray-700">{{ storeStatusLabel }}</span>
          </div>
        </div>

        <div>
          <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
            {{ t('integrations.show.stores.labels.storeType') }}
          </Label>
          <TextInput :model-value="storeTypeLabel" class="w-full" :disabled="true" />
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
