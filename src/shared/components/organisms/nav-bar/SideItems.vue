<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { navSections } from './navItems';
import SideItem from "./SideItem.vue";

const activeDropdown: any = ref('');
const { t } = useI18n();

const updateActiveDropdown = (newValue) => {
  activeDropdown.value = newValue;
};

</script>

<template>
  <Flex class="side-items">
    <ul class="relative font-semibold space-y-0.5 p-4 py-0">
      <template v-for="section in navSections">
         <h2 v-if="section.title" class="py-3 px-7 flex items-center uppercase font-extrabold bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] -mx-4 mb-1">
            <span>{{ t(section.title) }}</span>
         </h2>
        <template v-for="item in section.items">
          <SideItem :item="item" :active-dropdown="activeDropdown" @update:activeDropdown="updateActiveDropdown" />
        </template>
      </template>
    </ul>
  </Flex>
</template>
