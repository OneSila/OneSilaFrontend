<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { Selector } from '../../../../../../atoms/selector';
import { Label } from '../../../../../../atoms/label';
import { ChoiceFilter } from '../../../../searchConfig';

const props = defineProps<{ filter: ChoiceFilter }>();
const emit = defineEmits(['update-value']);
const route = useRoute();

const selectedValue = ref(
  props.filter.default !== undefined ? props.filter.default : null
);

watch(() => route.query[props.filter.name], (newValue) => {
  if (newValue !== undefined) {
    selectedValue.value = newValue;
  }
}, { immediate: true });

watchEffect(() => {
  emit('update-value', selectedValue.value);
});

const placeholder = ref(props.filter.placeholder || undefined);
const dropdownPosition = ref(props.filter.dropdownPosition || 'top');
const mandatory = ref(props.filter.mandatory !== undefined ? props.filter.mandatory : false);
const multiple = ref(props.filter.multiple || false);
const filterable = ref(props.filter.filterable || false);
const removable = ref(props.filter.removable !== undefined ? props.filter.removable : true);
const limit = ref(props.filter.limit || undefined);
const disabled = ref(props.filter.disabled === true);

</script>

<template>
  <div class="filter-item">
  <Label>{{ filter.label }}</Label>
  <p v-if="filter.helpText" class="mt-1 text-xs text-gray-500">{{ filter.helpText }}</p>
  <div>
    <Selector
      v-model="selectedValue"
      :options="filter.options"
      :label-by="filter.labelBy"
      :value-by="filter.valueBy"
      :placeholder="placeholder"
      :dropdown-position="dropdownPosition"
      :mandatory="mandatory"
      :multiple="multiple"
      :filterable="filterable"
      :removable="removable"
      :limit="limit"
      :disabled="disabled"
    />
  </div>
  </div>
</template>
