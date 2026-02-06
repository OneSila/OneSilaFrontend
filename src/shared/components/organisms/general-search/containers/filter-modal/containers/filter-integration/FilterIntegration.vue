<script setup lang="ts">
import { ref, watch, watchEffect, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { IntegrationsSelector } from '../../../../../../molecules/integrations-selector';
import { Label } from '../../../../../../atoms/label';
import { IntegrationFilter } from '../../../../searchConfig';
import apolloClient from '../../../../../../../../../apollo-client';
import { DocumentNode } from 'graphql';

const props = defineProps<{ filter: IntegrationFilter }>();
const emit = defineEmits(['update-value']);
const route = useRoute();

const integrations = ref<any[]>([]);
const loading = ref(true);
const selectedValue = ref(
  props.filter.default !== undefined ? props.filter.default : null
);

const toUiValue = (value: any) => {
  if (props.filter.addDefault && value === 'None') {
    return 'default';
  }
  return value ?? null;
};

const fromUiValue = (value: any) => {
  if (props.filter.addDefault && value === 'default') {
    return 'None';
  }
  return value ?? null;
};

const updateSelectedValue = (value: any) => {
  if (Array.isArray(value)) {
    selectedValue.value = value.map(fromUiValue);
  } else {
    selectedValue.value = fromUiValue(value);
  }
};

const fetchData = async () => {
  const variables: any = {
    ...props.filter.queryVariables,
  };

  if (!props.filter.skipFilterParam) {
    variables.filter = {
      ...(props.filter.queryVariables?.filter ?? {}),
    };
  }

  try {
    loading.value = true;
    const { data } = await apolloClient.query({
      query: props.filter.query as unknown as DocumentNode,
      variables,
      fetchPolicy: 'cache-first',
    });

    const rawData = data?.[props.filter.dataKey];
    integrations.value = props.filter.isEdge && rawData?.edges
      ? rawData.edges.map((edge: any) => edge.node)
      : rawData ?? [];
  } catch (error) {
    console.error('Error fetching integrations:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

watch(
  () => route.query[props.filter.name],
  (newValue) => {
    if (newValue !== undefined) {
      if (newValue === 'default') {
        selectedValue.value = 'None';
      } else {
        selectedValue.value = newValue;
      }
    } else {
      selectedValue.value = null;
    }
  },
  { immediate: true }
);

watchEffect(() => {
  emit('update-value', selectedValue.value);
});
</script>

<template>
  <div class="filter-item">
    <Label>{{ filter.label }}</Label>
    <p v-if="filter.helpText" class="mt-1 text-xs text-gray-500">{{ filter.helpText }}</p>
    <IntegrationsSelector
      :model-value="Array.isArray(selectedValue) ? selectedValue.map(toUiValue) : toUiValue(selectedValue)"
      :integrations="integrations"
      :placeholder="filter.placeholder"
      :multiple="filter.multiple"
      :filterable="filter.filterable"
      :removable="filter.removable"
      :add-default="filter.addDefault"
      :exclude-ids="filter.excludeIds"
      :disabled="filter.disabled || loading"
      @update:model-value="updateSelectedValue"
    />
  </div>
</template>
