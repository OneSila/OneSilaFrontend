<script setup lang="ts">
import VueSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import { createPopper, Placement } from '@popperjs/core';
import { computed, nextTick, onBeforeUnmount, onMounted, Ref, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from "../icon";

const props = withDefaults(
  defineProps<{
    options: any[];
    modelValue?: any;
    labelBy?: string;
    valueBy?: string;
    placeholder?: string;
    dropdownPosition?: string;
    boolean?: boolean;
    mandatory?: boolean;
    multiple?: boolean;
    filterable?: boolean;
    removable?: boolean;
    limit?: number;
    controlMinWidth?: number;
    dropdownMinWidth?: number;
    dropdownMaxWidth?: number;
    isLoading?: boolean;
    isLoadingMore?: boolean;
    hasMoreOptions?: boolean;
    showAddEntry?: boolean;
    reverse?: boolean;
  }>(),
  { dropdownPosition: 'top', options: [] as any, removable: true, showAddEntry: false },
);

const emit = defineEmits<{
  (e: 'add-clicked'): void;
  (e: 'selected', event): void;
  (e: 'deselected', event): void;
  (e: 'searched', search, loading): void;
  (e: 'load-more'): void;
  (e: 'update:modelValue', event): void;
  (e: 'label-selected', payload: { id: any; label: string }): void;
}>();

const { t } = useI18n();

const selectorRef: Ref<any> = ref(null);
const loadMoreTriggerRef: Ref<HTMLElement | null> = ref(null);
const dropdownOptions: Ref<any[]> = ref(props.options);
const cachedOptions: Ref<any[]> = ref([]);
const DEFAULT_DROPDOWN_VIEWPORT_GUTTER = 16;
let loadMoreObserver: IntersectionObserver | null = null;
let pendingScrollRestore: { scrollTop: number } | null = null;

const baseOptions = computed(() => {
  if (props.options.length) {
    return props.options;
  }

  if (props.isLoading && cachedOptions.value.length) {
    return cachedOptions.value;
  }

  return props.options;
});

watchEffect(() => {
  if (props.options.length) {
    cachedOptions.value = [...props.options];
  }
});

const sanitizeSearchTerm = (term: string | undefined): string => {
  if (!term) {
    return '';
  }

  return term
    .replace(/["']/g, '')
    .toLocaleLowerCase()
    .trim();
};

const filterBy = (_option: any, label: any, search: string | undefined) => {
  if (props.isLoading) {
    return true;
  }

  if (typeof label === 'number') {
    label = label.toString();
  }

  const normalizedLabel = (label ?? '').toString().toLocaleLowerCase();
  const normalizedSearch = sanitizeSearchTerm(search);

  if (!normalizedSearch) {
    return true;
  }

  return normalizedLabel.includes(normalizedSearch);
};

const isOptionSelectable = () => !props.isLoading;

const dropdownShouldOpen = ({ noDrop, open }) => {
  return !noDrop && open;
};

const canLoadMore = computed(() => {
  return Boolean(props.hasMoreOptions && !props.isLoading && !props.isLoadingMore);
});

const selectorStyle = computed(() => {
  if (!props.controlMinWidth) {
    return undefined;
  }

  return {
    minWidth: `${props.controlMinWidth}px`,
  };
});

const getDropdownMenu = (): HTMLElement | null => {
  return selectorRef.value?.$refs?.dropdownMenu ?? null;
};

const captureDropdownScroll = () => {
  const menu = getDropdownMenu();

  if (!menu) {
    return;
  }

  pendingScrollRestore = {
    scrollTop: menu.scrollTop,
  };
};

const restoreDropdownScroll = () => {
  if (!pendingScrollRestore) {
    return;
  }

  const snapshot = pendingScrollRestore;
  pendingScrollRestore = null;

  nextTick(() => {
    const menu = getDropdownMenu();

    if (!menu) {
      return;
    }

    menu.scrollTop = snapshot.scrollTop;
  });
};

const loadMoreOptions = () => {
  if (!canLoadMore.value) {
    return;
  }

  captureDropdownScroll();
  emit('load-more');
};

const observeLoadMoreTrigger = (element: HTMLElement | null) => {
  loadMoreObserver?.disconnect();
  loadMoreObserver = null;

  if (!element) {
    return;
  }

  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMoreOptions();
      }
    },
    { rootMargin: '120px 0px' }
  );

  loadMoreObserver.observe(element);
};

watch(loadMoreTriggerRef, (element) => {
  observeLoadMoreTrigger(element);
});

watch(canLoadMore, () => {
  nextTick(() => {
    observeLoadMoreTrigger(loadMoreTriggerRef.value);
  });
});

watch(
  () => props.options.length,
  () => {
    restoreDropdownScroll();
  }
);

watch(
  () => props.isLoadingMore,
  (isLoadingMore, wasLoadingMore) => {
    if (wasLoadingMore && !isLoadingMore) {
      restoreDropdownScroll();
    }
  }
);

onMounted(() => {
  observeLoadMoreTrigger(loadMoreTriggerRef.value);
});

onBeforeUnmount(() => {
  loadMoreObserver?.disconnect();
});

const calculatePosition = (dropdownList, component, { width }) => {
  dropdownList.classList.add('selector-dropdown');

  const inputWidth = Number.parseFloat(width) || 0;
  const viewportWidth = typeof window !== 'undefined'
    ? window.innerWidth - DEFAULT_DROPDOWN_VIEWPORT_GUTTER
    : inputWidth;
  const minWidth = props.dropdownMinWidth ?? inputWidth;
  const maxWidth = props.dropdownMaxWidth ?? Math.max(minWidth, inputWidth);
  const targetWidth = Math.min(
    Math.max(inputWidth, minWidth),
    maxWidth,
    Math.max(inputWidth, viewportWidth)
  );

  dropdownList.style.width = `${targetWidth}px`;
  dropdownList.style.minWidth = width;
  dropdownList.style.maxWidth = `calc(100vw - ${DEFAULT_DROPDOWN_VIEWPORT_GUTTER}px)`;

  const popper = createPopper(component.$refs.toggle, dropdownList, {
    placement: props.dropdownPosition as Placement,
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, -1],
        },
      },
      {
        name: 'toggleClass',
        enabled: true,
        phase: 'write',
        fn({ state }) {
          component.$el.classList.toggle('drop-up', state.placement === 'top');
        },
      },
    ],
  });

  return () => popper.destroy();
};

watchEffect(() => {
  dropdownOptions.value = [...baseOptions.value];

  if (props.showAddEntry && props.valueBy && props.labelBy) {
    const valueBy = props.valueBy;
    const labelBy = props.labelBy;

    const alreadyExists = dropdownOptions.value.some(
      (opt) => opt?.[valueBy] === 'add-entry'
    );

    if (!alreadyExists) {
      dropdownOptions.value.unshift({
        [valueBy]: 'add-entry',
        [labelBy]: t('shared.components.molecules.selector.addEntry'),
      });
    }
  }
});



watchEffect(() => {
  if (props.boolean) {
    if (props.reverse) {
      dropdownOptions.value = [
        { id: false, name: t('shared.labels.yes') },
        { id: true, name: t('shared.labels.no') },
      ];
    } else {
      dropdownOptions.value = [
        { id: true, name: t('shared.labels.yes') },
        { id: false, name: t('shared.labels.no')},
      ];
    }

    if (!props.mandatory) {
      dropdownOptions.value.unshift({ id: 'all', name: 'All' });
    } else {
      dropdownOptions.value
    }
  } else if (selectorRef.value && !selectorRef.value.search && props.limit) {
    const options = baseOptions.value;
    const selectedOptions = options.filter((option) => {
      const optionValue = props.valueBy ? option[props.valueBy] : option;

      return Array.isArray(props.modelValue)
        ? props.modelValue.includes(optionValue)
        : optionValue === props.modelValue;
    });

    const limitedOptions = options.slice(0, props.limit);

    const missingSelectedOptions = selectedOptions.filter((selectedOption) => {
      const selectedOptionValue = props.valueBy
        ? selectedOption[props.valueBy]
        : selectedOption;

      return !limitedOptions.find((limitedOption) => {
        const limitedOptionValue = props.valueBy
          ? limitedOption[props.valueBy]
          : limitedOption;

        return limitedOptionValue === selectedOptionValue;
      });
    });

    dropdownOptions.value = options
      .slice(0, props.limit)
      .concat(missingSelectedOptions);
  } else {
    dropdownOptions.value = baseOptions.value;
  }
});

const onModelValueUpdated = (value) => {

    if (props.multiple && Array.isArray(value)) {
      if (value.includes('add-entry')) {
        emit('add-clicked');

        // Remove 'add-entry' from the array before emitting the update
        const filtered = value.filter(v => v !== 'add-entry');
        emit('update:modelValue', filtered);
        return;
      }
  }

   if (value === 'add-entry') {
    emit('add-clicked');
    return;
  }



  if (value === null || value === undefined) {
    emit('deselected', value);
  }

  emit('update:modelValue', value);

  const emitLabel = (v) => {
    const label = getLabel(v);
    if (label !== null) {
      emit('label-selected', { id: v, label });
    }
  };

  if (Array.isArray(value)) {
    value.forEach(emitLabel);
  } else {
    emitLabel(value);
  }
};

const handleKeydown = (event) => {
  event.stopPropagation();
};


const getLabel = (option: any): string | null => {
  if ((option === null || option === undefined) && !props.boolean) return null;

  if (props.valueBy && typeof option !== 'object') {
    const match = dropdownOptions.value.find(opt => {
      const optValue = opt[props.valueBy!];
      return optValue === option || JSON.stringify(optValue) === JSON.stringify(option);
    });

    if (match && props.labelBy) {
      return match[props.labelBy] ?? null;
    }

    return null;
  }

  if (
    typeof option === 'object' &&
    props.labelBy &&
    option.hasOwnProperty(props.labelBy)
  ) {
    const value = option[props.labelBy];
    if (typeof value === 'string' && value.startsWith('UHJv')) {
      return null;
    }
    return value;
  }

  if (!props.valueBy && typeof option === 'string') {
    return option;
  }

  return null;
};

const MAX_SELECTED_LABEL_LENGTH = 86;

const truncateLabel = (label: string | null | undefined, max = MAX_SELECTED_LABEL_LENGTH) => {
  if (!label) return '';
  if (label.length <= max) return label;
  const trimmed = label.slice(0, Math.max(0, max - 3));
  return `${trimmed}...`;
};

const getTruncatedLabel = (option: any) => {
  const label = getLabel(option);
  return label ? truncateLabel(label) : null;
};


</script>

<template>
  <VueSelect
    ref="selectorRef"
    class="selector w-full md:min-w-38 text-sm bg-white"
    :style="selectorStyle"
    @keydown.enter="handleKeydown"
    :placeholder="placeholder || t('shared.components.molecules.selector.defaultPlaceholder')"
    :model-value="modelValue"
    :options="dropdownOptions"
    :label="labelBy"
    :reduce="(item) => (valueBy ? item[valueBy] : item)"
    :calculate-position="calculatePosition"
    :multiple="multiple"
    :filterable="filterable"
    :filter-by="filterBy"
    :selectable="isOptionSelectable"
    :clearable="removable"
    :loading="isLoading"
    :autoscroll="false"
    :dropdown-should-open="dropdownShouldOpen"
    close-on-select
    append-to-body
    searchable
    @update:model-value="(event) => onModelValueUpdated(event)"
    @search="(search, loading) => emit('searched', search, loading)"
    @option:selecting="(event) => emit('selected', event)"
    @option:deselected="(event) => emit('deselected', event)"
  >

    <template #list-header>
      <li v-if="isLoading" class="selector__loading-row">
        <Icon name="spinner" class="animate-spin selector__loading-icon" />
        <span>{{ t('shared.labels.loading') }}</span>
      </li>
    </template>

    <template #list-footer>
      <li
        v-if="(!isLoading && hasMoreOptions) || isLoadingMore"
        ref="loadMoreTriggerRef"
        class="selector__load-more-row"
      >
        <Icon name="spinner" class="animate-spin selector__loading-icon" />
        <span>{{ t('shared.labels.loading') }}</span>
      </li>
    </template>

<!-- Pills for multiple -->
<template v-if="multiple" #selected-option-container="{ option, deselect, disabled }">
  <span
    class="inline-flex min-w-0 max-w-full items-center rounded-full bg-gray-100 text-sm text-gray-800 px-3 py-1 mr-1 mb-1 border border-gray-400 transition-colors duration-200 hover:bg-gray-200 cursor-pointer"
  >
    <span v-if="getLabel(option) != null" :title="getLabel(option) || undefined">
      <span class="selector__selected-label">{{ getTruncatedLabel(option) }}</span>
    </span>
    <span v-else class="text-gray-400 italic flex items-center gap-1">
      <Icon name="spinner" class="animate-spin" />
      {{ t('shared.labels.loading') }}
    </span>

    <button
      type="button"
      @mousedown.prevent.stop="deselect(option)"
      class="ml-2 text-gray-500 hover:text-red-500 transition-colors duration-200"
      :disabled="disabled"
    >
      <Icon name="circle-xmark" size="sm" />
    </button>
  </span>
</template>

  <!-- Show loading for single when value is still an ID -->
  <template v-else-if="modelValue !== null && modelValue !== undefined && getLabel(modelValue) === null" #selected-option>
    <span class="text-gray-400 italic flex items-center gap-1">
      <Icon name="spinner" class="animate-spin" />
      {{ t('shared.labels.loading') }}
    </span>
  </template>
  <template v-else #selected-option>
    <span v-if="getLabel(modelValue) != null" :title="getLabel(modelValue) || undefined">
      <span class="selector__selected-label">{{ getTruncatedLabel(modelValue) }}</span>
    </span>
  </template>



    <template #no-options>
      <div v-if="isLoading" class="selector__loading-empty">
        <Icon name="spinner" class="animate-spin selector__loading-icon" />
        <span>{{ t('shared.labels.loading') }}</span>
      </div>
      <div v-else class="w-full px-2 text-left text-opacity-50">
        <em>{{ t('shared.components.molecules.selector.typeToSearch') }}.</em>
      </div>
    </template>

  </VueSelect>
</template>

<style>
.selector .vs__search::placeholder {
  color: #9ca3af;
}

.selector .vs__dropdown-toggle {
  min-height: 40px;
  padding: 4px 2px;
  border-color: #d1d5db;
  border-radius: 6px;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.selector:focus-within .vs__dropdown-toggle,
.selector.vs--open .vs__dropdown-toggle {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
}

.selector-dropdown.vs__dropdown-menu {
  max-width: none;
  overflow-x: hidden;
  border-color: #d1d5db;
  border-radius: 6px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.16);
}

.selector__loading-row,
.selector__loading-empty,
.selector__load-more-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 8px 12px;
  color: #1d4ed8;
  background: #eff6ff;
  border-bottom: 1px solid #bfdbfe;
  font-weight: 500;
  overflow: hidden;
}

.selector__loading-empty {
  border-bottom: 0;
}

.selector__loading-row::after,
.selector__loading-empty::after,
.selector__load-more-row::after {
  content: '';
  position: absolute;
  left: -35%;
  bottom: 0;
  width: 35%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #2563eb, transparent);
  animation: selector-loading-sweep 1.15s ease-in-out infinite;
}

.selector__load-more-row {
  justify-content: center;
  border-top: 1px solid #bfdbfe;
  border-bottom: 0;
}

.selector__loading-icon {
  flex-shrink: 0;
}

@keyframes selector-loading-sweep {
  from {
    left: -35%;
  }

  to {
    left: 100%;
  }
}

.selector-dropdown .vs__dropdown-option {
  min-height: 34px;
  padding: 8px 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: normal;
}

.selector-dropdown .vs__dropdown-option--highlight {
  white-space: nowrap;
  word-break: normal;
}

.selector-dropdown .vs__dropdown-option--disabled {
  cursor: wait;
  color: #6b7280;
  background-color: #f9fafb;
  opacity: 0.68;
}

.selector .vs__selected-options {
  align-items: center;
  min-width: 0;
}

.vs--multiple .vs__selected-options {
  align-items: flex-start;
  align-content: flex-start;
}

/* .selector .vs__search {
  width: 100%;
} */

.selector .vs__search,
.selector .vs__selected {
  margin: 0;
  z-index: 0;
  line-height: 1.2;
  justify-content: space-between;
}

.selector .vs__selected {
  max-width: 100%;
  min-width: 0;
  flex: 1 1 auto;
}

.vs--multiple .vs__selected {
  width: 100%;
}

.selector.vs--single .vs__selected-options {
  flex-wrap: nowrap;
}

.selector.vs--single .vs__selected {
  width: 100%;
}

.selector .vs__search {
  min-width: 0;
}

.selector__selected-label {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .selector .vs__selected {
    display: block;
    width: 100%;
    white-space: normal !important;
    word-break: normal;
    overflow-wrap: break-word;
  }
}


.selector.border-disabled .vs__dropdown-toggle {
  border: none;
  padding: 0;
}

.selector .vs__actions {
  padding-top: 0;
  align-items: center;
}

.selector.vs--open .vs__dropdown-toggle {
  border-bottom-color: #3b82f6;
}


.selector .vs__spinner {
  height: 3.5em;
  width: 3.5em;
}

[data-popper-placement='top'] {
  border-radius: 6px;
  border-top-style: solid;
  border-bottom-style: none;
  box-shadow: 0 -12px 30px rgba(15, 23, 42, 0.16);
}
</style>
