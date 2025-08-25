<script setup lang="ts">
import { reactive, computed, ref, onMounted, watch, toRaw, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { Product } from '../../../../../../configs'
import { bundleVariationsQuery, configurableVariationsQuery } from '../../../../../../../../../shared/api/queries/products.js'
import { ProductType, PropertyTypes, FieldType, ConfigTypes } from '../../../../../../../../../shared/utils/constants'
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
import { FieldQuery } from "../../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import { Selector } from "../../../../../../../../../shared/components/atoms/selector";
import type { QueryFormField } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";
import apolloClient from '../../../../../../../../../../apollo-client'
import { propertiesQuery, productPropertiesQuery, productPropertiesRulesQuery, productPropertyTextTranslationsQuery, propertySelectValuesQuerySimpleSelector } from '../../../../../../../../../shared/api/queries/properties.js'
import { translationLanguagesQuery } from '../../../../../../../../../shared/api/queries/languages.js'
import { bulkCreateProductPropertiesMutation, bulkUpdateProductPropertiesMutation, deleteProductPropertiesMutation } from '../../../../../../../../../shared/api/mutations/properties.js'

interface PropertyInfo {
  id: string
  name: string
  type: string
  requireType: string
}

const props = defineProps<{ product: Product }>()

const { t } = useI18n()

const language = ref<string | null>(null)

const baseColumns = [
  { key: 'name', label: t('shared.labels.name') },
  { key: 'sku', label: t('shared.labels.sku') },
  { key: 'active', label: t('shared.labels.active') },
]

const properties = ref<PropertyInfo[]>([])
const variations = ref<any[]>([])
const originalVariations = ref<any[]>([])
const loading = ref(true)
const selectedCell = ref<{ row: number | null; col: string | null }>({ row: null, col: null })

const columns = computed(() => [
  ...baseColumns,
  ...properties.value.map((p) => ({ key: p.id, label: p.name, requireType: p.requireType })),
])

const getIconColor = (requireType: string) => {
  if (
    [
      ConfigTypes.REQUIRED,
      ConfigTypes.REQUIRED_IN_CONFIGURATOR,
      ConfigTypes.OPTIONAL_IN_CONFIGURATOR,
    ].includes(requireType as ConfigTypes)
  ) {
    return 'text-red-500'
  }
  if (requireType === ConfigTypes.OPTIONAL) {
    return 'text-orange-400'
  }
  return 'text-gray-400'
}

const selectCell = (rowIndex: number, colKey: string) => {
  selectedCell.value = { row: rowIndex, col: colKey }
}

const dragState = reactive({
  active: false,
  startRow: null as number | null,
  endRow: null as number | null,
  col: '' as string,
})

const copyValue = (from: number, to: number, key: string) => {
  const source = variations.value[from]
  const target = variations.value[to]
  if (!target.propertyValues) target.propertyValues = {}
  target.propertyValues[key] = JSON.parse(
    JSON.stringify(source.propertyValues[key] || {})
  )
}

const startDragFill = (row: number, col: string) => {
  if (['name', 'sku', 'active'].includes(col)) return
  dragState.active = true
  dragState.startRow = row
  dragState.endRow = row
  dragState.col = col
  document.addEventListener('mousemove', onDragFill)
  document.addEventListener('mouseup', endDragFill)
}

const onDragFill = (e: MouseEvent) => {
  const cell = (e.target as HTMLElement).closest('td')
  if (!cell) return
  const rowAttr = cell.getAttribute('data-row')
  const colAttr = cell.getAttribute('data-col')
  if (colAttr === dragState.col && rowAttr) {
    dragState.endRow = Number(rowAttr)
  }
}

const endDragFill = () => {
  document.removeEventListener('mousemove', onDragFill)
  document.removeEventListener('mouseup', endDragFill)
  if (
    dragState.active &&
    dragState.startRow !== null &&
    dragState.endRow !== null &&
    dragState.col
  ) {
    const start = dragState.startRow
    const end = dragState.endRow
    const [from, to] = start < end ? [start, end] : [end, start]
    for (let i = from; i <= to; i++) {
      if (i === start) continue
      copyValue(start, i, dragState.col)
    }
  }
  dragState.active = false
  dragState.startRow = dragState.endRow = null
  dragState.col = ''
}

const isInDragRange = (row: number, col: string) => {
  if (
    !dragState.active ||
    dragState.col !== col ||
    dragState.startRow === null ||
    dragState.endRow === null
  )
    return false
  const [from, to] =
    dragState.startRow < dragState.endRow
      ? [dragState.startRow, dragState.endRow]
      : [dragState.endRow, dragState.startRow]
  return row >= from && row <= to
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDragFill)
  document.removeEventListener('mouseup', endDragFill)
})

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
        removable: true,
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
          variables: {
            filter: {
              productProperty: { id: { exact: node.id } },
              language: { exact: language.value },
            },
          },
          fetchPolicy: 'network-only',
        })
        const tNode = tData?.productPropertyTextTranslations?.edges?.[0]?.node
        translation = tNode ? { ...tNode } : { language: language.value }
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

watch(language, async () => {
  await fetchVariations()
  originalVariations.value = JSON.parse(JSON.stringify(variations.value))
  computeChanges()
})

const fetchDefaultLanguage = async () => {
  const { data } = await apolloClient.query({
    query: translationLanguagesQuery,
    fetchPolicy: 'network-only',
  })
  language.value = data?.translationLanguages?.defaultLanguage?.code || null
}

onMounted(async () => {
  loading.value = true
  await fetchDefaultLanguage()
  await Promise.all([fetchProperties(), fetchVariations()])
  originalVariations.value = JSON.parse(JSON.stringify(variations.value))
  computeChanges()
  loading.value = false
})

const toCreate = ref<any[]>([])
const toUpdate = ref<any[]>([])
const toDelete = ref<string[]>([])

const getPropertyType = (id: string) =>
  properties.value.find((p) => p.id === id)?.type

const isPropEmpty = (prop: any, type: string) => {
  if (!prop) return true
  if (prop.valueSelect) return false
  if (prop.valueMultiSelect && prop.valueMultiSelect.length) return false
  if (prop.valueInt !== undefined) return false
  if (prop.valueFloat !== undefined) return false
  if (prop.valueBoolean !== undefined) return false
  if (type === PropertyTypes.TEXT && prop.translation?.valueText) return false
  if (type === PropertyTypes.DESCRIPTION && prop.translation?.valueDescription) return false
  return true
}

const computeChanges = () => {
  toCreate.value = []
  toUpdate.value = []
  toDelete.value = []

  variations.value.forEach((variation, index) => {
    const original = originalVariations.value[index] || {}
    const keys = new Set([
      ...Object.keys(variation.propertyValues || {}),
      ...Object.keys(original.propertyValues || {}),
    ])

    keys.forEach((key) => {
      const type = getPropertyType(key) || ''
      const current = variation.propertyValues[key]
      const orig = (original.propertyValues || {})[key]
      const origExists = !!orig && !!orig.id
      const hasCurrent = !isPropEmpty(current, type)
      const hadValue = !isPropEmpty(orig, type)

      if (!origExists && hasCurrent) {
        const item: any = {
          productProperty: {
            product: { id: variation.variation.id },
            property: { id: key },
          },
        }
        if (current.valueSelect)
          item.productProperty.valueSelect = { id: current.valueSelect.id }
        if (current.valueMultiSelect && current.valueMultiSelect.length)
          item.productProperty.valueMultiSelect = current.valueMultiSelect.map(
            (v: any) => ({ id: v.id })
          )
        if (current.valueInt !== undefined)
          item.productProperty.valueInt = current.valueInt
        if (current.valueFloat !== undefined)
          item.productProperty.valueFloat = current.valueFloat
        if (current.valueBoolean !== undefined)
          item.productProperty.valueBoolean = current.valueBoolean
        if (type === PropertyTypes.TEXT && current.translation?.valueText) {
          item.languageCode = current.translation.language
          item.translatedValue = current.translation.valueText
        }
        if (
          type === PropertyTypes.DESCRIPTION &&
          current.translation?.valueDescription
        ) {
          item.languageCode = current.translation.language
          item.translatedValue = current.translation.valueDescription
        }
        toCreate.value.push(item)
      } else if (origExists && hadValue && !hasCurrent) {
        toDelete.value.push(orig.id)
      } else if (origExists && hasCurrent) {
        const diff: any = { id: orig.id }
        if (current.valueSelect?.id !== orig.valueSelect?.id)
          diff.valueSelect = current.valueSelect
            ? { id: current.valueSelect.id }
            : null
        const curMulti = (current.valueMultiSelect || [])
          .map((v: any) => v.id)
          .sort()
        const origMulti = (orig.valueMultiSelect || [])
          .map((v: any) => v.id)
          .sort()
        if (
          curMulti.length !== origMulti.length ||
          curMulti.some((v: any, i: number) => v !== origMulti[i])
        ) {
          diff.valueMultiSelect = current.valueMultiSelect
            ? current.valueMultiSelect.map((v: any) => ({ id: v.id }))
            : []
        }
        if (current.valueInt !== orig.valueInt)
          diff.valueInt = current.valueInt
        if (current.valueFloat !== orig.valueFloat)
          diff.valueFloat = current.valueFloat
        if ((current.valueBoolean ?? null) !== (orig.valueBoolean ?? null))
          diff.valueBoolean = current.valueBoolean
        if (type === PropertyTypes.TEXT) {
          const curText = current.translation?.valueText || ''
          const origText = orig.translation?.valueText || ''
          if (curText !== origText)
            diff.translation = {
              languageCode:
                current.translation?.language || orig.translation?.language,
              valueText: curText,
            }
        }
        if (type === PropertyTypes.DESCRIPTION) {
          const curDesc = current.translation?.valueDescription || ''
          const origDesc = orig.translation?.valueDescription || ''
          if (curDesc !== origDesc)
            diff.translation = {
              languageCode:
                current.translation?.language || orig.translation?.language,
              valueDescription: curDesc,
            }
        }
        if (Object.keys(diff).length > 1) toUpdate.value.push(diff)
      }
    })
  })
}

watch(variations, computeChanges, { deep: true })

const hasChanges = computed(
  () => toCreate.value.length || toUpdate.value.length || toDelete.value.length
)

const save = async () => {
  if (toCreate.value.length)
    await apolloClient.mutate({
      mutation: bulkCreateProductPropertiesMutation,
      variables: { data: toCreate.value },
    })
  if (toUpdate.value.length)
    await apolloClient.mutate({
      mutation: bulkUpdateProductPropertiesMutation,
      variables: { data: toUpdate.value },
    })
  if (toDelete.value.length)
    await apolloClient.mutate({
      mutation: deleteProductPropertiesMutation,
      variables: { ids: toDelete.value },
    })
  originalVariations.value = JSON.parse(JSON.stringify(variations.value))
  computeChanges()
}

defineExpose({ save, hasChanges })

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
    item.propertyValues[key].translation = { language: language.value }
  if (!item.propertyValues[key].translation.language)
    item.propertyValues[key].translation.language = language.value
  if (showTextModal.value) {
    item.propertyValues[key].translation.valueText = modalValue.value
  } else if (showDescriptionModal.value) {
    item.propertyValues[key].translation.valueDescription = modalValue.value
  }
  cancelModal()
}

const ensureProp = (index: number, key: string) => {
  const item = variations.value[index]
  if (!item.propertyValues[key]) item.propertyValues[key] = {}
  return item.propertyValues[key]
}

const updateSelectValue = (index: number, key: string, value: any) => {
  const prop = ensureProp(index, key)
  prop.valueSelect = value ? { id: value } : null
}

const updateMultiSelectValue = (index: number, key: string, value: any[]) => {
  const prop = ensureProp(index, key)
  prop.valueMultiSelect = value ? value.map((id) => ({ id })) : []
}

const updateNumberValue = (
  index: number,
  key: string,
  field: 'valueInt' | 'valueFloat',
  value: any
) => {
  const prop = ensureProp(index, key)
  prop[field] = value
}

const updateBooleanValue = (index: number, key: string, value: boolean) => {
  const prop = ensureProp(index, key)
  prop.valueBoolean = value
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
  <div class="">
    <div
      v-if="loading"
      class="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75"
    >
      <LocalLoader :loading="loading" />
    </div>
    <Flex between middle gap="2" class="mb-2">
      <FlexCell grow></FlexCell>
      <FlexCell >
        <ApolloQuery :query="translationLanguagesQuery">
          <template v-slot="{ result: { data } }">
            <Selector
              v-if="data"
              v-model="language"
              :options="data.translationLanguages.languages"
              :placeholder="t('products.translation.placeholders.language')"
              class="w-32 mr-2"
              labelBy="name"
              valueBy="code"
              :removable="false"
              mandatory
              filterable
            />
          </template>
        </ApolloQuery>
      </FlexCell>
      <FlexCell>
        <Button class="btn btn-primary" :disabled="!hasChanges" @click="save">
          {{ t('shared.button.save') }}
        </Button>
      </FlexCell>
    </Flex>

    <table v-if="variations.length" class="min-w-max border border-gray-300 border-collapse select-none">
      <thead class="bg-gray-100 sticky top-0">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="text-left px-2 py-1 text-sm font-medium text-gray-700 relative border-r border-gray-200"
            :style="{ width: columnWidths[col.key] + 'px' }"
          >
            <div class="flex items-center h-full">
              <Icon
                v-if="col.requireType"
                name="circle-dot"
                :class="[getIconColor(col.requireType), 'mr-1']"
              />
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
            class="px-4 py-2 py-1 border-r border-gray-200 relative cursor-pointer"
            :class="{ 'bg-blue-100': isInDragRange(index, col.key) }"
            :style="{ width: columnWidths[col.key] + 'px' }"
            :data-row="index"
            :data-col="col.key"
            @click="selectCell(index, col.key)"
          >
            <div
              v-if="selectedCell.row === index && selectedCell.col === col.key"
              class="absolute inset-0 border-2 border-blue-500 pointer-events-none"
            >
              <div
                v-if="!['name','sku','active'].includes(col.key)"
                class="absolute w-2 h-2 bg-blue-500 bottom-0 right-0 pointer-events-auto cursor-row-resize"
                @mousedown.stop="startDragFill(index, col.key)"
              ></div>
            </div>
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
                @update:modelValue="(value) => updateSelectValue(index, col.key, value)"
              />
              <FieldQuery
                v-else-if="getPropertyType(col.key) === PropertyTypes.MULTISELECT"
                :field="selectFields[col.key]"
                :model-value="item.propertyValues[col.key]?.valueMultiSelect?.map((v) => v.id)"
                @update:modelValue="(value) => updateMultiSelectValue(index, col.key, value)"
              />
              <TextInput
                v-else-if="getPropertyType(col.key) === PropertyTypes.INT"
                class="w-full"
                :model-value="item.propertyValues[col.key]?.valueInt"
                number
                @update:modelValue="(value) => updateNumberValue(index, col.key, 'valueInt', value)"
              />
              <TextInput
                v-else-if="getPropertyType(col.key) === PropertyTypes.FLOAT"
                class="w-full"
                :model-value="item.propertyValues[col.key]?.valueFloat"
                float
                @update:modelValue="(value) => updateNumberValue(index, col.key, 'valueFloat', value)"
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
                @update:modelValue="(value) => updateBooleanValue(index, col.key, value)"
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
