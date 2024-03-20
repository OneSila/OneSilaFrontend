<script setup lang="ts">
import VueSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import { createPopper, Placement } from '@popperjs/core';
import { onMounted, Ref, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

const props = withDefaults(
  defineProps<{
    options?: any[];
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
  }>(),
  { dropdownPosition: 'top', options: [] as any, removable: true },
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
  dropdownOptions.value = props.options;
});

watchEffect(() => {
  if (props.boolean) {
    dropdownOptions.value = [
      { id: true, name: 'Yes' },
      { id: false, name: 'No' },
    ];

    if (!props.mandatory) {
      dropdownOptions.value.unshift({ id: 'all', name: 'All' });
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
  if (!value) {
    emit('deselected', value);
  }

  emit('update:modelValue', value);
};
</script>

<template>
  <VueSelect
    ref="selectorRef"
    class="selector min-w-38 text-sm bg-white"
    :placeholder="
      placeholder ||
      t('shared.components.molecules.selector.defaultPlaceholder')
    "
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

[data-popper-placement='top'] {
  border-radius: 4px 4px 0 0;
  border-top-style: solid;
  border-bottom-style: none;
  box-shadow: 0 -3px 6px rgba(0, 0, 0, 0.15);
}
</style>
