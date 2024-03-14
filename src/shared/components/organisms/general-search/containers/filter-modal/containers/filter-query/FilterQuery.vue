<script setup lang="ts">
import { ref, defineProps, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { Selector } from '../../../../../../atoms/selector';
import { Label } from '../../../../../../atoms/label';
import { QueryFilter } from '../../../../searchConfig';

const props = defineProps<{ filter: QueryFilter }>();
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
    <ApolloQuery :query="filter.query">
      <template v-slot="{ result: { data } }">
        <Selector
          v-if="data && data[filter.dataKey]"
          v-model="selectedValue"
          :options="data[filter.dataKey]"
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
      </template>
    </ApolloQuery>
  </div>
</template>
