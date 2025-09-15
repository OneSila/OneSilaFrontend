<script setup lang="ts">
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue';
import { Icon } from "../../atoms/icon";
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface TabItem {
  name: string;
  label: string;
  icon?: string;
  danger?: boolean;
  alwaysRender?: boolean;
}

const props = withDefaults(
  defineProps<{
    tabs: TabItem[];
    disabledTabs?: string[];
    transparent?: boolean;
    tabKey?: string;
    beforeChange?: (newTab: string, oldTab: string) => Promise<boolean> | boolean;
  }>(),
  {
    disabledTabs: () => ([] as string[]),
    tabKey: 'tab',
  }
);
const emit = defineEmits(['tab-changed']);

const selectedTab = ref(props.tabs[0]?.name);
const route = useRoute();
const router = useRouter();

watch(() => route.query[props.tabKey], (newTab) => {
  if (newTab && props.tabs.some(tab => tab.name === newTab)) {
    selectedTab.value = newTab.toString();
  }
});

onMounted(() => {
  const queryTab = route.query[props.tabKey];
  if (queryTab && props.tabs.some(tab => tab.name === queryTab)) {
    selectedTab.value = queryTab.toString();
  }
});
const isSelected = (tab) => tab === selectedTab.value;
const isDisabled = (tab) => props.disabledTabs.includes(tab);
const isHighlighted = (tab: TabItem) => !isSelected(tab.name) && tab.danger;

const changeTab = async (index) => {
  const newTab = props.tabs[index].name;
  const oldTab = selectedTab.value;
  if (props.beforeChange) {
    const proceed = await props.beforeChange(newTab, oldTab);
    if (!proceed) {
      selectedTab.value = oldTab;
      return;
    }
  }
  selectedTab.value = newTab;
  router.push({ query: { ...route.query, [props.tabKey]: newTab } });
  emit('tab-changed', newTab);
};

const defaultTabIndex = () => {
  return props.tabs.findIndex(tab => tab.name === selectedTab.value);
}

</script>

<template>
  <div>
    <!-- Always render and hide these slots -->
    <div class="hidden" v-for="tab in props.tabs" :key="tab.name">
      <slot v-if="tab.alwaysRender" :name="tab.name"></slot>
    </div>
  <TabGroup :selectedIndex="defaultTabIndex()" :defaultIndex="defaultTabIndex()" @change="changeTab">
    <TabList class="flex font-semibold border-b border-[#ebedf2] dark:border-[#191e3a] mb-5 whitespace-nowrap overflow-y-auto">
      <Tab v-for="tab in props.tabs" :key="tab.name" as="template" :disabled="isDisabled(tab.name)">
        <a
            href="javascript:;"
            class="flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary !outline-none"
            :class="{ '!border-primary text-primary': isSelected(tab.name) || isHighlighted(tab) }"
        >
          <Icon :name="tab.icon" v-if="tab.icon" />
          {{ tab.label }}
        </a>
      </Tab>
    </TabList>
    <slot name="banner"></slot>
    <TabPanels>
      <TabPanel v-for="tab in props.tabs" :key="tab.name">
        <slot :name="tab.name"></slot>
      </TabPanel>
    </TabPanels>
  </TabGroup>
  </div>
</template>
