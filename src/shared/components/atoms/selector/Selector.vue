<script setup lang="ts">
import VueSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import { createPopper, Placement } from '@popperjs/core';
import {computed, onMounted, Ref, ref, watchEffect} from 'vue';
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
    isLoading?: boolean;
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
  (e: 'update:modelValue', event): void;
}>();

const { t } = useI18n();

const selectorRef: Ref<any> = ref(null);
const dropdownOptions: Ref<any[]> = ref(props.options);

const calculatePosition = (dropdownList, component, { width }) => {
  dropdownList.style.width = width;

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
  dropdownOptions.value = [...props.options];

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
    const selectedOptions = props.options.filter((option) => {
      const optionValue = props.valueBy ? option[props.valueBy] : option;

      return Array.isArray(props.modelValue)
        ? props.modelValue.includes(optionValue)
        : optionValue === props.modelValue;
    });

    const limitedOptions = props.options.slice(0, props.limit);

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

    dropdownOptions.value = props.options
      .slice(0, props.limit)
      .concat(missingSelectedOptions);
  } else {
    dropdownOptions.value = props.options;
  }
});

const onModelValueUpdated = (value) => {
   if (value === 'add-entry') {
    emit('add-clicked');
    return;
  }

  if (!value) {
    emit('deselected', value);
  }

  emit('update:modelValue', value);
};

const handleKeydown = (event) => {
  event.stopPropagation();
};


const getLabel = (option: any): string | null => {
  if (!option) return null;

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


</script>

<template>
  <VueSelect
    ref="selectorRef"
    class="selector w-full md:min-w-38 text-sm bg-white"
    @keydown.enter="handleKeydown"
    :placeholder="placeholder || t('shared.components.molecules.selector.defaultPlaceholder')"
    :model-value="modelValue"
    :options="dropdownOptions"
    :label="labelBy"
    :reduce="(item) => (valueBy ? item[valueBy] : item)"
    :calculate-position="calculatePosition"
    :multiple="multiple"
    :filterable="filterable"
    :clearable="removable"
    :loading="isLoading"
    close-on-select
    append-to-body
    searchable
    @update:model-value="(event) => onModelValueUpdated(event)"
    @search="(search, loading) => emit('searched', search, loading)"
    @option:selecting="(event) => emit('selected', event)"
    @option:deselected="(event) => emit('deselected', event)"
  >

<!-- Pills for multiple -->
<template v-if="multiple" #selected-option-container="{ option, deselect, disabled }">
  <span
    class="inline-flex items-center rounded-full bg-gray-100 text-sm text-gray-800 px-3 py-1 mr-1 mb-1 border border-gray-400 transition-colors duration-200 hover:bg-gray-200 cursor-pointer"
  >
    <span v-if="getLabel(option) != null">
      {{ getLabel(option) }}
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
  <template v-else-if="getLabel(modelValue) === null" #selected-option>
    <span class="text-gray-400 italic flex items-center gap-1">
      <Icon name="spinner" class="animate-spin" />
      {{ t('shared.labels.loading') }}
    </span>
  </template>



    <template #no-options>
      <div class="w-full px-2 text-left text-opacity-50">
        <em>{{ t('shared.components.molecules.selector.typeToSearch') }}.</em>
      </div>
    </template>

  </VueSelect>
</template>

<style>
.selector .vs__search::placeholder {
  color: #9ca3af;
}

.selector,
.selector .vs__dropdown-toggle {
  height: 100%;
}

.selector .vs__dropdown-toggle {
  padding: 7px 0;
}

.selector .vs__selected-options {
  align-items: flex-start;
  align-content: flex-start;
  min-width: 100px;
}

/* .selector .vs__search {
  width: 100%;
} */

.selector .vs__search,
.selector .vs__selected {
  margin: 0;
  z-index: 0;
  line-height: 1.2;
  white-space: pre;
  justify-content: space-between;
}

.vs--multiple .vs__selected {
  width: 100%;
}

@media (max-width: 768px) {
  .selector .vs__selected {
    display: block;               /* Make it block-level so it takes full width */
    white-space: normal !important;  /* Allow wrapping instead of preserving whitespace */
    word-break: normal;           /* Prevent breaking words arbitrarily */
    overflow-wrap: break-word;    /* Break long words only if absolutely necessary */
  }
}


.selector.border-disabled .vs__dropdown-toggle {
  border: none;
  padding: 0;
}

.selector .vs__actions {
  padding-top: 5px;
  align-items: flex-start;
}

.selector.vs--open .vs__dropdown-toggle {
  border-radius: 0 0 4px 4px;
  /* border-top-color: transparent; */
  border-bottom-color: rgba(60, 60, 60, 0.26);
}


.selector .vs__spinner {
  height: 3.5em;
  width: 3.5em;
}

[data-popper-placement='top'] {
  border-radius: 4px 4px 0 0;
  border-top-style: solid;
  border-bottom-style: none;
  box-shadow: 0 -3px 6px rgba(0, 0, 0, 0.15);
}
</style>
