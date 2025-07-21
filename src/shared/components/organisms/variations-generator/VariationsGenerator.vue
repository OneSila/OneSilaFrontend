<script setup lang="ts">
import { ref, onMounted, watch, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Accordion } from '../../atoms/accordion';
import { PrimaryButton } from '../../atoms/button-primary';
import { SecondaryButton } from '../../atoms/button-secondary';
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
</script>

<template>
  <div>
    <div v-if="loading" class="text-center my-4">{{ t('shared.labels.loading') }}</div>
    <Accordion v-else-if="properties.length" :items="properties.map((p, i) => ({ name: 'prop' + i, label: p.propertyName }))">
      <template v-for="(prop, index) in properties" #[`prop${index}`]="">
        <div class="mb-2 flex justify-end gap-2">
          <PrimaryButton class="px-2 py-1" @click="selectAll(index)">
            {{ t('shared.button.selectAll') }}
          </PrimaryButton>
          <SecondaryButton class="px-2 py-1" @click="deselectAll(index)">
            {{ t('shared.button.deselectAll') }}
          </SecondaryButton>
        </div>
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
    <div v-else class="text-center text-gray-500">{{ t('shared.alert.noData') }}</div>
  </div>
</template>
