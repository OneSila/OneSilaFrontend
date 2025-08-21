<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Product } from '../../../../../../configs'
import { bundleVariationsQuery, configurableVariationsQuery } from '../../../../../../../../../shared/api/queries/products.js'
import { ProductType } from '../../../../../../../../../shared/utils/constants'
import {Icon} from "../../../../../../../../../shared/components/atoms/icon";
import { shortenText } from "../../../../../../../../../shared/utils";

const props = defineProps<{ product: Product }>()

const { t } = useI18n()

const mockProperties = [
  { key: 'prop1', label: 'Property 1' },
  { key: 'prop2', label: 'Property 2' },
  { key: 'prop3', label: 'Property 3' },
  { key: 'prop4', label: 'Property 4' },
  { key: 'prop5', label: 'Property 5' },
]

const baseColumns = [
  { key: 'name', label: t('shared.labels.name') },
  { key: 'sku', label: t('shared.labels.sku') },
  { key: 'active', label: t('shared.labels.active') },
]

const columns = [...baseColumns, ...mockProperties]

const columnWidths = reactive<Record<string, number>>({})
columns.forEach((col) => (columnWidths[col.key] = 150))

const isAlias = computed(() => props.product.type === ProductType.Alias)
const parentId = computed(() => (isAlias.value ? props.product.aliasParentProduct.id : props.product.id))
const parentType = computed(() => (isAlias.value ? props.product.aliasParentProduct.type : props.product.type))
const query = computed(() =>
  parentType.value === ProductType.Bundle ? bundleVariationsQuery : configurableVariationsQuery
)
const queryKey = computed(() =>
  parentType.value === ProductType.Bundle ? 'bundleVariations' : 'configurableVariations'
)

const startResize = (e: MouseEvent, key: string) => {
  const startX = e.pageX
  const startWidth = columnWidths[key]

  const onMouseMove = (event: MouseEvent) => {
    const delta = event.pageX - startX
    columnWidths[key] = Math.max(50, startWidth + delta)
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
  <div class="overflow-auto max-h-96 border border-gray-200">
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
                class="text-left px-2 py-1 text-sm font-medium text-gray-700 relative"
                :style="{ width: columnWidths[col.key] + 'px' }"
              >
                <div class="flex items-center h-full">
                  <span>{{ col.label }}</span>
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
                class="px-2 py-1"
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
                  <input type="text" class="w-full border p-1" />
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </ApolloQuery>
  </div>
</template>

<style scoped>
.resizer {
  position: absolute;
  right: 0;
  top: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
}
</style>
