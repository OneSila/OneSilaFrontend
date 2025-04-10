<script lang="ts" setup>

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
      <!-- Full Address: combining address1, address2, city, country, postcode -->
      <li class="flex items-center gap-2">
        <Icon class="shrink-0" name="map-marker"/>
        <span>{{ props.companyData.fullAddress || '-' }}</span>
      </li>
      <!-- Other fields without labels -->
      <li class="flex items-center gap-2" v-if="props.companyData.email">
        <Icon class="shrink-0" name="envelope"/>
        <a :href="`mailto:${props.companyData.email}`">{{ props.companyData.email }}</a>
      </li>
      <li class="flex items-center gap-2" v-if="props.companyData.phoneNumber">
        <Icon class="shrink-0" name="phone"/>
        <a :href="`tel:${props.companyData.phoneNumber}`">{{ props.companyData.phoneNumber }}</a>
      </li>
      <li class="flex items-center gap-2" v-if="props.companyData.website">
        <Icon class="shrink-0" name="globe"/>
        <a :href="props.companyData.website" target="_blank">{{ props.companyData.website }}</a>
      </li>
      <!-- VAT Number with label; this will be the last item -->
      <li class="flex items-center gap-2">
        <Icon class="shrink-0" name="receipt"/>
        {{ t('companyProfile.labels.vatNumber') }}: {{ props.companyData.vatNumber || '-' }}
      </li>
      <li class="flex items-center gap-2" v-if="props.companyData.languageDetail">
        <Icon class="shrink-0" name="language" />
        {{ t('companyProfile.labels.defaultLanguage') }}: {{ props.companyData.languageDetail.name }}
      </li>

    </ul>
  </div>
</template>
