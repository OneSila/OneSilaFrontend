<script setup lang="ts">
import { toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Label } from "../../../../../../../shared/components/atoms/label";
import { Toggle } from "../../../../../../../shared/components/atoms/toggle";
import { TextInput } from "../../../../../../../shared/components/atoms/input-text";

interface GptFormData {
  gptEnable: boolean;
  gptEnableCheckout: boolean;
  gptSellerName: string;
  gptSellerUrl: string;
  gptSellerPrivacyPolicy: string;
  gptSellerTos: string;
  gptReturnPolicy: string;
  gptReturnWindow: number | null;
}

interface Props {
  formData: GptFormData;
  fieldErrors: Record<string, string>;
  hostname: string;
}

const props = defineProps<Props>();
const formData = toRef(props, 'formData');
const fieldErrors = toRef(props, 'fieldErrors');
const hostname = toRef(props, 'hostname');

const { t } = useI18n();

watch(
  () => formData.value.gptEnable,
  (enabled) => {
    if (!enabled) {
      formData.value.gptEnableCheckout = false;
    }
  },
);
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-12 items-center">
      <div class="md:col-span-4 col-span-12">
        <Flex gap="2" class="items-center">
          <FlexCell>
            <Label class="font-semibold text-sm text-gray-900">
              {{ t('integrations.labels.gptEnable') }}
            </Label>
          </FlexCell>
          <FlexCell>
            <Toggle v-model="formData.gptEnable" />
          </FlexCell>
        </Flex>
        <p class="text-red-500 text-sm mt-1" v-if="fieldErrors.gptEnable">
          {{ fieldErrors.gptEnable }}
        </p>
      </div>
      <div class="md:col-span-8 col-span-12 text-sm text-gray-400">
        {{ t('integrations.salesChannel.helpText.gptEnable') }}
      </div>
    </div>

    <div v-if="formData.gptEnable" class="space-y-6">
      <div class="grid grid-cols-12 gap-4">
        <div class="md:col-span-6 col-span-12">
          <Label class="font-semibold text-sm text-gray-900 mb-1">
            {{ t('integrations.labels.gptSellerName') }}
          </Label>
          <TextInput v-model="formData.gptSellerName" class="w-full" />
          <p class="text-red-500 text-sm mt-1" v-if="fieldErrors.gptSellerName">
            {{ fieldErrors.gptSellerName }}
          </p>
        </div>
        <div class="md:col-span-6 col-span-12">
          <Label class="font-semibold text-sm text-gray-900 mb-1">
            {{ t('integrations.labels.gptSellerUrl') }}
          </Label>
          <TextInput v-model="formData.gptSellerUrl" class="w-full" />
          <p class="text-red-500 text-sm mt-1" v-if="fieldErrors.gptSellerUrl">
            {{ fieldErrors.gptSellerUrl }}
          </p>
          <p class="text-sm text-gray-400 mt-1">
            {{ t('integrations.salesChannel.helpText.gptSellerUrl', { hostname }) }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-4">
        <div class="md:col-span-6 col-span-12">
          <Label class="font-semibold text-sm text-gray-900 mb-1">
            {{ t('integrations.labels.gptReturnPolicy') }}
          </Label>
          <TextInput v-model="formData.gptReturnPolicy" class="w-full" />
          <p class="text-red-500 text-sm mt-1" v-if="fieldErrors.gptReturnPolicy">
            {{ fieldErrors.gptReturnPolicy }}
          </p>
        </div>
        <div class="md:col-span-6 col-span-12">
          <Label class="font-semibold text-sm text-gray-900 mb-1">
            {{ t('integrations.labels.gptReturnWindow') }}
          </Label>
          <TextInput
            :model-value="formData.gptReturnWindow ?? ''"
            :number="true"
            :min-number="1"
            class="w-full md:w-24"
            @update:modelValue="(value) => { formData.gptReturnWindow = Number.isNaN(value) ? null : value; }"
          />
          <p class="text-red-500 text-sm mt-1" v-if="fieldErrors.gptReturnWindow">
            {{ fieldErrors.gptReturnWindow }}
          </p>
          <p class="text-sm text-gray-400 mt-1">
            {{ t('integrations.salesChannel.helpText.gptReturnWindow') }}
          </p>
        </div>
      </div>

      <div class="pt-4 mt-4 border-t border-gray-200 grid grid-cols-12 items-center">
        <div class="md:col-span-4 col-span-12">
          <Flex gap="2" class="items-center">
            <FlexCell>
              <Label class="font-semibold text-sm text-gray-900">
                {{ t('integrations.labels.gptEnableCheckout') }}
              </Label>
            </FlexCell>
            <FlexCell>
              <Toggle v-model="formData.gptEnableCheckout" />
            </FlexCell>
          </Flex>
          <p class="text-red-500 text-sm mt-1" v-if="fieldErrors.gptEnableCheckout">
            {{ fieldErrors.gptEnableCheckout }}
          </p>
        </div>
        <div class="md:col-span-8 col-span-12 text-sm text-gray-400">
          {{ t('integrations.salesChannel.helpText.gptEnableCheckout') }}
        </div>
      </div>

      <div v-if="formData.gptEnableCheckout" class="grid grid-cols-12 gap-4">
        <div class="md:col-span-6 col-span-12">
          <Label class="font-semibold text-sm text-gray-900 mb-1">
            {{ t('integrations.labels.gptSellerPrivacyPolicy') }}
          </Label>
          <TextInput v-model="formData.gptSellerPrivacyPolicy" class="w-full" />
          <p class="text-red-500 text-sm mt-1" v-if="fieldErrors.gptSellerPrivacyPolicy">
            {{ fieldErrors.gptSellerPrivacyPolicy }}
          </p>
        </div>
        <div class="md:col-span-6 col-span-12">
          <Label class="font-semibold text-sm text-gray-900 mb-1">
            {{ t('integrations.labels.gptSellerTos') }}
          </Label>
          <TextInput v-model="formData.gptSellerTos" class="w-full" />
          <p class="text-red-500 text-sm mt-1" v-if="fieldErrors.gptSellerTos">
            {{ fieldErrors.gptSellerTos }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
