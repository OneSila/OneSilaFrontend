<script setup lang="ts">

import { Icon } from '../../atoms/icon';
import { Link } from "../../atoms/link";

interface TabItem {
  name: string;
  label: string;
  icon?: string;
  url: string;
}

const props = defineProps<{
  tabs: TabItem[];
  activeName: string;
}>();

const isActiveTab = (tab: TabItem) => tab.name === props.activeName;

</script>

<template>
  <div>
    <div class="hidden sm:block">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <Link
            v-for="tab in props.tabs"
            :key="tab.name"
            :path="{ name: tab.url }"
            class="group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium"
            :class="{
              'border-indigo-500 text-indigo-600': isActiveTab(tab),
              'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700': !isActiveTab(tab)
            }"
          >
            <Icon :name="tab.icon" v-if="tab.icon" class="mr-2 h-5 w-5"/>
            {{ tab.label }}
          </Link>
        </nav>
      </div>
    </div>
  </div>
</template>
