<script lang="ts" setup>

import { Card } from '../../../../shared/components/atoms/card';
import { Icon} from "../../../../shared/components/atoms/icon";
import {useI18n} from "vue-i18n";
import { isWiderThan, injectScreen } from "../../../../shared/modules/screen";
import CreateButton from "./CreateButton.vue";
import { TYPE_DOCUMENT, TYPE_IMAGE, TYPE_VIDEO } from "../media";

const screen = injectScreen();
const props = defineProps<{ activeTab: string; }>();

const { t } = useI18n();

const links = [
    { name: 'home', icon: 'home', label: t('shared.labels.home'), url: { name: 'media.files' } },
    { name: TYPE_IMAGE, icon: 'image', label: t('media.images.title'), url: { name: 'media.images.list' } },
    { name: TYPE_VIDEO, icon: 'video', label: t('media.videos.title'), url: { name: 'media.videos.list' } },
    { name: TYPE_DOCUMENT, icon: 'file-text', label: t('media.documents.title'), url: { name: 'media.documents.list' } },
];

const isActive = (name: string) => props.activeTab === name;
const emit = defineEmits(['trigger-refetch']);

</script>

<template>
  <Card
    id="default-offcanvas"
    class="transform h-full p-2 me-6 card rounded-none lg:rounded-md transition-all"
    tabindex="-1"
  >
    <div class="py-5 lg:px-6 md:px-4 sm:px-2">
      <CreateButton :active-tab="activeTab" @trigger-refetch="emit('trigger-refetch')" />

      <div class="space-y-2 mt-4">
        <template v-for="link in links" :key="link.name">
           <router-link
            :to="link.url"
            :class="[
              'flex items-center py-2 px-4 text-sm rounded text-gray-500 dark:text-gray-400',
              isActive(link.name) ? 'bg-slate-100 dark:bg-gray-700' : 'hover:bg-slate-100 dark:hover:bg-gray-700'
            ]">
            <Icon :name="link.icon" class="me-3.5 w-4 h-4" />
            <span v-if="isWiderThan(screen, 1024)">{{ link.label }}</span>
          </router-link>
        </template>
      </div>
    </div>
  </Card>
</template>

<style>
@media (max-width: 768px) {
  .hide-on-small {
    display: none;
  }
}
</style>