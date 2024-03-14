<script setup lang="ts">

import { reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ApolloMutation, ApolloQuery } from '@vue/apollo-components';
import { setCompanyToUser, injectAuth, removeAuth } from '../../../../../shared/modules/auth';
import { Button } from "../../../../../shared/components/atoms/button";
import { Label } from "../../../../../shared/components/atoms/label";
import { Selector } from "../../../../../shared/components/atoms/selector";
import Icon from "../../../../../shared/components/atoms/icon/Icon.vue";
import TextInputPrepend from "../../../../../shared/components/atoms/text-input-prepend/TextInputPrepend.vue";
import { registerCompanyMutation } from '../../../../../shared/api/mutations/auth.js'
import { languagesQuery, countriesQuery } from "../../../../../shared/api/queries/languages";
import {PhoneNumberInput} from "../../../../../shared/components/atoms/phone-number-input";

const { t } = useI18n();
const router = useRouter();
const auth = injectAuth();

const form = reactive({
  name: '',
  country: '',
  language: '',
  phoneNumber: ''
});

const isFormValid = computed(() => {
  return form.name && form.country && form.phoneNumber;
});

const onCompanyRegistered = ({ data }) => {
  if (data && data.registerMyMultiTenantCompany) {
    setCompanyToUser(auth, {
      id: data.registerMyMultiTenantCompany.id,
      name: data.registerMyMultiTenantCompany.name
    });
    router.push({ name: 'dashboard' });
  }
};
</script>

<template>

    <div>
    <div class="mb-10">
      <h1 class="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">{{ t('auth.register.company.header') }}</h1>
      <p class="text-base font-bold leading-normal text-white-dark">{{ t('auth.register.company.description') }}</p>
      <p class="text-base font-bold leading-normal text-danger">{{ t('auth.register.company.languageDisclaimer') }}</p>
    </div>
      <TextInputPrepend id="companyName" v-model="form.name" :label="t('auth.register.company.labels.companyName')" :placeholder="t('auth.register.company.placeholders.companyName')" type="text" class="mb-2">
        <Icon name="building"/>
      </TextInputPrepend>
      <PhoneNumberInput class="mb-2" v-model:model-value="form.phoneNumber" :label="t('companyProfile.labels.phoneNumber')" />

    <div class="mb-2">
      <Label>{{ t('auth.register.company.placeholders.country') }}</Label>
      <ApolloQuery :query="countriesQuery">
        <template v-slot="{ result: { data } }">
            <Selector v-if="data" v-model="form.country" :options="data.countries" labelBy="name" valueBy="code" :placeholder="t('auth.register.company.placeholders.selector.country')" filterable />
        </template>
      </ApolloQuery>
    </div>

    <div>
      <Label>{{ t('auth.register.company.placeholders.language') }}</Label>
    <ApolloQuery :query="languagesQuery">
      <template v-slot="{ result: { data } }">
          <Selector v-if="data" v-model="form.language" :options="data.languages" labelBy="name" valueBy="code" :placeholder="t('auth.register.company.placeholders.selector.language')" filterable />
      </template>
    </ApolloQuery>
    </div>


    <div>

      <ApolloMutation
        :mutation="registerCompanyMutation"
        :variables="{
          country: form.country,
          name: form.name,
          language: form.language,
          phoneNumber: form.phoneNumber
        }"
        @done="onCompanyRegistered"
      >
        <template v-slot="{ loading, error, mutate }">
        <Button :customClass="'btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]'"
                :disabled="loading || !isFormValid"
                @click="mutate()"
        >
            {{ t('auth.register.company.button.createCompany')}}
          </Button>
          <p v-if="error">{{ error.message }}</p>
        </template>
      </ApolloMutation>


    </div>
  </div>
</template>