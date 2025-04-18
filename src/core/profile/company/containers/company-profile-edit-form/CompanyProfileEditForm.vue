<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue';
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
import {countriesQuery, languagesQuery} from "../../../../../shared/api/queries/languages.js";
import {Selector} from "../../../../../shared/components/atoms/selector";
import {Label} from "../../../../../shared/components/atoms/label";
import {injectAuth} from "../../../../../shared/modules/auth";
import apolloClient from "../../../../../../apollo-client";

const { t } = useI18n();
const props = defineProps<{ companyData: MeCompanyData, mandatory?: boolean, isOnboarding?: boolean }>();
const auth = injectAuth();
const user = ref(auth.user)

const emit = defineEmits(['updateComplete', 'unsavedChanges']);

const form = ref({ ...props.companyData });
const languages = ref<{ code: string; name: string }[]>([]);
const defaultLanguageCode = computed(() => props.companyData.language);

if (!form.value.email) {
  form.value.email = user.value.username
}

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
    website: form.value.website,
    languages: form.value.languages
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

  let requiredFields = ['name', 'address1', 'city', 'email', 'phoneNumber', 'postcode', 'country'];

  if (props.isOnboarding) {
    requiredFields = ['name', 'email', 'phoneNumber', 'country'];
  }

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

onMounted(async () => {
  const { data } = await apolloClient.query({ query: languagesQuery });

  if (data?.languages) {
    languages.value = data.languages
  }
});

</script>

<template>
  <div class="space-y-12">
    <!-- Company Profile Section -->
    <div class="border-b border-gray-900/10 pb-20">
      <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <!-- Company Name -->
        <div class="sm:col-span-6">
          <TextInputPrepend
            id="name"
            v-model="form.name"
            :mandatory="mandatory"
            :label="t('companyProfile.labels.companyName')"
            :placeholder="t('companyProfile.placeholders.companyName')"
            class="mb-2"
          >
            <Icon name="building" />
          </TextInputPrepend>
        </div>
        <!-- Address 1 -->
        <div v-if="!isOnboarding" class="sm:col-span-3">
          <TextInputPrepend
            id="address1"
            v-model="form.address1"
            :mandatory="mandatory"
            :label="t('companyProfile.labels.address1')"
            :placeholder="t('companyProfile.placeholders.address1')"
            class="mb-2"
          >
            <Icon name="map-location" />
          </TextInputPrepend>
        </div>
        <!-- Address 2 -->
        <div v-if="!isOnboarding" class="sm:col-span-3">
          <TextInputPrepend
            id="address2"
            v-model="form.address2"
            :label="t('companyProfile.labels.address2')"
            :placeholder="t('companyProfile.placeholders.address2')"
            class="mb-2"
          >
            <Icon name="map-marker" />
          </TextInputPrepend>
        </div>
        <!-- City -->
        <div v-if="!isOnboarding" class="sm:col-span-3">
          <TextInputPrepend
            id="city"
            v-model="form.city"
            :mandatory="mandatory"
            :label="t('companyProfile.labels.city')"
            :placeholder="t('companyProfile.placeholders.city')"
            class="mb-2"
          >
            <Icon name="city" />
          </TextInputPrepend>
        </div>

        <div v-if="!isOnboarding" class="sm:col-span-3">
          <TextInputPrepend
            id="postcode"
            v-model="form.postcode"
            :mandatory="mandatory"
            :label="t('companyProfile.labels.postcode')"
            :placeholder="t('companyProfile.placeholders.postcode')"
            class="mb-2"
          >
            <Icon name="signs-post" />
          </TextInputPrepend>
        </div>

        <!-- Country Selector -->
        <div class="sm:col-span-6">
          <Label class="font-semibold text-md">
            {{ t('auth.register.company.placeholders.country') }}
            <span v-if="mandatory">*</span>
          </Label>
          <ApolloQuery :query="countriesQuery">
            <template v-slot="{ result: { data } }">
              <Selector
                class="mt-2"
                v-if="data"
                v-model="form.country"
                :options="data.countries"
                labelBy="name"
                valueBy="code"
                :placeholder="t('auth.register.company.placeholders.selector.country')"
                filterable
              />
            </template>
          </ApolloQuery>
        </div>
        <!-- Postcode -->
        <!-- Email -->
        <div class="sm:col-span-3">
          <EmailInput
            id="email"
            icon="envelope"
            v-model:model-value="form.email"
            :mandatory="mandatory"
            :label="t('companyProfile.labels.email')"
            :placeholder="t('companyProfile.placeholders.email')"
            class="mb-2"
          />
        </div>
        <!-- Phone Number -->
        <div class="sm:col-span-3">
          <PhoneNumberInput
            v-model:model-value="form.phoneNumber"
            :mandatory="mandatory"
            :label="t('companyProfile.labels.phoneNumber')"
            class="mb-2"
          />
        </div>
        <!-- VAT Number -->
        <div v-if="!isOnboarding" class="sm:col-span-3">
          <TextInputPrepend
            id="vatNumber"
            v-model="form.vatNumber"
            :label="t('companyProfile.labels.vatNumber')"
            :placeholder="t('companyProfile.placeholders.vatNumber')"
            class="mb-2"
          >
            <Icon name="receipt" />
          </TextInputPrepend>
        </div>
        <!-- Website -->
        <div class="sm:col-span-3">
          <WebsiteInput
            id="website"
            icon="globe"
            v-model:model-value="form.website"
            :label="t('companyProfile.labels.website')"
            :placeholder="t('companyProfile.placeholders.website')"
            class="mb-4"
          />
        </div>

        <!-- Language Selector -->
        <div class="sm:col-span-3">
          <Label class="font-semibold text-md">
            {{ t('companyProfile.labels.companyLanguages') }}
          </Label>
          <Selector
            class="mt-2"
            v-model="form.languages"
            :options="languages"
            labelBy="name"
            valueBy="code"
            :multiple="true"
            :placeholder="t('companyProfile.placeholders.companyLanguages')"
            filterable
          />
          <div v-if="isOnboarding" class="mt-1 text-sm leading-6 text-gray-400">
            <p>*{{ t('auth.register.company.helpText.languages') }}</p>
          </div>
        </div>

      </div>
    </div>


    <!-- Submit Button, Right-Aligned -->
    <div class="flex items-center justify-end">
      <ApolloMutation
        :mutation="updateMyCompanyMutation"
        :variables="getMutationVariables()"
        @done="afterUpdate"
        @error="onError"
      >
        <template v-slot="{ mutate, loading }">
          <Button
            class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            :disabled="loading || isDisabled()"
            @click="mutate()"
          >
            {{ isOnboarding ? t('shared.button.next') : t('shared.button.save') }}
          </Button>
        </template>
      </ApolloMutation>
    </div>
  </div>
</template>
