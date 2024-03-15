<script lang="ts" setup>
import { ref, watch, computed, defineProps, defineEmits } from 'vue';
import { updateMyCompanyMutation } from "./../../../../../shared/api/mutations/me.js";
import { TextInputPrepend } from '../../../../../shared/components/atoms/input-text-prepend';
import { Icon } from "../../../../../shared/components/atoms/icon";
import { Button } from "../../../../../shared/components/atoms/button";
import { MeCompanyData } from '../../meCompanyData';
import { useI18n } from 'vue-i18n';
import {PhoneNumberInput} from "../../../../../shared/components/atoms/input-phone-number";
import {EmailInput} from "../../../../../shared/components/atoms/input-email";
import {WebsiteInput} from "../../../../../shared/components/atoms/input-website";

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
    <TextInputPrepend id="name" class="mb-2" v-model="form.name" :label="t('companyProfile.labels.companyName')" :placeholder="t('companyProfile.placeholders.companyName')">
      <Icon name="building"/>
    </TextInputPrepend>
    <EmailInput id="email" class="mb-2" icon="envelope" v-model:model-value="form.email" :label="t('companyProfile.labels.email')" :placeholder="t('companyProfile.placeholders.email')" />
    <PhoneNumberInput class="mb-2" v-model:model-value="form.phoneNumber" :label="t('companyProfile.labels.phoneNumber')" />
    <TextInputPrepend id="address1" class="mb-2" v-model="form.address1" :label="t('companyProfile.labels.address1')" :placeholder="t('companyProfile.placeholders.address1')">
      <Icon name="map-location"/>
    </TextInputPrepend>
    <TextInputPrepend id="address2" class="mb-2" v-model="form.address2" :label="t('companyProfile.labels.address2')" :placeholder="t('companyProfile.placeholders.address2')">
      <Icon name="map-marker"/>
    </TextInputPrepend>
    <TextInputPrepend id="city" class="mb-2" v-model="form.city" :label="t('companyProfile.labels.city')" :placeholder="t('companyProfile.placeholders.city')">
      <Icon name="city"/>
    </TextInputPrepend>
    <TextInputPrepend id="postcode" class="mb-2" v-model="form.postcode" :label="t('companyProfile.labels.postcode')" :placeholder="t('companyProfile.placeholders.postcode')">
      <Icon name="signs-post"/>
    </TextInputPrepend>
    <TextInputPrepend id="vatNumber" class="mb-2" v-model="form.vatNumber" :label="t('companyProfile.labels.vatNumber')" :placeholder="t('companyProfile.placeholders.vatNumber')">
      <Icon name="receipt"/>
    </TextInputPrepend>
    <WebsiteInput id="website" class="mb-4" icon="globe" v-model:model-value="form.website" :label="t('companyProfile.labels.website')" :placeholder="t('companyProfile.placeholders.website')" />

    <ApolloMutation :mutation="updateMyCompanyMutation" :variables="getMutationVariables()" @done="afterUpdate">
      <template v-slot="{ mutate, loading, error }">
        <Button class="btn btn-primary" :disabled="loading" @click="mutate()">
          {{ t('companyProfile.labels.updateButton') }}
        </Button>
        <p v-if="error">{{ error.message }}</p>
      </template>
    </ApolloMutation>
  </div>
</template>
