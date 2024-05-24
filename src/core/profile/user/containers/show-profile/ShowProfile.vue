<script lang="ts" setup>

import { Icon } from "../../../../../shared/components/atoms/icon";
import { Image } from "../../../../../shared/components/atoms/image";
import { MeData } from '../../meData'
import IconWhatsApp from '../../../../../shared/components/atoms/icons/icon-whatsapp.vue';
import IconTelegram from '../../../../../shared/components/atoms/icons/icon-telegram.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
defineProps<{ meData: MeData }>();

</script>

<template>
  <div class="mb-5">
    <Flex vertical>
      <FlexCell>
        <p class="font-semibold text-primary text-xl">{{ meData.firstName }} {{ meData.lastName }}</p>
      </FlexCell>
      <FlexCell>
        <Image v-if="meData.avatarResizedFullUrl != null" :source="meData.avatarResizedFullUrl" class="w-24 h-24 rounded-full object-cover mb-5 mt-2"/>
      </FlexCell>
    </Flex>

    <ul class="mt-5 flex flex-col max-w-[320px] space-y-4 font-semibold text-white-dark">
      <li class="flex gap-2">
        <Icon class="shrink-0" name="calendar"/>
        {{ t('profile.labels.joined') }}: {{ new Date(meData.dateJoined).toLocaleDateString() }}
      </li>
    <li class="flex gap-2">
      <Icon class="shrink-0" name="phone"/>
      {{ t('profile.labels.phone') }}:
      <a v-if="meData.mobileNumber" :href="`tel:${meData.mobileNumber}`">{{ meData.mobileNumber }}</a>
      <span v-else>-</span>
    </li>
      <li class="flex gap-2">
        <IconWhatsApp/>
        {{ t('profile.labels.whatsApp') }}:
        <a v-if="meData.whatsappNumber" :href="`https://wa.me/${meData.whatsappNumber.replace('+', '')}`">{{ meData.whatsappNumber }}</a>
        <span v-else>-</span>
      </li>
      <li class="flex gap-2">
        <IconTelegram/>
        {{ t('profile.labels.telegram') }}:
        <span>{{ meData.telegramNumber || '-' }}</span>
      </li>
      <li class="flex gap-2">
        <Icon class="shrink-0" name="map-pin"/>
        {{ t('profile.labels.timezone') }}: {{ meData.timezone || '-' }}
      </li>
    </ul>
  </div>
</template>