<script setup lang="ts">
import MazPhoneNumberInput from 'maz-ui/components/MazPhoneNumberInput'
import type {CountryCode} from 'maz-ui/components/MazPhoneNumberInput';

import {ref} from 'vue'
import {useI18n} from "vue-i18n";
import {useAppStore} from "../../../plugins/store";
import {Label} from "../label";

const {locale} = useI18n();
const {t} = useI18n();
const app = useAppStore();

const props = defineProps<{
  modelValue?: any;
  label?: string;
  mandatory?: boolean;
}>();

const code = locale.value.toUpperCase();
const countryCode = ref<CountryCode>(code === 'EN' ? 'GB' as CountryCode : code as CountryCode);
const phoneNumber = ref(props.modelValue);

const emit = defineEmits({
  'update:modelValue': (value: any) => true,
});
const onUpdated = (results) => {
  let value = phoneNumber.value;
  if (results.hasOwnProperty('isValid') && results.hasOwnProperty('e164') && results.isValid) {
    value = results.e164;
  }
  emit('update:modelValue', value);
}

</script>

<template>
<Flex vertical class="w-full">
    <FlexCell>
      <Label v-if="label" class="font-semibold text-md">{{ label }}<span v-if="mandatory">*</span></Label>
    </FlexCell>
    <FlexCell>
      <MazPhoneNumberInput
          class="mt-2"
          size=sm
          v-model="phoneNumber"
          v-model:country-code="countryCode"
          show-code-on-list
          no-flags
          :preferred-countries="['GB', 'FR', 'BE', 'DE', 'US']"
          @update="onUpdated"
          :translations="{
          countrySelector: {
            placeholder: t('shared.placeholders.phoneInput.countrySelector.placeholder'),
            error: t('shared.placeholders.phoneInput.countrySelector.error'),
            searchPlaceholder: t('shared.placeholders.phoneInput.countrySelector.searchPlaceholder'),
          },
          phoneInput: {
            placeholder:  t('shared.placeholders.phoneInput.phoneInput.placeholder'),
            example: t('shared.placeholders.phoneInput.phoneInput.example'),
          }}"
      />
    </FlexCell>
  </Flex>
</template>

<style scoped>
:deep(.m-phone-number-input),
:deep(.m-input-wrapper) {
  width: 100% !important;
}
</style>
