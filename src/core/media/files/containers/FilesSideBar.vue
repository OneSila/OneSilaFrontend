<script lang="ts" setup>

import { Card } from '../../../../shared/components/atoms/card';
import { Icon} from "../../../../shared/components/atoms/icon";
import {useI18n} from "vue-i18n";
import { isWiderThan, injectScreen } from "../../../../shared/modules/screen";
import CreateButton from "./CreateButton.vue";

const screen = injectScreen();
const props = defineProps<{ activeTab: string; }>();

const { t } = useI18n();

const links = [
    { name: 'home', icon: 'home', label: 'Home' },
    { name: 'images', icon: 'image', label: 'Images' },
    { name: 'videos', icon: 'video', label: 'Videos' },
    { name: 'documents', icon: 'file-text', label: 'Documents' },
];

const isActive = (name: string) => props.activeTab === name;

</script>

<template>
  <Card
    id="default-offcanvas"
    class="transform h-full p-2 me-6 card rounded-none lg:rounded-md transition-all"
    tabindex="-1"
  >
    <div class="py-5 lg:px-10 md:px-6 sm:px-2">
      <CreateButton :active-tab="activeTab" />

      <div class="space-y-2 mt-4">
        <template v-for="link in links" :key="link.name">
          <a
            href="javascript:void(0);"
            :class="[
              'flex items-center py-2 px-4 text-sm rounded text-gray-500 dark:text-gray-400',
              isActive(link.name) ? 'bg-slate-100 dark:bg-gray-700' : 'hover:bg-slate-100 dark:hover:bg-gray-700'
            ]">
            <Icon :name="link.icon" class="me-3.5 w-4 h-4" />
            <span v-if="isWiderThan(screen, 1024)">{{ link.label }}</span>
          </a>
        </template>
      </div>

<!--      <div v-if="isWiderThan(screen, 1024)" class="mt-6">-->
<!--        <h6 class="text-uppercase mt-3">Storage</h6>-->
<!--        <div class="flex w-full h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700 mt-4">-->
<!--          <div-->
<!--            class="flex flex-col justify-center overflow-hidden bg-primary"-->
<!--            role="progressbar"-->
<!--            :style="{width: storageCount + '%'}"-->
<!--            aria-valuenow="storageCount"-->
<!--            aria-valuemin="0"-->
<!--            aria-valuemax="100"-->
<!--          ></div>-->
<!--        </div>-->
<!--        <p class="text-gray-500 mt-4 text-xs">{{ storageCount }}% of 15 GB used</p>-->
<!--      </div>-->
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