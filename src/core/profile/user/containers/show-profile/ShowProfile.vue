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
    <div class="flex flex-col justify-center items-center">
      <Image v-if="meData.avatarResizedFullUrl != null" :src="meData.avatarResizedFullUrl" class="w-24 h-24 rounded-full object-cover mb-5"/>
      <Icon v-else class="shrink-0 mb-1" size="2xl" name="user"/>

      <p class="font-semibold text-primary text-xl">{{ meData.firstName }} {{ meData.lastName }}</p>
    </div>
    <ul class="mt-5 flex flex-col max-w-[320px] m-auto space-y-4 font-semibold text-white-dark">
      <li class="flex items-center gap-2">
        <Icon class="shrink-0" name="calendar"/>
        {{ t('profile.labels.joined') }}: {{ new Date(meData.dateJoined).toLocaleDateString() }}
      </li>
      <li class="flex items-center gap-2">
        <Icon class="shrink-0" name="phone"/>
        {{ t('profile.labels.phone') }}: {{ meData.mobileNumber || '-' }}
      </li>
      <li class="flex items-center gap-2">
        <IconWhatsApp/>
        {{ t('profile.labels.whatsApp') }}: {{ meData.whatsappNumber || '-' }}
      </li>
      <li class="flex items-center gap-2">
        <IconTelegram/>
        {{ t('profile.labels.telegram') }}: {{ meData.telegramNumber || '-' }}
      </li>
      <li class="flex items-center gap-2">
        <Icon class="shrink-0" name="map-pin"/>
        {{ t('profile.labels.timezone') }}: {{ meData.timezone || '-' }}
      </li>
    </ul>
  </div>
</template>