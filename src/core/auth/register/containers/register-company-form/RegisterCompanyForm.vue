<script setup>
import { reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ApolloMutation } from '@vue/apollo-components';
import { setCompanyToUser, injectAuth } from '../../../../../shared/modules/auth';
import { Button } from "../../../../../shared/components/atoms/button";
import Icon from "../../../../../shared/components/atoms/icon/Icon.vue";
import TextInputPrepend from "../../../../../shared/components/atoms/text-input-prepend/TextInputPrepend.vue";
import { registerCompanyMutation } from '../../../../../shared/api/mutations/auth.js'

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
      <h1 class="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">{{ t('auth.register.header') }}</h1>
      <p class="text-base font-bold leading-normal text-white-dark">{{ t('auth.register.description') }}</p>
    </div>
      <TextInputPrepend id="companyName" v-model="form.name" :label="t('auth.register.company.labels.companyName')" :placeholder="t('auth.register.company.placeholders.companyName')" type="text">
        <Icon name="building"/>
      </TextInputPrepend>
      <TextInputPrepend id="country" v-model="form.country" :label="t('auth.register.company.labels.country')" :placeholder="t('auth.register.company.placeholders.country')" type="text">
        <Icon name="globe"/>
      </TextInputPrepend>
      <TextInputPrepend id="phoneNumber" v-model="form.phoneNumber" :label="t('auth.register.company.labels.phoneNumber')" :placeholder="t('auth.register.company.placeholders.phoneNumber')" type="tel">
        <Icon name="phone"/>
      </TextInputPrepend>
      <TextInputPrepend id="language" v-model="form.language" :label="t('auth.register.company.labels.language')" :placeholder="t('auth.register.company.placeholders.language')" type="text">
        <Icon name="language"/>
      </TextInputPrepend>

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