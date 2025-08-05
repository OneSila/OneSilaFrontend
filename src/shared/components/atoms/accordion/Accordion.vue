<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Icon } from "../../atoms/icon";

interface AccordionItem {
  name: string;
  label: string;
  icon?: string;
}

const props = defineProps<{
  items: AccordionItem[];
  defaultActive?: string | null;
}>();

const activeIndex = ref<number | null>(null);

onMounted(() => {
  if (props.defaultActive) {
    const idx = props.items.findIndex(i => i.name === props.defaultActive);
    if (idx !== -1) activeIndex.value = idx;
  }
});

watch(() => props.defaultActive, (val) => {
  if (val) {
    const idx = props.items.findIndex(i => i.name === val);
    if (idx !== -1) activeIndex.value = idx;
  }
});

const toggleAccordion = (index: number) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};

const isActive = (index: number) => activeIndex.value === index;

</script>

<template>
  <div id="accordion" data-accordion="collapse">
    <div v-for="(item, index) in props.items" :key="item.name">
      <div :id="'accordion-heading-' + index">
        <Flex class="cursor-pointer w-full p-5 font-medium text-gray-500 border border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                :aria-expanded="isActive(index)"
                :aria-controls="'accordion-body-' + index"
                @click="toggleAccordion(index)"
                between>
            <FlexCell center>
              <Icon class="mr-2" :name="item.icon" v-if="item.icon" />
            </FlexCell>
            <FlexCell center grow>
              <span>{{ item.label }}</span>
            </FlexCell>
            <FlexCell center @click.stop>
              <slot :name="item.name + '-actions'"></slot>
            </FlexCell>
            <FlexCell center>
              <svg
                v-if="isActive(index)"
                data-accordion-icon
                class="w-3 h-3 shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5 5 1 1 5"
                />
              </svg>
              <svg
                v-else
                data-accordion-icon
                class="w-3 h-3 shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 1 5 5 1 1"
                />
              </svg>
            </FlexCell>
          </Flex>
      </div>
      <div
        :id="'accordion-body-' + index"
        class="transition-[max-height] duration-300 ease-in-out overflow-hidden"
        :class="isActive(index) ? 'max-h-screen' : 'max-h-0'"
        aria-labelledby="'accordion-heading-' + index"
      >
        <div class="p-10 border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
          <slot :name="item.name"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
button[aria-expanded="true"] + div {
  display: block;
}
button[aria-expanded="false"] + div {
  display: none;
}
</style>
