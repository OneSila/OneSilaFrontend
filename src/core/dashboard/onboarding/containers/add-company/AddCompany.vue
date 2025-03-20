<script lang="ts" setup>
import { CompanyProfileEditForm } from "../../../../profile/company/containers/company-profile-edit-form";
import { meCompanySubscription } from "../../../../../shared/api/subscriptions/me.js";
import {ApolloSubscription} from "../../../../../shared/components/molecules/apollo-subscription";
import { MeCompanySubscriptionResult } from "../../../../profile/company/meCompanyData";
import {useI18n} from "vue-i18n";

const emit = defineEmits(['company-added']);
const { t } = useI18n();

const getCompany = (result) => {
  const r: MeCompanySubscriptionResult = result;
  return r.myMultiTenantCompany;
}

const handleUpdateComplete = () => {
  emit('company-added');
}

</script>

<template>
  <div class="pb-10">
    <h1 class="text-xl text-primary mb-4">{{ t('dashboard.onboarding.addCompany.subTitle') }}</h1>
    <hr>
    <h1 class="text-2xl my-4">{{ t('dashboard.onboarding.addCompany.content') }}</h1>
    <ApolloSubscription :subscription="meCompanySubscription" ref="apolloSubRef">
      <template v-slot:default="{ loading, error, result }">
        <template v-if="!loading && result">
          <CompanyProfileEditForm class="w-full" :mandatory="true" :company-data="getCompany(result)" :is-onboarding="true"  @update-complete="handleUpdateComplete"/>
        </template>
      </template>
    </ApolloSubscription>
  </div>
</template>