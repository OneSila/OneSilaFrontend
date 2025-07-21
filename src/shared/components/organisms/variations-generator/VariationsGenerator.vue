<script setup lang="ts">
import { ref, onMounted, watch, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Accordion } from '../../atoms/accordion';
import apolloClient from '../../../../../apollo-client';
import { productPropertiesRulesQuery, propertySelectValuesQuery } from '../../../api/queries/properties.js';
import { ConfigTypes } from '../../../utils/constants';

interface PropertyValue {
  id: string;
  value: string;
}

interface RuleProperty {
  propertyId: string;
  propertyName: string;
  values: PropertyValue[];
  selected: string[];
}

const props = defineProps<{ productTypeId: string | null }>();
const emit = defineEmits(['update:selected', 'update:rule-id']);
const { t } = useI18n();

const loading = ref(false);
const ruleId = ref<string | null>(null);
const properties: Ref<RuleProperty[]> = ref([]);

const emitSelected = () => {
  const selectedIds = properties.value.flatMap(p => p.selected);
  emit('update:selected', selectedIds);
  emit('update:rule-id', ruleId.value);
};

const fetchValues = async (propertyId: string) => {
  const { data } = await apolloClient.query({
    query: propertySelectValuesQuery,
    variables: { filter: { property: { id: { exact: propertyId } } } },
    fetchPolicy: 'network-only'
  });

  if (data && data.propertySelectValues) {
    return data.propertySelectValues.edges.map((edge: any) => ({
      id: edge.node.id,
      value: edge.node.value,
    }));
  }
  return [];
};

const fetchData = async () => {
  properties.value = [];
  ruleId.value = null;
  emitSelected();

  if (!props.productTypeId) return;

  loading.value = true;
  const { data } = await apolloClient.query({
    query: productPropertiesRulesQuery,
    variables: { filter: { productType: { id: { exact: props.productTypeId } } } },
    fetchPolicy: 'network-only'
  });

  if (data && data.productPropertiesRules && data.productPropertiesRules.edges.length > 0) {
    const rule = data.productPropertiesRules.edges[0].node;
    ruleId.value = rule.id;
    const requiredItems = rule.items.filter((item: any) => item.type === ConfigTypes.REQUIRED_IN_CONFIGURATOR);
    for (const item of requiredItems) {
      const values = await fetchValues(item.property.id);
      properties.value.push({
        propertyId: item.property.id,
        propertyName: item.property.name,
        values,
        selected: [],
      });
    }
  }
  loading.value = false;
  emitSelected();
};

onMounted(fetchData);
watch(() => props.productTypeId, fetchData);

const toggleValue = (propertyIndex: number, valueId: string) => {
  const sel = properties.value[propertyIndex].selected;
  if (sel.includes(valueId)) {
    properties.value[propertyIndex].selected = sel.filter(id => id !== valueId);
  } else {
    properties.value[propertyIndex].selected.push(valueId);
  }
  emitSelected();
};

const selectAll = (idx: number) => {
  properties.value[idx].selected = properties.value[idx].values.map(v => v.id);
  emitSelected();
};

const deselectAll = (idx: number) => {
  properties.value[idx].selected = [];
  emitSelected();
};

const toggleAll = (idx: number) => {
  if (properties.value[idx].selected.length === properties.value[idx].values.length) {
    deselectAll(idx);
  } else {
    selectAll(idx);
  }
};
</script>

<template>
  <div>
    <p class="mb-4 text-sm text-gray-500" v-if="!loading && properties.length">
      {{ t('products.products.create.wizard.stepFour.configurable.generateDescription') }}
    </p>
    <div v-if="loading" class="text-center my-4">{{ t('shared.labels.loading') }}</div>
    <Accordion v-else-if="properties.length"
               :items="properties.map((p, i) => ({ name: 'prop' + i, label: `${p.propertyName} (${p.selected.length} / ${p.values.length} ${t('shared.labels.selected')})` }))"
               default-active="prop0">
      <template v-for="(prop, index) in properties" #[`prop${index}`]="">
        <div class="mb-2 flex justify-end">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :checked="prop.selected.length === prop.values.length" @change="toggleAll(index)" />
            <span class="font-medium">
              {{ prop.selected.length === prop.values.length ? t('shared.button.deselectAll') : t('shared.button.selectAll') }}
            </span>
          </label>
        </div>
        <hr class="mb-2">
        <div class="overflow-y-auto max-h-60">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <label v-for="val in prop.values" :key="val.id" class="flex items-center gap-2">
              <input type="checkbox" :value="val.id" :checked="prop.selected.includes(val.id)" @change="toggleValue(index, val.id)" />
              <span>{{ val.value }}</span>
            </label>
          </div>
        </div>
      </template>
    </Accordion>
    <div v-else class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 text-center" role="alert">
      {{ t('shared.alert.noData') }}
    </div>
  </div>
</template>
