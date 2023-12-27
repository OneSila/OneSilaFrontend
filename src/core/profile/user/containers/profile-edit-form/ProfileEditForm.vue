<script lang="ts" setup>
import { ref, watch, computed, defineProps, defineEmits } from 'vue';
import { updateMeMutation } from "./../../../../../shared/api/mutations/me";
import { TextInputPrepend } from '../../../../../shared/components/atoms/text-input-prepend';
import { Icon } from "../../../../../shared/components/atoms/icon";
import IconWhatsApp from '../../../../../shared/components/atoms/icons/icon-whatsapp.vue';
import IconTelegram from '../../../../../shared/components/atoms/icons/icon-telegram.vue';
import { Button } from "../../../../../shared/components/atoms/button";
import { MeData } from '../../meData';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps<{ meData: MeData }>();

const emit = defineEmits(['updateComplete', 'unsavedChanges']);

const form = ref({
  // firstName: props.meData.firstName || '',
  // lastName: props.meData.lastName || '',
  mobileNumber: props.meData.mobileNumber || '',
  whatsappNumber: props.meData.whatsappNumber || '',
  telegramNumber: props.meData.telegramNumber || ''
});

const getMutationVariables = () => {
  return {
    // firstName: form.value.firstName,
    // lastName: form.value.lastName,
    mobileNumber: form.value.mobileNumber,
    whatsappNumber: form.value.whatsappNumber,
    telegramNumber: form.value.telegramNumber
  };
};

const afterUpdate = () => {
  alert(t('profile.changesMade'));
  emit('updateComplete');
};

const hasUnsavedChanges = computed(() => {
  return props.meData.mobileNumber !== form.value.mobileNumber ||
         props.meData.whatsappNumber !== form.value.whatsappNumber ||
         props.meData.telegramNumber !== form.value.telegramNumber
});

watch(hasUnsavedChanges, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    emit('unsavedChanges', newVal);
  }
});
</script>


<template>
  <div>
<!--    <TextInputPrepend id="firstName" v-model="form.firstName" label="First Name" placeholder="Enter your first name">-->
<!--      <Icon name="user"/>-->
<!--    </TextInputPrepend>-->
<!--    <TextInputPrepend id="lastName" v-model="form.lastName" label="Last Name" placeholder="Enter your last name">-->
<!--      <Icon name="user"/>-->
<!--    </TextInputPrepend>-->
    <TextInputPrepend id="mobileNumber" v-model="form.mobileNumber" :label="t('profile.labels.mobileNumber')" :placeholder="t('profile.placeholders.mobileNumber')">
      <Icon name="phone"/>
    </TextInputPrepend>
    <TextInputPrepend id="whatsappNumber" v-model="form.whatsappNumber" :label="t('profile.labels.whatsappNumber')" :placeholder="t('profile.placeholders.whatsappNumber')">
      <IconWhatsApp />
    </TextInputPrepend>
    <TextInputPrepend id="telegramNumber" v-model="form.telegramNumber" :label="t('profile.labels.telegramNumber')" :placeholder="t('profile.placeholders.telegramNumber')">
      <IconTelegram />
    </TextInputPrepend>

    <ApolloMutation :mutation="updateMeMutation" :variables="getMutationVariables()" @done="afterUpdate">
      <template v-slot="{ mutate, loading, error }">
        <Button :disabled="loading" @click="mutate()">
          Update
        </Button>
        <p v-if="error">{{ error.message }}</p>
      </template>
    </ApolloMutation>
  </div>
</template>