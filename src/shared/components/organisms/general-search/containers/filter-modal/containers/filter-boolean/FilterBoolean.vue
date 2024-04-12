<script setup lang="ts">
import { ref, watchEffect, watch } from 'vue';
import { Selector } from '../../../../../../atoms/selector';
import { Label } from '../../../../../../atoms/label';
import {BooleanFilter} from '../../../../searchConfig';
import { useRoute } from 'vue-router';
import { booleanifyIfNeeded } from '../../../../../../../utils'

const props = defineProps<{ filter: BooleanFilter }>();
const emit = defineEmits(['update-value']);
const route = useRoute();

const selectedValue = ref<boolean | null | 'all'>(
  props.filter.default !== undefined ? props.filter.default :
  !props.filter.strict ? null : 'all'
);

watch(() => route.query[props.filter.name], (newValue) => {
  if (newValue !== undefined) {
    if (newValue != 'all') {
       selectedValue.value = booleanifyIfNeeded(newValue);
    } else {
      selectedValue.value = newValue;
    }
  }
}, { immediate: true });


watchEffect(() => {
  emit('update-value', selectedValue.value);
});


const placeholder = ref(props.filter.placeholder || undefined);
const dropdownPosition = ref(props.filter.dropdownPosition || 'top');
const disabled = ref(props.filter.disabled === true);

</script>


<template>
  <div class="filter-item">
    <Label>{{ filter.label }}</Label>
    <div>
    <Selector
      v-model="selectedValue"
      :dropdown-position="dropdownPosition"
      :placeholder="placeholder"
      :mandatory="!filter.strict"
      :options="[]"
      label-by="name"
      value-by="id"
      :removable="false"
      boolean
      :disabled="disabled"
    />
    </div>

  </div>

</template>