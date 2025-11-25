<script lang="ts" setup>
import { onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

type FilterChip = {
  key: string;
  label: string;
  value: string;
  rawValue: string;
};

const props = defineProps<{
  chips: FilterChip[];
}>();

const emit = defineEmits<{
  (e: 'remove', key: string, rawValue?: string): void;
  (e: 'create'): void;
}>();

const { t } = useI18n();

const selectedChipId = ref<string | null>(null);
const hoveredChipId = ref<string | null>(null);
const showCreateCard = ref(false);
let hoverTimeout: ReturnType<typeof setTimeout> | null = null;
let hideTimeout: ReturnType<typeof setTimeout> | null = null;

const getChipId = (chip: FilterChip) => `${chip.key}-${chip.rawValue}`;

const handleChipClick = (chip: FilterChip) => {
  const id = getChipId(chip);
  if (selectedChipId.value === id) {
    selectedChipId.value = null;
    hoveredChipId.value = null;
    showCreateCard.value = false;
    return;
  }
  selectedChipId.value = id;
  hoveredChipId.value = id;
  showCreateCard.value = true;
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
};

const handleMouseEnter = (chip: FilterChip) => {
  const id = getChipId(chip);
  hoveredChipId.value = id;
  showCreateCard.value = false;
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }
  hoverTimeout = setTimeout(() => {
    if (hoveredChipId.value === id) {
      showCreateCard.value = true;
    }
  }, 400);
};

const handleMouseLeave = () => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }
  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }
  hideTimeout = setTimeout(() => {
    hoveredChipId.value = null;
    showCreateCard.value = false;
  }, 150);
};

const removeChip = (chip: FilterChip) => {
  emit('remove', chip.key, chip.rawValue);
};

const handleCreateDashboardCard = () => {
  emit('create');
};

const handleCreateButtonEnter = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
};

const handleCreateButtonLeave = () => {
  hideTimeout = setTimeout(() => {
    hoveredChipId.value = null;
    showCreateCard.value = false;
  }, 150);
};

onBeforeUnmount(() => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }
  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }
});
</script>

<template>
  <div class="flex flex-wrap gap-2 mb-4 p-4">
    <div
      v-for="chip in props.chips"
      :key="chip.key + chip.rawValue"
      class="flex items-center gap-2"
      @mouseenter="handleMouseEnter(chip)"
      @mouseleave="handleMouseLeave"
    >
      <div
        class="flex items-center rounded-full px-3 py-2 text-sm border transition-colors duration-150 cursor-pointer"
        :class="selectedChipId === getChipId(chip) ? 'bg-gray-200 border-gray-300' : 'bg-gray-100 border-transparent hover:bg-gray-200'"
        @click="handleChipClick(chip)"
      >
        <span class="truncate">{{ chip.label }}: {{ chip.value }}</span>
        <button
          type="button"
          class="ml-1 text-base leading-none focus:outline-none"
          @click.stop="removeChip(chip)"
        >
          ×
        </button>
      </div>
    </div>
    <div v-if="showCreateCard" class="flex items-center" @mouseenter="handleCreateButtonEnter" @mouseleave="handleCreateButtonLeave">
      <button
        type="button"
        class="flex items-center rounded-full px-3 py-2 text-sm bg-blue-600 text-white shadow-sm transition-opacity duration-150"
        @click="handleCreateDashboardCard"
      >
        {{ t('generalListing.actions.createDashboardCard') }}
      </button>
    </div>
  </div>
</template>
