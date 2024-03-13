<script lang="ts" setup>
import { ref, watch, computed, defineProps, defineEmits } from 'vue';
import { updateMyCompanyMutation } from "./../../../../../shared/api/mutations/me";
import { TextInputPrepend } from '../../../../../shared/components/atoms/text-input-prepend';
import { Icon } from "../../../../../shared/components/atoms/icon";
import { Button } from "../../../../../shared/components/atoms/button";
import { MeCompanyData } from '../../meCompanyData';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps<{ companyData: MeCompanyData }>();

const emit = defineEmits(['updateComplete', 'unsavedChanges']);

const form = ref({ ...props.companyData });

const getMutationVariables = () => {
  return {
    name: form.value.name,
    address1: form.value.address1,
    address2: form.value.address2,
    postcode: form.value.postcode,
    city: form.value.city,
    email: form.value.email,
    phoneNumber: form.value.phoneNumber,
    vatNumber: form.value.vatNumber,
    website: form.value.website
  };
};

const afterUpdate = () => {
  alert(t('companyProfile.messages.changesMade'));
  emit('updateComplete');
};

const hasUnsavedChanges = computed(() => {
  return JSON.stringify(props.companyData) !== JSON.stringify(form.value);
});

watch(hasUnsavedChanges, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    emit('unsavedChanges', newVal);
  }
});
</script>

<template>
  <div>
    <TextInputPrepend id="name" v-model="form.name" :label="t('companyProfile.labels.companyName')" :placeholder="t('companyProfile.placeholders.companyName')">
      <Icon name="building"/>
    </TextInputPrepend>
    <TextInputPrepend id="email" v-model="form.email" :label="t('companyProfile.labels.email')" :placeholder="t('companyProfile.placeholders.email')">
      <Icon name="envelope"/>
    </TextInputPrepend>
    <TextInputPrepend id="phoneNumber" v-model="form.phoneNumber" :label="t('companyProfile.labels.phoneNumber')" :placeholder="t('companyProfile.placeholders.phoneNumber')">
      <Icon name="phone"/>
    </TextInputPrepend>
    <TextInputPrepend id="address1" v-model="form.address1" :label="t('companyProfile.labels.address1')" :placeholder="t('companyProfile.placeholders.address1')">
      <Icon name="map-location"/>
    </TextInputPrepend>
    <TextInputPrepend id="address2" v-model="form.address2" :label="t('companyProfile.labels.address2')" :placeholder="t('companyProfile.placeholders.address2')">
      <Icon name="map-marker"/>
    </TextInputPrepend>
    <TextInputPrepend id="city" v-model="form.city" :label="t('companyProfile.labels.city')" :placeholder="t('companyProfile.placeholders.city')">
      <Icon name="city"/>
    </TextInputPrepend>
    <TextInputPrepend id="postcode" v-model="form.postcode" :label="t('companyProfile.labels.postcode')" :placeholder="t('companyProfile.placeholders.postcode')">
      <Icon name="signs-post"/>
    </TextInputPrepend>
    <TextInputPrepend id="vatNumber" v-model="form.vatNumber" :label="t('companyProfile.labels.vatNumber')" :placeholder="t('companyProfile.placeholders.vatNumber')">
      <Icon name="receipt"/>
    </TextInputPrepend>
    <TextInputPrepend id="website" v-model="form.website" :label="t('companyProfile.labels.website')" :placeholder="t('companyProfile.placeholders.website')">
      <Icon name="globe"/>
    </TextInputPrepend>

    <ApolloMutation :mutation="updateMyCompanyMutation" :variables="getMutationVariables()" @done="afterUpdate">
      <template v-slot="{ mutate, loading, error }">
        <Button :disabled="loading" @click="mutate()">
          {{ t('companyProfile.labels.updateButton') }}
        </Button>
        <p v-if="error">{{ error.message }}</p>
      </template>
    </ApolloMutation>
  </div>
</template>