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
import { useEnterKeyboardListener, useShiftBackspaceKeyboardListener, useShiftEnterKeyboardListener } from "../../../../../../../shared/modules/keyboard";
import { useRouter } from 'vue-router';
import { updateAmazonSalesChannelMutation } from "../../../../../../../shared/api/mutations/salesChannels.js";
import { processGraphQLErrors } from "../../../../../../../shared/utils";
import { AmazonRegions, AmazonCountries } from "../../../../integrations";
import {FieldDate} from "../../../../../../../shared/components/organisms/general-show/containers/field-date";
import { FieldType } from "../../../../../../../shared/utils/constants";

interface EditAmazonForm {
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
  accessToken?: string;
  refreshTokenExpiration?: string;
  region: string | null;
  country: string | null;
}

const props = defineProps<{ data: EditAmazonForm }>();
const { t } = useI18n();
const router = useRouter();

const formData = ref<EditAmazonForm>({ ...props.data });
const fieldErrors = ref<Record<string, string>>({});
const submitButtonRef = ref();
const submitContinueButtonRef = ref();

watch(() => props.data, (newData) => {
  formData.value = { ...newData };
}, { deep: true });

const accordionItems = [
  { name: 'throttling', label: t('integrations.show.sections.throttling'), icon: 'gauge' },
  { name: 'sync', label: t('integrations.show.sections.syncPreferences'), icon: 'sync' },
];

const regionLabel = computed(() => {
  switch (formData.value.region) {
    case AmazonRegions.NORTH_AMERICA:
      return t('integrations.regions.northAmerica');
    case AmazonRegions.EUROPE:
      return t('integrations.regions.europe');
    case AmazonRegions.FAR_EAST:
      return t('integrations.regions.farEast');
    default:
      return '';
  }
});

const countryLabel = computed(() => {
  switch (formData.value.country) {
    case AmazonCountries.CANADA:
      return t('integrations.countries.canada');
    case AmazonCountries.UNITED_STATES:
      return t('integrations.countries.unitedStates');
    case AmazonCountries.MEXICO:
      return t('integrations.countries.mexico');
    case AmazonCountries.BRAZIL:
      return t('integrations.countries.brazil');
    case AmazonCountries.IRELAND:
      return t('integrations.countries.ireland');
    case AmazonCountries.SPAIN:
      return t('integrations.countries.spain');
    case AmazonCountries.UNITED_KINGDOM:
      return t('integrations.countries.unitedKingdom');
    case AmazonCountries.FRANCE:
      return t('integrations.countries.france');
    case AmazonCountries.BELGIUM:
      return t('integrations.countries.belgium');
    case AmazonCountries.NETHERLANDS:
      return t('integrations.countries.netherlands');
    case AmazonCountries.GERMANY:
      return t('integrations.countries.germany');
    case AmazonCountries.ITALY:
      return t('integrations.countries.italy');
    case AmazonCountries.SWEDEN:
      return t('integrations.countries.sweden');
    case AmazonCountries.SOUTH_AFRICA:
      return t('integrations.countries.southAfrica');
    case AmazonCountries.POLAND:
      return t('integrations.countries.poland');
    case AmazonCountries.EGYPT:
      return t('integrations.countries.egypt');
    case AmazonCountries.TURKEY:
      return t('integrations.countries.turkey');
    case AmazonCountries.SAUDI_ARABIA:
      return t('integrations.countries.saudiArabia');
    case AmazonCountries.UNITED_ARAB_EMIRATES:
      return t('integrations.countries.unitedArabEmirates');
    case AmazonCountries.INDIA:
      return t('integrations.countries.india');
    case AmazonCountries.SINGAPORE:
      return t('integrations.countries.singapore');
    case AmazonCountries.AUSTRALIA:
      return t('integrations.countries.australia');
    case AmazonCountries.JAPAN:
      return t('integrations.countries.japan');
    default:
      return '';
  }
});

const refreshClass = computed(() => {
  if (!formData.value.refreshTokenExpiration) return '';
  const expiration = new Date(formData.value.refreshTokenExpiration);
  const now = new Date();
  const diff = expiration.getTime() - now.getTime();
  const months = diff / (1000 * 60 * 60 * 24 * 30);
  if (months > 6) return 'text-green-600';
  if (months >= 1) return 'text-yellow-600';
  return 'text-red-600';
});

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

const onSubmitPressed = () => submitButtonRef.value?.$el.click();
const onSubmitAndContinuePressed = () => submitContinueButtonRef.value?.$el.click();
const handleRefresh = () => {
  alert('Refresh token');
};

useEnterKeyboardListener(onSubmitPressed);
useShiftEnterKeyboardListener(onSubmitAndContinuePressed);
useShiftBackspaceKeyboardListener(goBack);
</script>

<template>
  <div class="space-y-12">

    <div class="grid grid-cols-12 gap-4">
      <div class="md:col-span-6 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('integrations.labels.refreshTokenExpiration') }}
        </Label>
        <div class="flex items-center gap-4">
          <FieldDate :class="refreshClass" :field="{ name: 'refreshTokenExpiration', type: FieldType.Date }" :model-value="formData.refreshTokenExpiration || ''" />
          <PrimaryButton @click="handleRefresh">{{ t('shared.button.refresh') }}</PrimaryButton>
        </div>
      </div>
    </div>

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
          {{ t('integrations.labels.region') }}
        </Label>
        <TextInput :model-value="regionLabel" disabled class="w-full" />
      </div>
      <div class="md:col-span-6 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('integrations.labels.country') }}
        </Label>
        <TextInput :model-value="countryLabel" disabled class="w-full" />
      </div>
    </div>

    <Accordion class="mt-8" :items="accordionItems">
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
          <div class="grid grid-cols-12 items-center" v-for="toggleField in ['useConfigurableName','syncContents','syncEanCodes','syncPrices','importOrders']" :key="toggleField">
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

    <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 pt-4 sm:px-8">
      <RouterLink :to="{ name: 'integrations.integrations.list' }">
        <CancelButton>
          {{ t('shared.button.back') }}
        </CancelButton>
      </RouterLink>

      <ApolloMutation :mutation="updateAmazonSalesChannelMutation" @done="handleSubmitAndContinueDone" @error="handleError">
        <template #default="{ mutate, loading }">
          <SecondaryButton ref="submitContinueButtonRef" :disabled="loading" @click="cleanupAndMutate(mutate)">
            {{ t('shared.button.saveAndContinue') }}
          </SecondaryButton>
        </template>
      </ApolloMutation>

      <ApolloMutation :mutation="updateAmazonSalesChannelMutation" @done="handleSubmitDone" @error="handleError">
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
      ⚠️ {{ t('integrations.show.amazonNotConnectedBanner.title') }}
    </span>
    {{ t('integrations.show.amazonNotConnectedBanner.content') }}
  </div>
</template>
