<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {TextInput} from "../../../../../../shared/components/atoms/input-text";
import {Label} from "../../../../../../shared/components/atoms/label";
import {Toggle} from "../../../../../../shared/components/atoms/toggle";
import {Selector} from "../../../../../../shared/components/atoms/selector";
import { AuthenticationMethod } from "../../../integrations";
import {cleanUpDataForMutation} from "../../../../../../shared/components/organisms/general-form/formConfig";
import {processGraphQLErrors} from "../../../../../../shared/utils";
import {
  useEnterKeyboardListener, useShiftBackspaceKeyboardListener,
  useShiftDeleteKeyboardListener,
  useShiftEnterKeyboardListener
} from "../../../../../../shared/modules/keyboard";
import {  useRouter } from "vue-router";
import {updateMagentoSalesChannelMutation} from "../../../../../../shared/api/mutations/salesChannels.js";
import {Toast} from "../../../../../../shared/modules/toast";
import {PrimaryButton} from "../../../../../../shared/components/atoms/button-primary";
import {SecondaryButton} from "../../../../../../shared/components/atoms/button-secondary";
import {CancelButton} from "../../../../../../shared/components/atoms/button-cancel";

interface EditMagentoForm {
  hostname: string;
  active: boolean;
  verifySsl: boolean;
  requestsPerMinute: number;
  maxRetries: number;
  useConfigurableName: boolean;
  syncContents: boolean;
  syncEanCodes: boolean;
  syncPrices: boolean;
  authenticationMethod: string;
  hostApiUsername: string | null;
  hostApiKey: string;
}

// Localization
const { t } = useI18n();
const props = defineProps<{ data: EditMagentoForm }>();

const formData = ref<EditMagentoForm>({ ...props.data });
const submitButtonRef = ref();
const submitContinueButtonRef = ref();
const fieldErrors = ref<Record<string, string>>({});

const router = useRouter();

watch(
  () => props.data,
  (newData) => {
    formData.value = { ...newData };
  },
  { deep: true }
);

const authMethodChoices = [
  {id: AuthenticationMethod.TOKEN, text: t('integrations.create.authMethod.token')},
  {id: AuthenticationMethod.PASSWORD, text: t('integrations.create.authMethod.password')}
];

const cleanupAndMutate = async (mutate) => {
  fieldErrors.value = {};
  const result = await mutate({ variables: { data: formData.value } });
};


const handleError = (errors) => {
  const validationErrors = processGraphQLErrors(errors, t);
  fieldErrors.value = validationErrors;
  if (validationErrors['__all__']) {
    Toast.error(validationErrors['__all__']);
  }
}

const goBack = () => {
  router.push({name: 'integrations.integrations.list'});
}

// const onDeletePressed = () => {
//   deleteButtonRef.value?.$el.click();
// };

const onSubmitAndContinuePressed = () => {
  submitContinueButtonRef.value?.$el.click();
};

const onSubmitPressed = () => {
  submitButtonRef.value?.$el.click();
};

const handleSubmitDone = () => {
  Toast.success(t('shared.alert.toast.submitSuccessUpdate'));
  router.push({ name: 'integrations.integrations.list' });
};

const handleSubmitAndContinueDone = () => {
  Toast.success(t('shared.alert.toast.submitSuccessUpdate'));
};

// useShiftDeleteKeyboardListener(onDeletePressed);
useShiftEnterKeyboardListener(onSubmitAndContinuePressed);
useEnterKeyboardListener(onSubmitPressed);
useShiftBackspaceKeyboardListener(goBack);

</script>

<template>
  <div class="space-y-12">
    <div class="grid grid-cols-12 gap-4">
      <div class="md:col-span-8 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('integrations.labels.hostname') }}
        </Label>
        <TextInput
          v-model="formData.hostname"
          placeholder="https://example.com"
          disabled
          class="w-full" />
      </div>
      <div class="md:col-span-2 col-span-6">
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
      <div class="md:col-span-2 col-span-6">
        <Flex class="mt-8" gap="2">
          <FlexCell>
            <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
              {{ t('integrations.labels.verifySSL') }}
            </Label>
          </FlexCell>
          <FlexCell>
            <Toggle v-model="formData.verifySsl" />
          </FlexCell>
        </Flex>
      </div>
    </div>

    <!-- Row 2: Requests Per Minute (6 cols) and Max Retries (6 cols) -->
    <div class="grid grid-cols-12 gap-4">
      <div class="md:col-span-6 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('integrations.labels.requestsPerMinute') }}
        </Label>
        <TextInput v-model="formData.requestsPerMinute" :number="true" placeholder="60" class="w-full" />
          <div class="mt-1 text-sm leading-6 text-gray-400">
            <p class="text-red-500" v-if="fieldErrors['requestsPerMinute']">{{ fieldErrors['requestsPerMinute'] }}</p>
            <p>{{ t('integrations.salesChannel.helpText.requestsPerMinute') }}</p>
          </div>
      </div>
      <div class="md:col-span-6 col-span-12">
        <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
          {{ t('integrations.labels.maxRetries') }}
        </Label>
        <TextInput v-model="formData.maxRetries" :number="true" :min-number="1" :max-number="20" placeholder="3" class="w-full" />
          <div class="mt-1 text-sm leading-6 text-gray-400">
            <p class="text-red-500" v-if="fieldErrors['maxRetries']">{{ fieldErrors['maxRetries'] }}</p>
            <p>{{ t('integrations.salesChannel.helpText.maxRetries') }}</p>
          </div>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <div class="md:col-span-3 col-span-6">
        <Flex gap="2">
          <FlexCell>
            <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
               {{ t('integrations.labels.useConfigurableName') }}
            </Label>
          </FlexCell>
          <FlexCell>
            <Toggle v-model="formData.useConfigurableName" />
          </FlexCell>
        </Flex>
      </div>
      <div class="md:col-span-3 col-span-6">
        <Flex gap="2">
          <FlexCell>
            <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
               {{ t('integrations.labels.syncContents') }}
            </Label>
          </FlexCell>
          <FlexCell>
            <Toggle v-model="formData.syncContents" />
          </FlexCell>
        </Flex>
      </div>
      <div class="md:col-span-3 col-span-6">
        <Flex gap="2">
          <FlexCell>
            <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
               {{ t('integrations.labels.syncEanCodes') }}
            </Label>
          </FlexCell>
          <FlexCell>
            <Toggle v-model="formData.syncEanCodes" />
          </FlexCell>
        </Flex>
      </div>
      <div class="md:col-span-3 col-span-6">
        <Flex gap="2">
          <FlexCell>
            <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
               {{ t('integrations.labels.syncPrices') }}
            </Label>
          </FlexCell>
          <FlexCell>
            <Toggle v-model="formData.syncPrices" />
          </FlexCell>
        </Flex>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <div class="md:col-span-4 col-span-12">
        <Flex vertical>
          <FlexCell>
            <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
              {{ t('integrations.labels.authenticationMethod') }}
            </Label>
          </FlexCell>
          <FlexCell>
            <Selector
              v-model="formData.authenticationMethod"
              :options="authMethodChoices"
              value-by="id"
              label-by="text"
              :removable="false" />
          </FlexCell>
        </Flex>
      </div>

      <div class="md:col-span-4 col-span-6" v-if="formData.authenticationMethod === AuthenticationMethod.PASSWORD">
        <Flex vertical>
          <FlexCell>
            <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
              {{ t('integrations.labels.hostApiUsername') }}
            </Label>
          </FlexCell>
          <FlexCell>
            <TextInput v-model="formData.hostApiUsername" :placeholder="t('integrations.placeholders.hostApiUsername')" class="w-full" />
          </FlexCell>
        </Flex>
      </div>
      <!-- Host API Key -->
      <div class="md:col-span-4 col-span-6">
        <Flex vertical>
          <FlexCell>
            <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
              {{
                formData.authenticationMethod === AuthenticationMethod.PASSWORD
                  ? t('auth.register.labels.password')
                  : t('integrations.labels.hostApiKey')
              }}
            </Label>
          </FlexCell>
          <FlexCell>
            <TextInput class="w-full" v-model="formData.hostApiKey"
              :placeholder="formData.authenticationMethod === AuthenticationMethod.PASSWORD
                ? t('auth.register.placeholders.password')
                : t('integrations.placeholders.hostApiKey')"
              :secret="formData.authenticationMethod === AuthenticationMethod.PASSWORD" />
          </FlexCell>
        </Flex>
      </div>
    </div>

     <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
    <!-- Cancel Button -->
    <RouterLink :to="{ name: 'integrations.integrations.list' }">
      <CancelButton>
        {{ t('shared.button.back') }}
      </CancelButton>
    </RouterLink>

    <!-- Save and Continue Button -->
    <ApolloMutation :mutation="updateMagentoSalesChannelMutation" @done="handleSubmitAndContinueDone" @error="handleError">
      <template #default="{ mutate, loading }">
        <SecondaryButton ref="submitContinueButtonRef" :disabled="loading" @click="cleanupAndMutate(mutate)">
          {{ t('shared.button.saveAndContinue') }}
        </SecondaryButton>
      </template>
    </ApolloMutation>

    <!-- Save Button -->
    <ApolloMutation :mutation="updateMagentoSalesChannelMutation" @done="handleSubmitDone" @error="handleError">
      <template #default="{ mutate, loading }">
        <PrimaryButton ref="submitButtonRef" :disabled="loading" @click="cleanupAndMutate(mutate)">
          {{ t('shared.button.save') }}
        </PrimaryButton>
      </template>
    </ApolloMutation>
  </div>

  </div>
</template>