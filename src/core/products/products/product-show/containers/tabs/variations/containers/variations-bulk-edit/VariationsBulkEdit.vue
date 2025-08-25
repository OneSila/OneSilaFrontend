<script setup lang="ts">
import { reactive, computed, ref, onMounted, watch, toRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import { Product } from '../../../../../../configs'
import { bundleVariationsQuery, configurableVariationsQuery } from '../../../../../../../../../shared/api/queries/products.js'
import { ProductType, PropertyTypes, FieldType } from '../../../../../../../../../shared/utils/constants'
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { TextInput } from "../../../../../../../../../shared/components/atoms/input-text";
import { TextEditor } from "../../../../../../../../../shared/components/atoms/input-text-editor";
import { Toggle } from "../../../../../../../../../shared/components/atoms/toggle";
import { DateInput } from "../../../../../../../../../shared/components/atoms/input-date";
import DateTimeInput from "../../../../../../../../../shared/components/atoms/input-date-time/DateTimeInput.vue";
import { shortenText } from "../../../../../../../../../shared/utils";
import { Modal } from "../../../../../../../../../shared/components/atoms/modal";
import { Card } from "../../../../../../../../../shared/components/atoms/card";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { LocalLoader } from "../../../../../../../../../shared/components/atoms/local-loader";
import isEqual from 'lodash/isEqual'
import { FieldQuery } from "../../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import type { QueryFormField } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";
import apolloClient from '../../../../../../../../../../apollo-client'
import { propertiesQuery, productPropertiesQuery, productPropertiesRulesQuery, productPropertyTextTranslationsQuery, propertySelectValuesQuerySimpleSelector } from '../../../../../../../../../shared/api/queries/properties.js'

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
const variations = ref<any[]>([])
const originalVariations = ref<any[]>([])
const loading = ref(true)

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

const selectFields = computed<Record<string, QueryFormField>>(() => {
  const fields: Record<string, QueryFormField> = {}
  properties.value.forEach((p) => {
    if ([PropertyTypes.SELECT, PropertyTypes.MULTISELECT].includes(p.type)) {
      fields[p.id] = {
        type: FieldType.Query,
        name: p.id,
        labelBy: 'value',
        valueBy: 'id',
        query: propertySelectValuesQuerySimpleSelector,
        dataKey: 'propertySelectValues',
        isEdge: true,
        queryVariables: { filter: { property: { id: { exact: p.id } } }, first: 100 },
        multiple: p.type === PropertyTypes.MULTISELECT,
        removable: false,
      }
    }
  })
  return fields
})

const fetchVariationProperties = async (variationId: string) => {
  const { data } = await apolloClient.query({
    query: productPropertiesQuery,
    variables: { filter: { product: { id: { exact: variationId } } }, first: 100 },
    fetchPolicy: 'network-only',
  })
  const edges = data?.productProperties?.edges ?? []
  const propertyValues: Record<string, any> = {}
  await Promise.all(
    edges.map(async ({ node }: any) => {
      let translation = null
      if ([PropertyTypes.TEXT, PropertyTypes.DESCRIPTION].includes(node.property.type)) {
        const { data: tData } = await apolloClient.query({
          query: productPropertyTextTranslationsQuery,
          variables: { filter: { productProperty: { id: { exact: node.id } } } },
          fetchPolicy: 'network-only',
        })
        translation = tData?.productPropertyTextTranslations?.edges?.[0]?.node || null
      }
      propertyValues[node.property.id] = { ...node, translation }
    })
  )
  return propertyValues
}

const fetchVariations = async () => {
  const { data } = await apolloClient.query({
    query: query.value,
    variables: { filter: { parent: { id: { exact: parentId.value } } }, first: 100 },
    fetchPolicy: 'network-only',
  })
  const edges = data?.[queryKey.value]?.edges ?? []
  variations.value = await Promise.all(
    edges.map(async ({ node }: any) => ({
      ...node,
      propertyValues: await fetchVariationProperties(node.variation.id),
    }))
  )
}

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchProperties(), fetchVariations()])
  originalVariations.value = JSON.parse(JSON.stringify(variations.value))
  loading.value = false
})

const hasChanges = computed(() =>
  !isEqual(toRaw(variations.value), originalVariations.value)
)

const save = () => {
  console.log('Save clicked')
}

defineExpose({ save, hasChanges })

const getPropertyType = (id: string) =>
  properties.value.find((p) => p.id === id)?.type

const showTextModal = ref(false)
const showDescriptionModal = ref(false)

const selectedIndex = ref<number | null>(null)
const selectedColKey = ref('')
const modalValue = ref('')

const openTextModal = (index: number, key: string) => {
  selectedIndex.value = index
  selectedColKey.value = key
  modalValue.value =
    variations.value[index].propertyValues[key]?.translation?.valueText || ''
  showTextModal.value = true
}

const openDescriptionModal = (index: number, key: string) => {
  selectedIndex.value = index
  selectedColKey.value = key
  modalValue.value =
    variations.value[index].propertyValues[key]?.translation?.valueDescription || ''
  showDescriptionModal.value = true
}

const cancelModal = () => {
  showTextModal.value = false
  showDescriptionModal.value = false
}

const saveModal = () => {
  if (selectedIndex.value === null) return
  const item = variations.value[selectedIndex.value]
  const key = selectedColKey.value
  if (!item.propertyValues[key]) item.propertyValues[key] = {}
  if (!item.propertyValues[key].translation)
    item.propertyValues[key].translation = {}
  if (showTextModal.value) {
    item.propertyValues[key].translation.valueText = modalValue.value
  } else if (showDescriptionModal.value) {
    item.propertyValues[key].translation.valueDescription = modalValue.value
  }
  cancelModal()
}

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
  <div class="max-w-[1430px] min-w-0 max-h-[80vh] overflow-auto overflow-y-auto border border-gray-200 relative">
    <div
      v-if="loading"
      class="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75"
    >
      <LocalLoader :loading="loading" />
    </div>
    <Button
      class="absolute top-2 right-2 btn btn-primary"
      :disabled="!hasChanges"
      @click="save"
    >
      {{ t('shared.button.save') }}
    </Button>
    <table v-if="variations.length" class="min-w-max">
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
          v-for="(item, index) in variations"
          :key="item.id"
          class="border-t"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-2 py-1 border-r border-gray-200"
            :style="{ width: columnWidths[col.key] + 'px' }"
          >
            <template v-if="col.key === 'name'">
              <span class="block truncate" :title="item.variation.name">
                {{ shortenText(item.variation.name, 32) }}
              </span>
            </template>
            <template v-else-if="col.key === 'sku'">
              <span class="block truncate" :title="item.variation.sku">
                {{ item.variation.sku }}
              </span>
            </template>
            <template v-else-if="col.key === 'active'">
              <Icon
                v-if="item.variation.active"
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
              <FieldQuery
                v-if="getPropertyType(col.key) === PropertyTypes.SELECT"
                :field="selectFields[col.key]"
                :model-value="item.propertyValues[col.key]?.valueSelect?.id"
              />
              <FieldQuery
                v-else-if="getPropertyType(col.key) === PropertyTypes.MULTISELECT"
                :field="selectFields[col.key]"
                :model-value="item.propertyValues[col.key]?.valueMultiSelect?.map((v) => v.id)"
              />
              <TextInput
                v-else-if="getPropertyType(col.key) === PropertyTypes.INT"
                class="w-full"
                :model-value="item.propertyValues[col.key]?.valueInt"
                number
              />
              <TextInput
                v-else-if="getPropertyType(col.key) === PropertyTypes.FLOAT"
                class="w-full"
                :model-value="item.propertyValues[col.key]?.valueFloat"
                float
              />
              <div
                v-else-if="getPropertyType(col.key) === PropertyTypes.TEXT"
                class="relative cursor-pointer"
                @dblclick="openTextModal(index, col.key)"
              >
                <div class="border border-gray-300 p-1 h-8 overflow-hidden">
                  {{
                    shortenText(
                      item.propertyValues[col.key]?.translation?.valueText || '',
                      32
                    )
                  }}
                </div>
                <Icon
                  name="maximize"
                  class="absolute top-1 right-1 text-gray-400 cursor-pointer"
                  @click.stop="openTextModal(index, col.key)"
                />
              </div>
              <div
                v-else-if="getPropertyType(col.key) === PropertyTypes.DESCRIPTION"
                class="relative cursor-pointer"
                @dblclick="openDescriptionModal(index, col.key)"
              >
                <div class="border border-gray-300 p-1 h-16 overflow-hidden">
                  {{
                    shortenText(
                      item.propertyValues[col.key]?.translation?.valueDescription || '',
                      32
                    )
                  }}
                </div>
                <Icon
                  name="maximize"
                  class="absolute top-1 right-1 text-gray-400 cursor-pointer"
                  @click.stop="openDescriptionModal(index, col.key)"
                />
              </div>
              <Toggle
                v-else-if="getPropertyType(col.key) === PropertyTypes.BOOLEAN"
                :model-value="item.propertyValues[col.key]?.valueBoolean || false"
              />
              <div
                v-else-if="getPropertyType(col.key) === PropertyTypes.DATE"
                class="pointer-events-none"
              >
                <DateInput :model-value="item.propertyValues[col.key]?.valueDate" />
              </div>
              <div
                v-else-if="getPropertyType(col.key) === PropertyTypes.DATETIME"
                class="pointer-events-none"
              >
                <DateTimeInput :model-value="item.propertyValues[col.key]?.valueDatetime" />
              </div>
              <input
                v-else
                type="text"
                class="w-full border p-1"
                :value="item.propertyValues[col.key]?.valueInt || ''"
                disabled
              />
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <Modal v-model="showTextModal">
    <Card class="modal-content w-1/2">
      <h3 class="text-xl font-semibold text-center mb-4">
        {{ t('products.products.bulkEditModal.textTitle') }}
      </h3>
      <TextInput class="w-full" v-model="modalValue" />
      <div class="flex justify-end gap-4 mt-4">
        <Button class="btn btn-outline-dark" @click="cancelModal">{{ t('shared.button.cancel') }}</Button>
        <Button class="btn btn-primary" @click="saveModal">{{ t('shared.button.edit') }}</Button>
      </div>
    </Card>
  </Modal>
  <Modal v-model="showDescriptionModal">
    <Card class="modal-content w-2/3">
      <h3 class="text-xl font-semibold text-center mb-4">
        {{ t('products.products.bulkEditModal.descriptionTitle') }}
      </h3>
      <TextEditor class="h-64" v-model="modalValue" />
      <div class="flex justify-end gap-4 mt-4">
        <Button class="btn btn-outline-dark" @click="cancelModal">{{ t('shared.button.cancel') }}</Button>
        <Button class="btn btn-primary" @click="saveModal">{{ t('shared.button.edit') }}</Button>
      </div>
    </Card>
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
