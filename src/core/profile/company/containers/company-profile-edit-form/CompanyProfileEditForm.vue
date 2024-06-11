<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { updateMyCompanyMutation } from "./../../../../../shared/api/mutations/me.js";
import { TextInputPrepend } from '../../../../../shared/components/atoms/input-text-prepend';
import { Icon } from "../../../../../shared/components/atoms/icon";
import { Button } from "../../../../../shared/components/atoms/button";
import { MeCompanyData } from '../../meCompanyData';
import { useI18n } from 'vue-i18n';
import {PhoneNumberInput} from "../../../../../shared/components/atoms/input-phone-number";
import {EmailInput} from "../../../../../shared/components/atoms/input-email";
import {WebsiteInput} from "../../../../../shared/components/atoms/input-website";
import {Toast} from "../../../../../shared/modules/toast";
import {processGraphQLErrors} from "../../../../../shared/utils";
import {countriesQuery} from "../../../../../shared/api/queries/languages.js";
import {Selector} from "../../../../../shared/components/atoms/selector";
import {Label} from "../../../../../shared/components/atoms/label";

const { t } = useI18n();
const props = defineProps<{ companyData: MeCompanyData, mandatory?: boolean }>();

const emit = defineEmits(['updateComplete', 'unsavedChanges']);

const form = ref({ ...props.companyData });

const getMutationVariables = () => {
  return {
    name: form.value.name,
    address1: form.value.address1,
    address2: form.value.address2,
    postcode: form.value.postcode,
    city: form.value.city,
    country: form.value.country,
    email: form.value.email,
    phoneNumber: form.value.phoneNumber,
    vatNumber: form.value.vatNumber,
    website: form.value.website
  };
};

const afterUpdate = () => {
  Toast.success(t('companyProfile.messages.changesMade'));
  emit('updateComplete');
};

const isDisabled = () => {
  if (!props.mandatory) {
    return false;
  }

  const requiredFields = ['name', 'address1', 'city', 'email', 'phoneNumber', 'postcode', 'country'];

  for (const field of requiredFields) {
    if (!form.value[field]) {
      return true;
    }
  }

  return false;
};

const hasUnsavedChanges = computed(() => {
  return JSON.stringify(props.companyData) !== JSON.stringify(form.value);
});

watch(hasUnsavedChanges, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    emit('unsavedChanges', newVal);
  }
});

const onError = (error) => {
  const validationErrors = processGraphQLErrors(error, t);
  for (const key in validationErrors) {
    if (validationErrors.hasOwnProperty(key)) {
      Toast.error(validationErrors[key]);
    }
}};

</script>

<template>
  <div>
    <TextInputPrepend id="name" class="mb-2" v-model="form.name" :mandatory="mandatory" :label="t('companyProfile.labels.companyName')" :placeholder="t('companyProfile.placeholders.companyName')">
      <Icon name="building"/>
    </TextInputPrepend>
    <TextInputPrepend id="address1" class="mb-2" v-model="form.address1" :mandatory="mandatory" :label="t('companyProfile.labels.address1')" :placeholder="t('companyProfile.placeholders.address1')">
      <Icon name="map-location"/>
    </TextInputPrepend>
    <TextInputPrepend id="address2" class="mb-2" v-model="form.address2"  :label="t('companyProfile.labels.address2')" :placeholder="t('companyProfile.placeholders.address2')">
      <Icon name="map-marker"/>
    </TextInputPrepend>
    <TextInputPrepend id="city" class="mb-2" v-model="form.city" :mandatory="mandatory" :label="t('companyProfile.labels.city')" :placeholder="t('companyProfile.placeholders.city')">
      <Icon name="city"/>
    </TextInputPrepend>
    <div class="mb-2">
      <Label class="font-semibold text-md">{{ t('auth.register.company.placeholders.country') }}<span v-if="mandatory">*</span></Label>
      <ApolloQuery :query="countriesQuery">
        <template v-slot="{ result: { data } }">
            <Selector class="mt-2" v-if="data" v-model="form.country" :options="data.countries" labelBy="name" valueBy="code" :placeholder="t('auth.register.company.placeholders.selector.country')" filterable />
        </template>
      </ApolloQuery>
    </div>
    <TextInputPrepend id="postcode" class="mb-2" v-model="form.postcode" :mandatory="mandatory" :label="t('companyProfile.labels.postcode')" :placeholder="t('companyProfile.placeholders.postcode')">
      <Icon name="signs-post"/>
    </TextInputPrepend>
    <EmailInput id="email" class="mb-2" icon="envelope" v-model:model-value="form.email" :mandatory="mandatory" :label="t('companyProfile.labels.email')" :placeholder="t('companyProfile.placeholders.email')" />
    <PhoneNumberInput class="mb-2" v-model:model-value="form.phoneNumber" :mandatory="mandatory" :label="t('companyProfile.labels.phoneNumber')" />
    <TextInputPrepend id="vatNumber" class="mb-2" v-model="form.vatNumber" :label="t('companyProfile.labels.vatNumber')" :placeholder="t('companyProfile.placeholders.vatNumber')">
      <Icon name="receipt"/>
    </TextInputPrepend>
    <WebsiteInput id="website" class="mb-4" icon="globe" v-model:model-value="form.website" :label="t('companyProfile.labels.website')" :placeholder="t('companyProfile.placeholders.website')" />

    <ApolloMutation :mutation="updateMyCompanyMutation" :variables="getMutationVariables()" @done="afterUpdate" @error="onError">
      <template v-slot="{ mutate, loading, error }">
        <Button class="btn btn-primary" :disabled="loading || isDisabled()" @click="mutate()">
          {{ t('companyProfile.labels.updateButton') }}
        </Button>
      </template>
    </ApolloMutation>
  </div>
</template>
