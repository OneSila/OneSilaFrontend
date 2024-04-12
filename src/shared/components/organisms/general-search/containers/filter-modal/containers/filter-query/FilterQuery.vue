<script setup lang="ts">

import {ref, watch, watchEffect, onMounted, Ref} from 'vue';
import { useRoute } from 'vue-router';
import { Selector } from '../../../../../../atoms/selector';
import { Label } from '../../../../../../atoms/label';
import { QueryFilter } from '../../../../searchConfig';
import apolloClient from "../../../../../../../../../apollo-client";
import {DocumentNode} from "graphql";

const props = defineProps<{ filter: QueryFilter }>();
const emit = defineEmits(['update-value']);
const route = useRoute();
const cleanedData: Ref<any[]> = ref([]);
const loading = ref(true);
const selectedValue = ref(
  props.filter.default !== undefined ? props.filter.default : null
);

const fetchData = async () => {
  const variables = { ...props.filter.queryVariables };
  try {
    loading.value = true;
    const { data } = await apolloClient.query({
      query: props.filter.query as unknown as DocumentNode,
      variables: variables,
      fetchPolicy: 'network-only'
    });
    if (data && data[props.filter.dataKey]) {
      cleanedData.value = cleanData(data[props.filter.dataKey]);
    }
     loading.value = false;
  } catch (error) {
    console.error('Error fetching data:', error);
    loading.value = false;
  }
};

onMounted(fetchData);

watch(() => route.query[props.filter.name], (newValue) => {
  if (newValue !== undefined) {
    selectedValue.value = newValue;
  }
}, { immediate: true });

watchEffect(() => {
  emit('update-value', selectedValue.value);
});

watch(() => props.filter.queryVariables, fetchData, { deep: true });

const cleanData = (rawData) => {
  if (props.filter.isEdge && rawData?.edges) {
    return rawData.edges.map(edge => edge.node);
  }
  return rawData;
};

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
        <Selector
          v-if="!loading"
          class="h-9"
          v-model="selectedValue"
          :options="cleanedData"
          :label-by="filter.labelBy"
          :value-by="filter.valueBy"
          :placeholder="placeholder"
          :dropdown-position="dropdownPosition"
          :mandatory="mandatory"
          :multiple="multiple"
          :filterable="filterable"
          :removable="removable"
          :limit="limit"
          :disabled="disabled" />
      <Selector
          v-else
          class="h-9"
          :modelValue="null"
          :options="[]"
          :label-by="filter.labelBy"
          :value-by="filter.valueBy"
          :removable="false"
          :is-loading="true"
          disabled />
  </div>
</template>
