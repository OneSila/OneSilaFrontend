<script setup lang="ts">
import { reactive, computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Product } from '../../../../../../configs'
import { bundleVariationsQuery, configurableVariationsQuery } from '../../../../../../../../../shared/api/queries/products.js'
import { ProductType, PropertyTypes } from '../../../../../../../../../shared/utils/constants'
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { TextInput } from "../../../../../../../../../shared/components/atoms/input-text";
import { TextEditor } from "../../../../../../../../../shared/components/atoms/input-text-editor";
import { Toggle } from "../../../../../../../../../shared/components/atoms/toggle";
import { DateInput } from "../../../../../../../../../shared/components/atoms/input-date";
import DateTimeInput from "../../../../../../../../../shared/components/atoms/input-date-time/DateTimeInput.vue";
import { shortenText } from "../../../../../../../../../shared/utils";
import { Modal } from "../../../../../../../../../shared/components/atoms/modal";
import apolloClient from '../../../../../../../../../../apollo-client'
import { propertiesQuery, productPropertiesQuery, productPropertiesRulesQuery } from '../../../../../../../../../shared/api/queries/properties.js'

interface PropertyInfo {
  id: string
  name: string
  type: string
  requireType: string
}

const props = defineProps<{ product: Product }>()

const { t } = useI18n()

const baseColumns = [
  { key: 'name', label: t('shared.labels.name') },
  { key: 'sku', label: t('shared.labels.sku') },
  { key: 'active', label: t('shared.labels.active') },
]

const properties = ref<PropertyInfo[]>([])

const columns = computed(() => [
  ...baseColumns,
  ...properties.value.map((p) => ({ key: p.id, label: p.name })),
])

const columnWidths = reactive<Record<string, number>>({})
watch(
  columns,
  (cols) => {
    cols.forEach((col) => {
      if (!columnWidths[col.key]) columnWidths[col.key] = 150
    })
  },
  { immediate: true }
)

const isAlias = computed(() => props.product.type === ProductType.Alias)
const parentId = computed(() => (isAlias.value ? props.product.aliasParentProduct.id : props.product.id))
const parentType = computed(() => (isAlias.value ? props.product.aliasParentProduct.type : props.product.type))
const query = computed(() =>
  parentType.value === ProductType.Bundle ? bundleVariationsQuery : configurableVariationsQuery
)
const queryKey = computed(() =>
  parentType.value === ProductType.Bundle ? 'bundleVariations' : 'configurableVariations'
)

const fetchProperties = async () => {
  const { data: typeData } = await apolloClient.query({
    query: propertiesQuery,
    variables: { filter: { isProductType: { exact: true } } },
    fetchPolicy: 'network-only',
  })
  if (!typeData?.properties?.edges?.length) return
  const typePropertyId = typeData.properties.edges[0].node.id

  const { data: valueData } = await apolloClient.query({
    query: productPropertiesQuery,
    variables: {
      filter: {
        property: { id: { exact: typePropertyId } },
        product: { id: { exact: parentId.value } },
      },
    },
    fetchPolicy: 'network-only',
  })
  if (!valueData?.productProperties?.edges?.length) return
  const productTypeValueId = valueData.productProperties.edges[0].node.valueSelect?.id
  if (!productTypeValueId) return

  const { data: ruleData } = await apolloClient.query({
    query: productPropertiesRulesQuery,
    variables: { filter: { productType: { id: { exact: productTypeValueId } } } },
    fetchPolicy: 'network-only',
  })
  if (!ruleData?.productPropertiesRules?.edges?.length) return
  const items = ruleData.productPropertiesRules.edges[0].node.items
  properties.value = items.map((item: any) => ({
    id: item.property.id,
    name: item.property.name,
    type: item.property.type,
    requireType: item.type,
  }))
}

onMounted(fetchProperties)

const getPropertyType = (id: string) =>
  properties.value.find((p) => p.id === id)?.type

const showTextModal = ref(false)
const showDescriptionModal = ref(false)

const MIN_COLUMN_WIDTH = 100
const startResize = (e: MouseEvent, key: string) => {
  const startX = e.pageX
  const startWidth = columnWidths[key]

  const onMouseMove = (event: MouseEvent) => {
    const delta = event.pageX - startX
    columnWidths[key] = Math.max(MIN_COLUMN_WIDTH, startWidth + delta)
  }

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
</script>

<template>
  <perfect-scrollbar class="max-h-96 overflow-auto border border-gray-200 relative">
    <ApolloQuery
      :query="query"
      :variables="{ filter: { parent: { id: { exact: parentId } } }, first: 100 }"
    >
      <template v-slot="{ result: { data } }">
        <table v-if="data && data[queryKey]" class="min-w-max">
          <thead class="bg-gray-100 sticky top-0">
            <tr>
              <th
                v-for="col in columns"
                :key="col.key"
                class="text-left px-2 py-1 text-sm font-medium text-gray-700 relative border-r border-gray-200"
                :style="{ width: columnWidths[col.key] + 'px' }"
              >
                <div class="flex items-center h-full">
                  <span class="block truncate" :title="col.label">{{ col.label }}</span>
                  <span
                    class="resizer select-none"
                    @mousedown="(e) => startResize(e, col.key)"
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="edge in data[queryKey].edges"
              :key="edge.node.id"
              class="border-t"
            >
              <td
                v-for="col in columns"
                :key="col.key"
                class="px-2 py-1 border-r border-gray-200"
                :style="{ width: columnWidths[col.key] + 'px' }"
              >
                <template v-if="col.key === 'name'">
                  <span class="block truncate" :title="edge.node.variation.name">
                    {{ shortenText(edge.node.variation.name, 32) }}
                  </span>
                </template>
                <template v-else-if="col.key === 'sku'">
                  <span class="block truncate" :title="edge.node.variation.sku">
                    {{ edge.node.variation.sku }}
                  </span>
                </template>
                <template v-else-if="col.key === 'active'">
                  <Icon
                    v-if="edge.node.variation.active"
                    name="check-circle"
                    class="text-green-500"
                  />
                  <Icon
                    v-else
                    name="times-circle"
                    class="text-red-500"
                  />
                </template>
                <template v-else>
                  <select
                    v-if="getPropertyType(col.key) === PropertyTypes.SELECT"
                    class="w-full border p-1"
                    disabled
                  ></select>
                  <select
                    v-else-if="getPropertyType(col.key) === PropertyTypes.MULTISELECT"
                    class="w-full border p-1"
                    multiple
                    disabled
                  ></select>
                  <TextInput
                    v-else-if="getPropertyType(col.key) === PropertyTypes.INT"
                    class="w-full"
                    :model-value="null"
                    number
                    disabled
                  />
                  <TextInput
                    v-else-if="getPropertyType(col.key) === PropertyTypes.FLOAT"
                    class="w-full"
                    :model-value="null"
                    float
                    disabled
                  />
                  <div
                    v-else-if="getPropertyType(col.key) === PropertyTypes.TEXT"
                    class="relative cursor-pointer"
                    @dblclick="showTextModal = true"
                  >
                    <TextInput
                      class="w-full pointer-events-none"
                      :model-value="null"
                      disabled
                    />
                    <Icon
                      name="maximize"
                      class="absolute top-1 right-1 text-gray-400 cursor-pointer"
                      @click.stop="showTextModal = true"
                    />
                  </div>
                  <div
                    v-else-if="getPropertyType(col.key) === PropertyTypes.DESCRIPTION"
                    class="relative cursor-pointer"
                    @dblclick="showDescriptionModal = true"
                  >
                    <TextEditor
                      :model-value="''"
                      class="h-32 pointer-events-none"
                      disabled
                    />
                    <Icon
                      name="maximize"
                      class="absolute top-1 right-1 text-gray-400 cursor-pointer"
                      @click.stop="showDescriptionModal = true"
                    />
                  </div>
                  <Toggle
                    v-else-if="getPropertyType(col.key) === PropertyTypes.BOOLEAN"
                    :model-value="false"
                    class="pointer-events-none"
                  />
                  <div
                    v-else-if="getPropertyType(col.key) === PropertyTypes.DATE"
                    class="pointer-events-none"
                  >
                    <DateInput :model-value="null" />
                  </div>
                  <div
                    v-else-if="getPropertyType(col.key) === PropertyTypes.DATETIME"
                    class="pointer-events-none"
                  >
                    <DateTimeInput :model-value="null" />
                  </div>
                  <input
                    v-else
                    type="text"
                    class="w-full border p-1"
                    disabled
                  />
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </ApolloQuery>
  </perfect-scrollbar>
  <Modal v-model="showTextModal">
    <div class="p-4">
      <TextInput class="w-full" />
    </div>
  </Modal>
  <Modal v-model="showDescriptionModal">
    <div class="p-4">
      <TextEditor class="h-32" />
    </div>
  </Modal>
</template>

<style scoped>
.resizer {
  position: absolute;
  right: 0;
  top: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  background-color: #e5e7eb;
}
</style>
