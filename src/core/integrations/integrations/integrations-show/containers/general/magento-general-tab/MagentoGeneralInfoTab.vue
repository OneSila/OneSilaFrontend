<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { TextInput } from "../../../../../../../shared/components/atoms/input-text";
import { Label } from "../../../../../../../shared/components/atoms/label";
import { Toggle } from "../../../../../../../shared/components/atoms/toggle";
import { Selector } from "../../../../../../../shared/components/atoms/selector";
import { AuthenticationMethod } from "../../../../integrations";
import { processGraphQLErrors } from "../../../../../../../shared/utils";
import {
  useEnterKeyboardListener, useShiftBackspaceKeyboardListener,
  useShiftEnterKeyboardListener
} from "../../../../../../../shared/modules/keyboard";
import { useRouter } from "vue-router";
import { updateMagentoSalesChannelMutation } from "../../../../../../../shared/api/mutations/salesChannels.js";
import { Toast } from "../../../../../../../shared/modules/toast";
import { PrimaryButton } from "../../../../../../../shared/components/atoms/button-primary";
import { SecondaryButton } from "../../../../../../../shared/components/atoms/button-secondary";
import { CancelButton } from "../../../../../../../shared/components/atoms/button-cancel";
import { Accordion } from "../../../../../../../shared/components/atoms/accordion";

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
  importOrders: boolean;
  startingStock: number | null;
  authenticationMethod: string;
  hostApiUsername: string | null;
  hostApiKey: string;
}

// Localization
const {t} = useI18n();
const props = defineProps<{ data: EditMagentoForm }>();

const formData = ref<EditMagentoForm>({
  ...props.data,
  startingStock: props.data.startingStock ?? null
});
const submitButtonRef = ref();
const submitContinueButtonRef = ref();
const fieldErrors = ref<Record<string, string>>({});

const router = useRouter();

const accordionItems = [
  {name: 'throttling', label: t('integrations.show.sections.throttling'), icon: 'gauge'},
  {name: 'sync', label: t('integrations.show.sections.syncPreferences'), icon: 'sync'},
  {name: 'authentication', label: t('integrations.show.sections.authentication'), icon: 'lock'}
];


watch(
    () => props.data,
    (newData) => {
      formData.value = {
        ...newData,
        startingStock: newData.startingStock ?? null
      };
    },
    {deep: true}
);

const authMethodChoices = [
  {id: AuthenticationMethod.TOKEN, text: t('integrations.create.authMethod.token')},
  {id: AuthenticationMethod.PASSWORD, text: t('integrations.create.authMethod.password')}
];

const cleanupAndMutate = async (mutate) => {
  fieldErrors.value = {};
  const result = await mutate({variables: {data: formData.value}});
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

const onSubmitAndContinuePressed = () => {
  submitContinueButtonRef.value?.$el.click();
};

const onSubmitPressed = () => {
  submitButtonRef.value?.$el.click();
};

const handleSubmitDone = () => {
  Toast.success(t('shared.alert.toast.submitSuccessUpdate'));
  router.push({name: 'integrations.integrations.list'});
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
            class="w-full"/>
      </div>
      <div class="md:col-span-2 col-span-6">
        <Flex class="mt-8" gap="2">
          <FlexCell>
            <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
              {{ t('shared.labels.active') }}
            </Label>
          </FlexCell>
          <FlexCell>
            <Toggle v-model="formData.active"/>
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
            <Toggle v-model="formData.verifySsl"/>
          </FlexCell>
        </Flex>
      </div>
    </div>

    <Accordion class="mt-8" :items="accordionItems">

      <!-- Throttling -->
      <template #throttling>
        <div class="grid grid-cols-12 gap-4">
          <div class="md:col-span-6 col-span-12">
            <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
              {{ t('integrations.labels.requestsPerMinute') }}
            </Label>
            <TextInput v-model="formData.requestsPerMinute" :number="true" placeholder="60" class="w-full"/>
            <div class="mt-1 text-sm leading-6 text-gray-400">
              <p class="text-red-500" v-if="fieldErrors['requestsPerMinute']">{{ fieldErrors['requestsPerMinute'] }}</p>
              <p>{{ t('integrations.salesChannel.helpText.requestsPerMinute') }}</p>
            </div>
          </div>

          <div class="md:col-span-6 col-span-12">
            <Label class="font-semibold block text-sm leading-6 text-gray-900 mb-1">
              {{ t('integrations.labels.maxRetries') }}
            </Label>
            <TextInput v-model="formData.maxRetries" :number="true" :min-number="1" :max-number="20" placeholder="3"
                       class="w-full"/>
            <div class="mt-1 text-sm leading-6 text-gray-400">
              <p class="text-red-500" v-if="fieldErrors['maxRetries']">{{ fieldErrors['maxRetries'] }}</p>
              <p>{{ t('integrations.salesChannel.helpText.maxRetries') }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Sync Preferences -->
      <template #sync>
        <div class="space-y-4">
          <!-- useConfigurableName -->
          <div class="grid grid-cols-12 items-center">
            <div class="md:col-span-4 col-span-12">
              <Flex gap="2">
                <FlexCell>
                  <Label class="font-semibold text-sm text-gray-900 mb-1">
                    {{ t('integrations.labels.useConfigurableName') }}
                  </Label>
                </FlexCell>
                <FlexCell>
                  <Toggle v-model="formData.useConfigurableName"/>
                </FlexCell>
              </Flex>
            </div>
            <div class="md:col-span-8 col-span-12 text-sm text-gray-400">
              {{ t('integrations.salesChannel.helpText.useConfigurableName') }}
            </div>
          </div>

          <!-- syncContents -->
          <div class="grid grid-cols-12 items-center">
            <div class="md:col-span-4 col-span-12">
              <Flex gap="2">
                <FlexCell>
                  <Label class="font-semibold text-sm text-gray-900 mb-1">
                    {{ t('integrations.labels.syncContents') }}
                  </Label>
                </FlexCell>
                <FlexCell>
                  <Toggle v-model="formData.syncContents"/>
                </FlexCell>
              </Flex>
            </div>
            <div class="md:col-span-8 col-span-12 text-sm text-gray-400">
              {{ t('integrations.salesChannel.helpText.syncContents') }}
            </div>
          </div>

          <!-- syncEanCodes -->
          <div class="grid grid-cols-12 items-center">
            <div class="md:col-span-4 col-span-12">
              <Flex gap="2">
                <FlexCell>
                  <Label class="font-semibold text-sm text-gray-900 mb-1">
                    {{ t('integrations.labels.syncEanCodes') }}
                  </Label>
                </FlexCell>
                <FlexCell>
                  <Toggle v-model="formData.syncEanCodes"/>
                </FlexCell>
              </Flex>
            </div>
            <div class="md:col-span-8 col-span-12 text-sm text-gray-400">
              {{ t('integrations.salesChannel.helpText.syncEanCodes') }}
            </div>
          </div>

          <!-- syncPrices -->
          <div class="grid grid-cols-12 items-center">
            <div class="md:col-span-4 col-span-12">
              <Flex gap="2">
                <FlexCell>
                  <Label class="font-semibold text-sm text-gray-900 mb-1">
                    {{ t('integrations.labels.syncPrices') }}
                  </Label>
                </FlexCell>
                <FlexCell>
                  <Toggle v-model="formData.syncPrices"/>
                </FlexCell>
              </Flex>
            </div>
            <div class="md:col-span-8 col-span-12 text-sm text-gray-400">
              {{ t('integrations.salesChannel.helpText.syncPrices') }}
            </div>
          </div>

          <!-- importOrders -->
          <div class="grid grid-cols-12 items-center">
            <div class="md:col-span-4 col-span-12">
              <Flex gap="2">
                <FlexCell>
                  <Label class="font-semibold text-sm text-gray-900 mb-1">
                    {{ t('integrations.labels.importOrders') }}
                  </Label>
                </FlexCell>
                <FlexCell>
                  <Toggle v-model="formData.importOrders"/>
                </FlexCell>
              </Flex>
            </div>
            <div class="md:col-span-8 col-span-12 text-sm text-gray-400">
              {{ t('integrations.salesChannel.helpText.importOrders') }}
            </div>
          </div>

          <div class="pt-4 mt-4 border-t border-gray-200">
            <div class="mb-2 text-sm font-semibold text-gray-900">
              {{ t('shared.tabs.advanced') }}
            </div>
            <div class="grid grid-cols-12 gap-4">
              <div class="md:col-span-4 col-span-12">
                <Label class="font-semibold text-sm text-gray-900 mb-1">
                  {{ t('integrations.labels.startingStock') }}
                </Label>
                <TextInput
                    :model-value="formData.startingStock ?? ''"
                    :number="true"
                    :min-number="0"
                    class="w-full"
                    @update:modelValue="(value) => { formData.startingStock = Number.isNaN(value) ? null : value; }"
                />
                <div class="mt-1 text-sm text-gray-400">
                  <p class="text-red-500" v-if="fieldErrors['startingStock']">{{ fieldErrors['startingStock'] }}</p>
                  <p>{{ t('integrations.salesChannel.helpText.startingStock') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Authentication -->
      <template #authentication>
        <div class="grid grid-cols-12 gap-4">
          <div class="md:col-span-4 col-span-12">
            <Flex vertical>
              <Label class="font-semibold text-sm text-gray-900 mb-1">
                {{ t('integrations.labels.authenticationMethod') }}
              </Label>
              <Selector
                  v-model="formData.authenticationMethod"
                  :options="authMethodChoices"
                  value-by="id"
                  label-by="text"
                  :removable="false"
              />
            </Flex>
          </div>

          <div
              class="md:col-span-4 col-span-6"
              v-if="formData.authenticationMethod === AuthenticationMethod.PASSWORD"
          >
            <Flex vertical>
              <Label class="font-semibold text-sm text-gray-900 mb-1">
                {{ t('integrations.labels.hostApiUsername') }}
              </Label>
              <TextInput
                  v-model="formData.hostApiUsername"
                  :placeholder="t('integrations.placeholders.hostApiUsername')"
                  class="w-full"
              />
            </Flex>
          </div>

          <div class="md:col-span-4 col-span-6">
            <Flex vertical>
              <Label class="font-semibold text-sm text-gray-900 mb-1">
                {{
                  formData.authenticationMethod === AuthenticationMethod.PASSWORD
                      ? t('auth.register.labels.password')
                      : t('integrations.labels.hostApiKey')
                }}
              </Label>
              <TextInput
                  class="w-full"
                  v-model="formData.hostApiKey"
                  :placeholder="formData.authenticationMethod === AuthenticationMethod.PASSWORD
                  ? t('auth.register.placeholders.password')
                  : t('integrations.placeholders.hostApiKey')"
                  :secret="formData.authenticationMethod === AuthenticationMethod.PASSWORD"
              />
            </Flex>
          </div>
        </div>
      </template>

    </Accordion>


    <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
      <!-- Cancel Button -->
      <RouterLink :to="{ name: 'integrations.integrations.list' }">
        <CancelButton>
          {{ t('shared.button.back') }}
        </CancelButton>
      </RouterLink>

      <!-- Save and Continue Button -->
      <ApolloMutation :mutation="updateMagentoSalesChannelMutation" @done="handleSubmitAndContinueDone"
                      @error="handleError">
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