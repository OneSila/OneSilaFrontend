<script lang="ts" setup>
import { defineProps } from 'vue';
import { MeCompanyData } from '../../meCompanyData';
import { Icon } from "../../../../../shared/components/atoms/icon";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps<{ companyData: MeCompanyData }>();
</script>

<template>
  <div class="mb-5">
    <div class="flex flex-col justify-center items-center">
      <p class="font-semibold text-primary text-xl">{{ props.companyData.name }}</p>
    </div>
    <ul class="mt-5 flex flex-col max-w-[320px] m-auto space-y-4 font-semibold text-white-dark">
      <li class="flex items-center gap-2">
        <Icon class="shrink-0" name="envelope"/>
        {{ t('companyProfile.labels.email') }}: {{ props.companyData.email || '-' }}
      </li>
      <li class="flex items-center gap-2">
        <Icon class="shrink-0" name="phone"/>
        {{ t('companyProfile.labels.phoneNumber') }}: {{ props.companyData.phoneNumber || '-' }}
      </li>
      <li class="flex items-center gap-2">
        <Icon class="shrink-0" name="map-location"/>
        {{ t('companyProfile.labels.address1') }}: {{ props.companyData.address1 || '-' }}
      </li>
      <li class="flex items-center gap-2">
        <Icon class="shrink-0" name="map-marker"/>
        {{ t('companyProfile.labels.address2') }}: {{ props.companyData.address2 || '-' }}
      </li>
      <li class="flex items-center gap-2">
        <Icon class="shrink-0" name="city"/>
        {{ t('companyProfile.labels.city') }}: {{ props.companyData.city || '-' }}
      </li>
      <li class="flex items-center gap-2">
        <Icon class="shrink-0" name="signs-post"/>
        {{ t('companyProfile.labels.postcode') }}: {{ props.companyData.postcode || '-' }}
      </li>
      <li class="flex items-center gap-2">
        <Icon class="shrink-0" name="receipt"/>
        {{ t('companyProfile.labels.vatNumber') }}: {{ props.companyData.vatNumber || '-' }}
      </li>
      <li class="flex items-center gap-2">
        <Icon class="shrink-0" name="globe"/>
        {{ t('companyProfile.labels.website') }}: {{ props.companyData.website || '-' }}
      </li>
    </ul>
  </div>
</template>