<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { Product } from '../../../../../../configs'
import { bundleVariationsQuery, configurableVariationsQuery } from '../../../../../../../../../shared/api/queries/products.js'
import { ProductType, PropertyTypes, FieldType, ConfigTypes } from '../../../../../../../../../shared/utils/constants'
import { PropertyFilters } from '../../../../../../../../../shared/components/molecules/property-filters'
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
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { FieldQuery } from "../../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import { Selector } from "../../../../../../../../../shared/components/atoms/selector";
import type { QueryFormField } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";
import { Pagination } from "../../../../../../../../../shared/components/molecules/pagination";
import MatrixEditor from "../../../../../../../../../shared/components/organisms/matrix-editor/MatrixEditor.vue";
import type { MatrixColumn, MatrixEditorExpose } from "../../../../../../../../../shared/components/organisms/matrix-editor/types";
import apolloClient from '../../../../../../../../../../apollo-client'
import { propertiesQuerySelector, productPropertiesQuery, productPropertiesRulesQuery, productPropertyTextTranslationsQuery, propertySelectValuesQuerySimpleSelector } from '../../../../../../../../../shared/api/queries/properties.js'
import { translationLanguagesQuery } from '../../../../../../../../../shared/api/queries/languages.js'
import { bulkCreateProductPropertiesMutation, bulkUpdateProductPropertiesMutation, deleteProductPropertiesMutation } from '../../../../../../../../../shared/api/mutations/properties.js'
import { Toast } from "../../../../../../../../../shared/modules/toast";
import { format } from 'date-fns'
import {selectValueOnTheFlyConfig} from "../../../../../../../../properties/property-select-values/configs";

interface PropertyInfo {
  id: string
  name: string
  type: string
  requireType: string
}

const props = defineProps<{ product: Product }>()

const { t } = useI18n()

const language = ref<string | null>(null)

const searchQuery = ref('')
const filters = ref<Record<string, boolean>>({
  [ConfigTypes.REQUIRED]: true,
  [ConfigTypes.OPTIONAL]: true,
})
const selectedPropertyTypes = ref<string[]>([])

const baseColumns = computed<MatrixColumn[]>(() => [
  { key: 'sku', label: t('shared.labels.sku'), sticky: true, editable: false },
  { key: 'name', label: t('shared.labels.name'), editable: false },
  { key: 'active', label: t('shared.labels.active'), editable: false, initialWidth: 60 },
])

const properties = ref<PropertyInfo[]>([])
const variations = ref<any[]>([])
const originalVariations = ref<any[]>([])
const loading = ref(true)
const skipHistory = ref(false)
const matrixRef = ref<MatrixEditorExpose | null>(null)
const readOnlyColumns = new Set(['sku', 'name', 'active'])

const copySkuToClipboard = async (sku: string) => {
  try {
    await navigator.clipboard.writeText(sku)
    Toast.success(t('shared.alert.toast.clipboardSuccess'))
  } catch (error) {
    Toast.error(t('shared.alert.toast.clipboardFail'))
  }
}

const pageInfo = ref<any | null>(null)
const limit = ref(20)
const perPageOptions = [
  { name: '10', value: 10 },
  { name: '20', value: 20 },
  { name: '50', value: 50 },
  { name: '100', value: 100 },
]
const fetchPaginationData = ref<Record<string, any>>({})
fetchPaginationData.value['first'] = limit.value

const filteredProperties = computed(() => {
  return properties.value.filter((p) => {
    const type = [
      ConfigTypes.REQUIRED,
      ConfigTypes.REQUIRED_IN_CONFIGURATOR,
      ConfigTypes.OPTIONAL_IN_CONFIGURATOR,
    ].includes(p.requireType as ConfigTypes)
      ? ConfigTypes.REQUIRED
      : ConfigTypes.OPTIONAL
    if (!filters.value[type]) return false
    if (selectedPropertyTypes.value.length && !selectedPropertyTypes.value.includes(p.type)) return false
    if (!searchQuery.value) return true
    return p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
})

const columns = computed<MatrixColumn[]>(() => [
  ...baseColumns.value,
  ...filteredProperties.value.map((p) => ({
    key: p.id,
    label: p.name,
    requireType: p.requireType,
    editable: true,
    iconColorClass: getIconColor(p.requireType),
    valueType: p.type,
  })),
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
const getPropertyType = (id: string) =>
  properties.value.find((property) => property.id === id)?.type

const isEditableColumn = (key: string) => !readOnlyColumns.has(key)

const getMatrixCellValue = (rowIndex: number, key: string) => {
  if (!isEditableColumn(key)) return null
  const row = variations.value[rowIndex]
  if (!row) return null
  const value = row.propertyValues?.[key]
  return value ? JSON.parse(JSON.stringify(value)) : null
}

const setMatrixCellValue = (rowIndex: number, key: string, value: any) => {
  if (!isEditableColumn(key)) return
  const row = variations.value[rowIndex]
  if (!row) return
  if (!value) {
    if (row.propertyValues) delete row.propertyValues[key]
    return
  }
  if (!row.propertyValues) row.propertyValues = {}
  row.propertyValues[key] = JSON.parse(JSON.stringify(value))
}

const cloneMatrixCellValue = (from: number, to: number, key: string) => {
  if (!isEditableColumn(key)) return
  const source = variations.value[from]
  const target = variations.value[to]
  if (!source || !target) return
  if (!target.propertyValues) target.propertyValues = {}
  const type = getPropertyType(key)
  const value = source.propertyValues?.[key]
  if (!type || !value || isPropEmpty(value, type)) {
    if (target.propertyValues) delete target.propertyValues[key]
    return
  }
  target.propertyValues[key] = JSON.parse(JSON.stringify(value))
}

const clearMatrixCellValue = (rowIndex: number, key: string) => {
  if (!isEditableColumn(key)) return
  const row = variations.value[rowIndex]
  if (!row || !row.propertyValues) return
  delete row.propertyValues[key]
}

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
    query: propertiesQuerySelector,
    variables: { filter: { isProductType: { exact: true } } },
    fetchPolicy: 'cache-first',
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
    fetchPolicy: 'cache-first',
  })
  if (!valueData?.productProperties?.edges?.length) return
  const productTypeValueId = valueData.productProperties.edges[0].node.valueSelect?.id
  if (!productTypeValueId) return

  const { data: ruleData } = await apolloClient.query({
    query: productPropertiesRulesQuery,
    variables: { filter: { productType: { id: { exact: productTypeValueId } } } },
    fetchPolicy: 'cache-first',
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
        autocompleteIfOneResult: false,
        createOnFlyConfig: selectValueOnTheFlyConfig(t, p.id)
      }
    }
  })
  return fields
})

const fetchVariationProperties = async (variationId: string) => {
  const { data } = await apolloClient.query({
    query: productPropertiesQuery,
    variables: { filter: { product: { id: { exact: variationId } } }, first: 100 },
    fetchPolicy: 'cache-first',
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
    variables: {
      filter: { parent: { id: { exact: parentId.value } } },
      ...fetchPaginationData.value,
    },
    fetchPolicy: 'cache-first',
  })
  const edges = data?.[queryKey.value]?.edges ?? []
  pageInfo.value = data?.[queryKey.value]?.pageInfo ?? null
  variations.value = await Promise.all(
    edges.map(async ({ node }: any) => ({
      ...node,
      propertyValues: await fetchVariationProperties(node.variation.id),
    }))
  )
}

watch(language, async () => {
  skipHistory.value = true
  await fetchVariations()
  originalVariations.value = JSON.parse(JSON.stringify(variations.value))
  computeChanges()
  matrixRef.value?.resetHistory(variations.value)
  skipHistory.value = false
})

const fetchDefaultLanguage = async () => {
    const { data } = await apolloClient.query({
      query: translationLanguagesQuery,
      fetchPolicy: 'cache-first',
    })
  language.value = data?.translationLanguages?.defaultLanguage?.code || null
}

onMounted(async () => {
  loading.value = true
  await fetchDefaultLanguage()
  skipHistory.value = true
  await Promise.all([fetchProperties(), fetchVariations()])
  originalVariations.value = JSON.parse(JSON.stringify(variations.value))
  computeChanges()
  matrixRef.value?.resetHistory(variations.value)
  skipHistory.value = false
  loading.value = false
})

const toCreate = ref<any[]>([])
const toUpdate = ref<any[]>([])
const toDelete = ref<object[]>([])

const isPropEmpty = (prop: any, type: string) => {
  if (!prop) return true
  if (prop.valueSelect) return false
  if (prop.valueMultiSelect && prop.valueMultiSelect.length) return false
  if (prop.valueInt !== undefined) return false
  if (prop.valueFloat !== undefined) return false
  if (prop.valueBoolean !== undefined) return false
  if (prop.valueDate != null) return false
  if (prop.valueDatetime != null) return false
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
      const current = variation.propertyValues?.[key]
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
        if (current.valueDate != null)
          item.productProperty.valueDate = format(
            new Date(current.valueDate),
            'yyyy-MM-dd'
          )
        if (current.valueDatetime != null)
          item.productProperty.valueDatetime = new Date(
            current.valueDatetime
          ).toISOString()
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
        toDelete.value.push({id: orig.id})
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
        const curDate = current.valueDate
          ? format(new Date(current.valueDate), 'yyyy-MM-dd')
          : null
        const origDate = orig.valueDate || null
        if (curDate !== origDate) diff.valueDate = curDate
        const curDatetime = current.valueDatetime
          ? new Date(current.valueDatetime).toISOString()
          : null
        const origDatetime = orig.valueDatetime || null
        if (curDatetime !== origDatetime) diff.valueDatetime = curDatetime
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

watch(
  variations,
  () => {
    if (skipHistory.value) return
    computeChanges()
  },
  { deep: true }
)

const setPaginationVariables = async (
  firstVal: number | null = null,
  lastVal: number | null = null,
  beforeVal: string | null = null,
  afterVal: string | null = null
) => {
  const fetchNewPaginationData: Record<string, any> = {}
  if (firstVal) fetchNewPaginationData['first'] = firstVal
  if (lastVal) fetchNewPaginationData['last'] = lastVal
  if (beforeVal) fetchNewPaginationData['before'] = beforeVal
  if (afterVal) fetchNewPaginationData['after'] = afterVal
  fetchPaginationData.value = fetchNewPaginationData
  skipHistory.value = true
  await fetchVariations()
  originalVariations.value = JSON.parse(JSON.stringify(variations.value))
  computeChanges()
  matrixRef.value?.resetHistory(variations.value)
  skipHistory.value = false
}

const handleQueryChanged = async (queryData) => {
  const newQuery = queryData.query
  const beforeValue = typeof newQuery.before === 'string' ? newQuery.before : null
  const afterValue = typeof newQuery.after === 'string' ? newQuery.after : null
  if (newQuery.before) {
    await setPaginationVariables(null, limit.value, beforeValue, null)
  }
  if (newQuery.after) {
    await setPaginationVariables(limit.value, null, null, afterValue)
  }
  if (newQuery.last === 'true') {
    await setPaginationVariables(null, limit.value, null, null)
  }
  if (newQuery.first === 'true') {
    await setPaginationVariables(limit.value, null, null, null)
  }
}

const updateLimitPerPage = async (value: number) => {
  limit.value = value
  await setPaginationVariables(limit.value, null, null, null)
}

const hasChanges = computed(
  () =>
    Boolean(toCreate.value.length || toUpdate.value.length || toDelete.value.length)
)

const hasUnsavedChanges = hasChanges

const save = async () => {
  skipHistory.value = true
  const createdCount = toCreate.value.length
  const updatedCount = toUpdate.value.length
  const deletedCount = toDelete.value.length
  if (createdCount) {
    const { data } = await apolloClient.mutate({
      mutation: bulkCreateProductPropertiesMutation,
      variables: { data: toCreate.value },
    })
    const created = data?.bulkCreateProductProperties || []
    created.forEach((pp: any) => {
      const variation = variations.value.find(
        (v: any) => v.variation.id === pp.product.id
      )
      if (!variation) return
      if (!variation.propertyValues) variation.propertyValues = {}
      if (!variation.propertyValues[pp.property.id])
        variation.propertyValues[pp.property.id] = {}
      variation.propertyValues[pp.property.id].id = pp.id
    })
  }
  if (updatedCount)
    await apolloClient.mutate({
      mutation: bulkUpdateProductPropertiesMutation,
      variables: { data: toUpdate.value },
    })
  if (deletedCount)
    await apolloClient.mutate({
      mutation: deleteProductPropertiesMutation,
      variables: { data: toDelete.value },
    })
  originalVariations.value = JSON.parse(JSON.stringify(variations.value))
  computeChanges()
  matrixRef.value?.resetHistory(variations.value)
  await nextTick()
  skipHistory.value = false
  const messages: any[] = []

  if (createdCount) {
    messages.push(
      t('products.products.alert.toast.createdProductProperties', {
        count: createdCount,
      })
    )
  }
  if (updatedCount) {
    messages.push(
      t('products.products.alert.toast.updatedProductProperties', {
        count: updatedCount,
      })
    )
  }
  if (deletedCount) {
    messages.push(
      t('products.products.alert.toast.deletedProductProperties', {
        count: deletedCount,
      })
    )
  }

  if (messages.length) {
    Toast.success(messages.join('<br>'))
  }
}

defineExpose({ save, hasUnsavedChanges })

const showTextModal = ref(false)
const showDescriptionModal = ref(false)

const selectedIndex = ref<number | null>(null)
const selectedColKey = ref('')
const modalValue = ref('')

const resetModalState = () => {
  selectedIndex.value = null
  selectedColKey.value = ''
  modalValue.value = ''
}

const openTextModal = (index: number, key: string) => {
  selectedIndex.value = index
  selectedColKey.value = key
  const propertyValue = variations.value[index]?.propertyValues?.[key]
  modalValue.value = propertyValue?.translation?.valueText ?? ''
  showTextModal.value = true
}

const openDescriptionModal = (index: number, key: string) => {
  selectedIndex.value = index
  selectedColKey.value = key
  const propertyValue = variations.value[index]?.propertyValues?.[key]
  modalValue.value = propertyValue?.translation?.valueDescription ?? ''
  showDescriptionModal.value = true
}

const cancelModal = () => {
  showTextModal.value = false
  showDescriptionModal.value = false
  resetModalState()
}

watch(
  showTextModal,
  (value, previousValue) => {
    if (!value && previousValue) {
      resetModalState()
    }
  }
)

watch(
  showDescriptionModal,
  (value, previousValue) => {
    if (!value && previousValue) {
      resetModalState()
    }
  }
)

const saveModal = () => {
  if (selectedIndex.value === null) return
  const item = variations.value[selectedIndex.value]
  const key = selectedColKey.value
  if (!item.propertyValues) item.propertyValues = {}
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
  if (!item.propertyValues) item.propertyValues = {}
  if (!item.propertyValues[key]) item.propertyValues[key] = {}
  return item.propertyValues[key]
}

const updateSelectValue = (index: number, key: string, value: any) => {
  const item = variations.value[index]
  if (!value) {
    if (item.propertyValues?.[key]) delete item.propertyValues[key]
    return
  }
  const prop = ensureProp(index, key)
  prop.valueSelect = { id: value }
}

const updateMultiSelectValue = (index: number, key: string, value: any[]) => {
  const item = variations.value[index]
  if (!value || !value.length) {
    if (item.propertyValues?.[key]) delete item.propertyValues[key]
    return
  }
  const prop = ensureProp(index, key)
  prop.valueMultiSelect = value.map((id) => ({ id }))
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

const updateBooleanValue = (
  index: number,
  key: string,
  value: boolean | null
) => {
  const prop = ensureProp(index, key)
  prop.valueBoolean = value
}

const updateDateValue = (index: number, key: string, value: any) => {
  const item = variations.value[index]
  if (!value) {
    if (item.propertyValues?.[key]) delete item.propertyValues[key]
    return
  }
  const prop = ensureProp(index, key)
  prop.valueDate = value
}

const updateDateTimeValue = (index: number, key: string, value: any) => {
  const item = variations.value[index]
  if (!value) {
    if (item.propertyValues?.[key]) delete item.propertyValues[key]
    return
  }
  const prop = ensureProp(index, key)
  prop.valueDatetime = value
}

</script>

<template>
  <div class="relative w-full min-w-0 variations-bulk-edit">
    <MatrixEditor
      ref="matrixRef"
      v-model:rows="variations"
      :columns="columns"
      :loading="loading"
      :has-changes="hasChanges"
      row-key="id"
      :get-cell-value="getMatrixCellValue"
      :set-cell-value="setMatrixCellValue"
      :clone-cell-value="cloneMatrixCellValue"
      :clear-cell-value="clearMatrixCellValue"
      @save="save"
    >
      <template #filters>
        <PropertyFilters
          v-model:search-query="searchQuery"
          v-model:selected-property-types="selectedPropertyTypes"
          v-model:filters="filters"
        />
      </template>
      <template #toolbar-right>
        <ApolloQuery :query="translationLanguagesQuery" fetch-policy="cache-and-network">
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
      </template>
      <template #cell="{ row, column, rowIndex }">
        <template v-if="column.key === 'name'">
          <Link
            :path="{ name: 'products.products.show', params: { id: row.variation.id }, query: { tab: 'properties' } }"
            target="_blank"
          >
            <span class="block truncate" :title="row.variation.name">
              {{ shortenText(row.variation.name, 32) }}
            </span>
          </Link>
        </template>
        <template v-else-if="column.key === 'sku'">
          <div class="flex items-center gap-1">
            <span class="block truncate" :title="row.variation.sku">
              {{ row.variation.sku }}
            </span>
            <Button class="p-0" @click="copySkuToClipboard(row.variation.sku)">
              <Icon name="clipboard" class="h-4 w-4 text-gray-500" aria-hidden="true" />
            </Button>
          </div>
        </template>
        <template v-else-if="column.key === 'active'">
          <Icon
            v-if="row.variation.active"
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
            v-if="getPropertyType(column.key) === PropertyTypes.SELECT"
            :field="selectFields[column.key]"
            :model-value="row.propertyValues[column.key]?.valueSelect?.id"
            @update:modelValue="(value) => updateSelectValue(rowIndex, column.key, value)"
          />
          <FieldQuery
            v-else-if="getPropertyType(column.key) === PropertyTypes.MULTISELECT"
            :field="selectFields[column.key]"
            :model-value="row.propertyValues[column.key]?.valueMultiSelect?.map((v) => v.id)"
            @update:modelValue="(value) => updateMultiSelectValue(rowIndex, column.key, value)"
          />
          <TextInput
            v-else-if="getPropertyType(column.key) === PropertyTypes.INT"
            class="w-full"
            :model-value="row.propertyValues[column.key]?.valueInt"
            number
            @update:modelValue="(value) => updateNumberValue(rowIndex, column.key, 'valueInt', value)"
          />
          <TextInput
            v-else-if="getPropertyType(column.key) === PropertyTypes.FLOAT"
            class="w-full"
            :model-value="row.propertyValues[column.key]?.valueFloat"
            float
            @update:modelValue="(value) => updateNumberValue(rowIndex, column.key, 'valueFloat', value)"
          />
          <div
            v-else-if="getPropertyType(column.key) === PropertyTypes.TEXT"
            class="relative cursor-pointer"
            @dblclick="openTextModal(rowIndex, column.key)"
          >
            <div class="border border-gray-300 p-1 h-8 flex items-center justify-between">
              <div class="overflow-hidden text-ellipsis whitespace-nowrap pr-6">
                {{
                  shortenText(
                    row.propertyValues[column.key]?.translation?.valueText || '',
                    16
                  )
                }}
              </div>
              <Icon
                name="maximize"
                class="text-gray-400 cursor-pointer flex-shrink-0"
                @click.stop="openTextModal(rowIndex, column.key)"
              />
            </div>
          </div>

          <div
            v-else-if="getPropertyType(column.key) === PropertyTypes.DESCRIPTION"
            class="relative cursor-pointer"
            @dblclick="openDescriptionModal(rowIndex, column.key)"
          >
            <div class="border border-gray-300 p-1 h-16 flex justify-between">
              <div class="overflow-hidden break-words">
                {{
                  shortenText(
                    row.propertyValues[column.key]?.translation?.valueDescription || '',
                    32
                  )
                }}
              </div>
              <Icon
                name="maximize"
                class="text-gray-400 cursor-pointer flex-shrink-0 ml-1"
                @click.stop="openDescriptionModal(rowIndex, column.key)"
              />
            </div>
          </div>

          <Toggle
            v-else-if="getPropertyType(column.key) === PropertyTypes.BOOLEAN"
            :model-value="row.propertyValues[column.key]?.valueBoolean ?? null"
            @update:modelValue="(value) => updateBooleanValue(rowIndex, column.key, value)"
          />
          <DateInput
            v-else-if="getPropertyType(column.key) === PropertyTypes.DATE"
            :model-value="row.propertyValues[column.key]?.valueDate ?? null"
            @update:modelValue="(value) => updateDateValue(rowIndex, column.key, value)"
          />
          <DateTimeInput
            v-else-if="getPropertyType(column.key) === PropertyTypes.DATETIME"
            :model-value="row.propertyValues[column.key]?.valueDatetime ?? null"
            @update:modelValue="(value) => updateDateTimeValue(rowIndex, column.key, value)"
          />
          <input
            v-else
            type="text"
            class="w-full border p-1"
            :value="row.propertyValues[column.key]?.valueInt || ''"
            disabled
          />
        </template>
      </template>
    </MatrixEditor>
    <div class="py-2 px-2 flex items-center space-x-2">
      <Pagination
        v-if="pageInfo"
        :page-info="pageInfo"
        :change-query-params="false"
        @query-changed="handleQueryChanged"
      />
      <div v-if="pageInfo && (pageInfo.hasNextPage || pageInfo.hasPreviousPage)">
        <Selector
          :options="perPageOptions"
          :model-value="limit"
          :clearable="false"
          dropdown-position="bottom"
          value-by="value"
          label-by="name"
          :placeholder="t('pagination.perPage')"
          @update:model-value="updateLimitPerPage"
        />
      </div>
    </div>
    <Modal v-model="showTextModal" @closed="cancelModal">
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
    <Modal v-model="showDescriptionModal" @closed="cancelModal">
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
  </div>
</template>

<style>
.variations-bulk-edit .dp__menu,
.variations-bulk-edit .dp__outer_menu_wrap {
  z-index: 50 !important;
}
</style>
