<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { settingsSection } from './navItems';
import SideItem from "./SideItem.vue";

const activeDropdown: any = ref('');
const { t } = useI18n();

const updateActiveDropdown = (newValue) => {
  activeDropdown.value = newValue;
};


</script>

<template>
  <Flex class="side-settings-items">
    <ul class="relative font-semibold space-y-0.5 p-4 py-0 w-full">
      <template v-for="item in settingsSection.items">
        <SideItem :item="item" :active-dropdown="activeDropdown" @update:activeDropdown="updateActiveDropdown" />
        </template>
    </ul>
  </Flex>
</template>
