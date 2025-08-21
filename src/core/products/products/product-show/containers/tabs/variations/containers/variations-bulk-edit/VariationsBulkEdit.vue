<script setup lang="ts">
import { onMounted, onUnmounted, ref, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../../apollo-client';
import {
  configurableVariationsQuery,
  bundleVariationsQuery,
} from '../../../../../../../../shared/api/queries/products.js';
import {
  productPropertiesQuery,
  productPropertiesRulesQuery,
} from '../../../../../../../../shared/api/queries/properties.js';
import { translationLanguagesQuery } from '../../../../../../../../shared/api/queries/languages.js';
import {
  bulkCreateProductPropertiesMutation,
  bulkUpdateProductPropertiesMutation,
  deleteProductPropertiesMutation,
} from '../../../../../../../../shared/api/mutations/properties.js';
import { Product } from '../../../../../../configs';
import { TextInput } from '../../../../../../../../shared/components/atoms/input-text';
import { TextEditor } from '../../../../../../../../shared/components/atoms/input-text-editor';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { Selector } from '../../../../../../../../shared/components/atoms/selector';
import { Modal } from '../../../../../../../../shared/components/atoms/modal';
import { ConfigTypes, PropertyTypes, ProductType } from '../../../../../../../../shared/utils/constants';

interface VariationRow {
  id: string;
  name: string;
  sku: string;
  active: boolean;
}

interface PropertyDef {
  id: string;
  name: string;
  type: string;
  requireType: string;
}

interface CellValue {
  id?: string | null;
  value: any;
}

const props = defineProps<{ product: Product }>();
const { t } = useI18n();

const variations: Ref<VariationRow[]> = ref([]);
const properties: Ref<PropertyDef[]> = ref([]);
const matrix: Ref<Record<string, Record<string, CellValue>>> = ref({});
const original: Ref<Record<string, Record<string, CellValue>>> = ref({});

const language = ref<string | null>(null);
const languages = ref<{ value: string; label: string }[]>([]);

const showModal = ref(false);
const modalValue = ref('');
const modalCell = ref<{ variationId: string; property: PropertyDef } | null>(null);

const dragging = ref(false);
let dragProperty: string | null = null;
let dragValue: any = null;

const startDrag = (propId: string, varId: string) => {
  const cell = matrix.value[varId][propId];
  dragging.value = true;
  dragProperty = propId;
  dragValue = cell.value;
};

const onEnter = (propId: string, varId: string) => {
  if (dragging.value && dragProperty === propId) {
    matrix.value[varId][propId].value = dragValue;
  }
};

const stopDrag = () => {
  dragging.value = false;
  dragProperty = null;
};

onUnmounted(() => {
  window.removeEventListener('mouseup', stopDrag);
});
window.addEventListener('mouseup', stopDrag);

const openModal = (variationId: string, property: PropertyDef) => {
  modalCell.value = { variationId, property };
  modalValue.value = matrix.value[variationId][property.id].value || '';
  showModal.value = true;
};

const saveModalValue = () => {
  if (modalCell.value) {
    matrix.value[modalCell.value.variationId][modalCell.value.property.id].value = modalValue.value;
  }
  showModal.value = false;
};

const getCellClass = (property: PropertyDef, value: any) => {
  const filled = value !== null && value !== '' && value !== undefined;
  if (filled) {
    return 'bg-green-50';
  }
  if (
    [
      ConfigTypes.REQUIRED,
      ConfigTypes.REQUIRED_IN_CONFIGURATOR,
      ConfigTypes.OPTIONAL_IN_CONFIGURATOR,
    ].includes(property.requireType as ConfigTypes)
  ) {
    return 'bg-red-50';
  }
  if (property.requireType === ConfigTypes.OPTIONAL) {
    return 'bg-orange-50';
  }
  return '';
};

const fetchLanguages = async () => {
  const { data } = await apolloClient.query({
    query: translationLanguagesQuery,
    fetchPolicy: 'network-only',
  });
  if (data && data.translationLanguages) {
    languages.value = data.translationLanguages.languages.map((l: any) => ({
      value: l.code,
      label: l.name,
    }));
    language.value = data.translationLanguages.defaultLanguage.code;
  }
};

const fetchVariations = async () => {
  const isConfigurable = props.product.type === ProductType.Configurable;
  const query = isConfigurable
    ? configurableVariationsQuery
    : bundleVariationsQuery;
  const { data } = await apolloClient.query({
    query,
    variables: { filter: { parent: { id: { exact: props.product.id } } } },
    fetchPolicy: 'network-only',
  });

  const key = isConfigurable ? 'configurableVariations' : 'bundleVariations';
  if (data && data[key] && data[key].edges) {
    variations.value = data[key].edges.map((e: any) => ({
      id: e.node.variation.id,
      name: e.node.variation.name,
      sku: e.node.variation.sku,
      active: e.node.variation.active,
    }));
  }
};

const fetchProperties = async () => {
  const productTypeValue = props.product.productpropertySet.find(
    (p: any) => p.property.isProductType,
  )?.valueSelect?.id;
  if (!productTypeValue) return;
  const { data } = await apolloClient.query({
    query: productPropertiesRulesQuery,
    variables: { filter: { productType: { id: { exact: productTypeValue } } } },
    fetchPolicy: 'network-only',
  });
  if (data && data.productPropertiesRules && data.productPropertiesRules.edges) {
    const rule = data.productPropertiesRules.edges[0]?.node;
    if (rule) {
      properties.value = rule.items.map((i: any) => ({
        id: i.property.id,
        name: i.property.name,
        type: i.property.type,
        requireType: i.type,
      }));
    }
  }
};

const initializeMatrix = () => {
  matrix.value = {};
  variations.value.forEach((v) => {
    matrix.value[v.id] = {};
    properties.value.forEach((p) => {
      matrix.value[v.id][p.id] = { id: null, value: null };
    });
  });
};

const fetchExistingValues = async () => {
  const variationIds = variations.value.map((v) => v.id);
  const propertyIds = properties.value.map((p) => p.id);
  if (!variationIds.length || !propertyIds.length) return;

  const { data } = await apolloClient.query({
    query: productPropertiesQuery,
    variables: {
      filter: {
        product: { id: { inList: variationIds } },
        property: { id: { inList: propertyIds } },
      },
      first: 1000,
    },
    fetchPolicy: 'network-only',
  });
  if (data && data.productProperties && data.productProperties.edges) {
    data.productProperties.edges.forEach((e: any) => {
      const vId = e.node.product.id;
      const pId = e.node.property.id;
      if (!matrix.value[vId]) return;
      const cell = matrix.value[vId][pId];
      cell.id = e.node.id;
      switch (e.node.property.type) {
        case PropertyTypes.INT:
          cell.value = e.node.valueInt;
          break;
        case PropertyTypes.FLOAT:
          cell.value = e.node.valueFloat;
          break;
        case PropertyTypes.TEXT:
          cell.value = e.node.valueText;
          break;
        case PropertyTypes.DESCRIPTION:
          cell.value = e.node.valueDescription;
          break;
      }
    });
  }
  original.value = JSON.parse(JSON.stringify(matrix.value));
};

const fetchAll = async () => {
  await fetchLanguages();
  await fetchVariations();
  await fetchProperties();
  initializeMatrix();
  await fetchExistingValues();
};

const createInput = (
  vId: string,
  prop: PropertyDef,
  value: any,
  id?: string | null,
) => {
  const item: any = {
    product: { id: vId },
    property: { id: prop.id },
  };
  if (id) item.id = id;
  switch (prop.type) {
    case PropertyTypes.INT:
      item.valueInt = value !== '' ? parseInt(value, 10) : null;
      break;
    case PropertyTypes.FLOAT:
      item.valueFloat = value !== '' ? parseFloat(value) : null;
      break;
    case PropertyTypes.TEXT:
      item.valueText = value;
      item.language = language.value;
      break;
    case PropertyTypes.DESCRIPTION:
      item.valueDescription = value;
      item.language = language.value;
      break;
  }
  return item;
};

const save = async () => {
  const creates: any[] = [];
  const updates: any[] = [];
  const deletes: string[] = [];

  variations.value.forEach((v) => {
    properties.value.forEach((p) => {
      const cell = matrix.value[v.id][p.id];
      const orig = original.value[v.id][p.id];
      const hasValue = cell.value !== null && cell.value !== '' && cell.value !== undefined;

      if (cell.id) {
        if (hasValue) {
          if (cell.value !== orig.value) {
            updates.push(createInput(v.id, p, cell.value, cell.id));
          }
        } else {
          deletes.push(cell.id);
        }
      } else if (hasValue) {
        creates.push(createInput(v.id, p, cell.value));
      }
    });
  });

  if (creates.length) {
    await apolloClient.mutate({
      mutation: bulkCreateProductPropertiesMutation,
      variables: { data: creates },
    });
  }
  if (updates.length) {
    await apolloClient.mutate({
      mutation: bulkUpdateProductPropertiesMutation,
      variables: { data: updates },
    });
  }
  if (deletes.length) {
    await apolloClient.mutate({
      mutation: deleteProductPropertiesMutation,
      variables: { ids: deletes },
    });
  }
  original.value = JSON.parse(JSON.stringify(matrix.value));
};

onMounted(fetchAll);
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-end items-center gap-4">
      <Selector v-if="languages.length" v-model="language" :options="languages" />
      <Button @click="save">{{ t('shared.labels.save') }}</Button>
    </div>
    <div class="overflow-auto max-h-[70vh]">
      <table class="min-w-max divide-y divide-gray-300">
        <thead>
          <tr>
            <th class="px-2 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.name') }}</th>
            <th class="px-2 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.sku') }}</th>
            <th class="px-2 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.active') }}</th>
            <th
              v-for="prop in properties"
              :key="prop.id"
              class="px-2 py-2 text-left text-sm font-semibold text-gray-900"
            >
              {{ prop.name }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="v in variations" :key="v.id">
            <td class="px-2 py-1 whitespace-nowrap">{{ v.name }}</td>
            <td class="px-2 py-1 whitespace-nowrap">{{ v.sku }}</td>
            <td class="px-2 py-1 whitespace-nowrap">{{ v.active ? '✓' : '✗' }}</td>
            <td
              v-for="prop in properties"
              :key="prop.id"
              class="px-2 py-1 min-w-[140px]"
            >
              <div
                class="w-full h-full"
                :class="getCellClass(prop, matrix[v.id][prop.id].value)"
                @mousedown="startDrag(prop.id, v.id)"
                @mouseenter="onEnter(prop.id, v.id)"
              >
                <template v-if="[PropertyTypes.INT, PropertyTypes.FLOAT].includes(prop.type)">
                  <TextInput
                    class="w-full"
                    v-model="matrix[v.id][prop.id].value"
                    :number="prop.type === PropertyTypes.INT"
                    :float="prop.type === PropertyTypes.FLOAT"
                  />
                </template>
                <template v-else>
                  <TextInput
                    class="w-full truncate"
                    v-model="matrix[v.id][prop.id].value"
                    @dblclick="openModal(v.id, prop)"
                  />
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal v-model="showModal" @closed="showModal = false">
      <template v-if="modalCell" #title>{{ modalCell.property.name }}</template>
      <div class="space-y-4">
        <div v-if="modalCell && modalCell.property.type === PropertyTypes.DESCRIPTION">
          <TextEditor v-model="modalValue" autogrow />
        </div>
        <div v-else>
          <TextInput v-model="modalValue" />
        </div>
        <div class="flex justify-end">
          <Button @click="saveModalValue">{{ t('shared.labels.save') }}</Button>
        </div>
      </div>
    </Modal>
  </div>
</template>
