<script setup lang="ts">
import {onMounted, Ref, ref, watch} from 'vue';
import { RelatedProduct } from "../../../../core/products/products/product-create/containers/product";
import { Button } from "../../atoms/button";
import { Icon } from "../../atoms/icon";
import { Toggle } from "../../atoms/toggle";
import {useI18n} from "vue-i18n";
import { ProductType, variationTypes } from "../../../utils/constants";
import apolloClient from "../../../../../apollo-client";
import { minimalProductsQuery } from "../../../api/queries/products.js";
import { TextInput } from "../../atoms/input-text";
import debounce from 'lodash.debounce';
import Swal from 'sweetalert2';
import {Pagination} from "../../molecules/pagination";
import {Link} from "../../atoms/link";
import {Image} from "../../atoms/image";
import {getInspectorStatusIconMap} from "../../../../core/products/products/configs";
import {Label} from "../../atoms/label";
import { shortenText } from "../../../utils";

const { t } = useI18n();

const props = defineProps<{
  addedVariations: RelatedProduct[],
  type: string,
  productTypeId?: string | null,
}>();

const availableVariations: Ref<RelatedProduct[]> = ref([]);
const loading = ref(false);
const search = ref('');
const emit = defineEmits(['add', 'remove']);
const draggingItemId = ref(null);
const pageInfo = ref(null);
const limit = ref(10);
const filterSameProductType = ref(true);
const fetchPaginationData = ref({});
fetchPaginationData.value['first'] = limit.value;

function iconColorClass(color?: string) {
  switch (color) {
    case 'green':
      return 'text-green-500';
    case 'yellow':
      return 'text-yellow-500';
    case 'orange':
      return 'text-orange-500';
    case 'red':
      return 'text-red-500';
    default:
      return '';
  }
}

const fetchData = async () => {
  const excludedIds = props.addedVariations.map(product => product.id);
  let typeFilter;

  switch (props.type) {
    case ProductType.Configurable:
    case ProductType.Bundle:
      typeFilter = variationTypes;
      break;
    default:
      typeFilter = variationTypes;
  }

  loading.value = true;

  let filters = {
      NOT: { id: { inList: excludedIds } },
      type: { inList: typeFilter }
  };


  if (search.value.length > 0) {
    filters['search'] = search.value;
  }

  if (filterSameProductType.value && props.productTypeId) {
    filters['valueSelectId'] = props.productTypeId;
  }

  let variables = {
    filter: filters,
    ...fetchPaginationData.value
  };

  const { data } = await apolloClient.query({
    query: minimalProductsQuery,
    variables: variables,
    fetchPolicy: 'network-only'
  });

  if (data && data.products) {
    availableVariations.value = data.products.edges.map(edge => edge.node);
    if (data.products.pageInfo) {
      pageInfo.value = data.products.pageInfo;
    }
  }

  loading.value = false;
};

const handleAddVariation = async (variation: RelatedProduct) => {
  if (hasQty()) {
    const { value: quantity } = await Swal.fire({
      title: t('shared.placeholders.quantity'),
      input: 'text',
      inputValue: '1',
      inputAttributes: {
        autocapitalize: 'off',
        inputmode: 'decimal',
      },
      showCancelButton: true,
      confirmButtonText: t('shared.button.submit'),
      cancelButtonText: t('shared.button.cancel'),
      showLoaderOnConfirm: true,
      preConfirm: (quantity) => {
        const parsedQuantity = parseFloat(quantity);
        if (!quantity || isNaN(parsedQuantity) || parsedQuantity <= 0) {
          Swal.showValidationMessage(t('shared.validations.quantity'));
          return false;
        }
        return quantity;
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (quantity) {
      const newVariation = { ...variation, quantity: parseFloat(quantity) };
      await emit('add', newVariation);
      await fetchData();
    }
  } else {
    await emit('add', variation);
    await fetchData();
  }
};

const handleRemoveVariation = async (variationId: string) => {
  await emit('remove', variationId);
  await fetchData();
}

const hasQty = () => {
  return props.type === ProductType.Bundle;
}

const dragStart = (id) => {
  draggingItemId.value = id;
};

const dragEnd = () => {
  draggingItemId.value = null;
};

const allowDrop = (event) => {
  event.preventDefault();
};

const handleDrop = () => {
  const variation = availableVariations.value.find(v => v.id === draggingItemId.value);
  if (variation) {
    handleAddVariation(variation);
  }
  draggingItemId.value = null;
};

const handleDropAvailable = (event) => {
  event.preventDefault();
  const variation = props.addedVariations.find(v => v.id === draggingItemId.value);
  if (variation) {
    handleRemoveVariation(variation.id);
    draggingItemId.value = null;
  }
};

const handleQueryChanged = (queryData) => {
  const newQuery = queryData.query;
  const beforeValue = typeof newQuery.before === 'string' ? newQuery.before : null;
  const afterValue = typeof newQuery.after === 'string' ? newQuery.after : null;

  if (newQuery.before) {
    setPaginationVariables(null, limit.value, beforeValue, null);
  }
  if (newQuery.after) {
    setPaginationVariables(limit.value, null, null, afterValue);
  }
  if (newQuery.last === 'true') {
    setPaginationVariables(null, limit.value, null, null);
  }
  if (newQuery.first === 'true') {
    setPaginationVariables(limit.value, null, null, null);
  }

};
const setPaginationVariables = (
  firstVal: number | null = null,
  lastVal: number | null = null,
  beforeVal: string | null = null,
  afterVal: string | null = null
) => {
  let fetchNewPaginationData = {}

  if (firstVal) {
    fetchNewPaginationData['first'] = firstVal;
  }

  if (lastVal) {
    fetchNewPaginationData['last'] = lastVal;
  }

  if (beforeVal) {
    fetchNewPaginationData['before'] = beforeVal;
  }

  if (afterVal) {
    fetchNewPaginationData['after'] = afterVal;
  }

  fetchPaginationData.value = fetchNewPaginationData;

  fetchData();
};

const debouncedFetchData = debounce(fetchData, 500);
watch(search, debouncedFetchData);

onMounted(fetchData);

</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

    <div>
      <Flex class="gap-2">
        <FlexCell grow>
          <label class="search-input relative block">
            <span class="absolute inset-y-0 left-0 flex items-center pl-2">
              <Icon class="text-gray-300" name="search" size="lg" />
            </span>

            <TextInput
              ref="input"
              class="search-input pl-9 w-full"
              v-model="search"
              :placeholder="t('shared.button.search')"
              :disabled="loading"
            />
          </label>
        </FlexCell>
        <FlexCell center>
          <Link class="btn-primary p-2.5 rounded-full" :path="{name: 'products.products.create'}" target="_blank">
            <Icon name="plus" />
          </Link>
        </FlexCell>
        <FlexCell center>
          <Button :customClass="'btn btn-primary p-2 rounded-full'" @click="fetchData">
            <Icon name="arrows-rotate" />
          </Button>
        </FlexCell>
      </Flex>
      <Flex v-if="productTypeId" class="mt-2" gap="4">
        <FlexCell>
          <Label class="text-md font-semibold">
            {{ t('products.products.addVariations.sameProductType') }}
          </Label>
        </FlexCell>
        <FlexCell>
          <Toggle v-model="filterSameProductType" @update:model-value="fetchData" />
        </FlexCell>
      </Flex>

      <div v-if="availableVariations.length === 0">
        <p class="text-xl text-center mt-5 font-medium">{{ t('products.products.addVariations.noVariationsLeft') }}</p>
      </div>
      <table v-else class="table-auto w-full mt-2" @dragover.prevent="allowDrop" @drop="handleDropAvailable">
        <thead>
          <tr>
            <th>{{ t('shared.labels.name') }}</th>
            <th>{{ t('shared.labels.active') }}</th>
            <th>{{ t('products.products.labels.inspectorStatus') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="variation in availableVariations"
              :key="variation.id"
              class="cursor-grab"
              draggable="true"
              @dragstart="dragStart(variation.id)"
              @dragend="dragEnd"
          >
            <td>
              <Flex>
                <FlexCell center>
                    <Icon name="plus" size="xl" class="text-primary cursor-pointer mr-3"  @click="handleAddVariation(variation)" :disabled="loading" />
                </FlexCell>
                <FlexCell center>
                  <Flex class="gap-4">
                    <FlexCell center>
                      <div v-if="variation.thumbnailUrl" class="w-8 h-8 overflow-hidden">
                        <Image class="w-8 h-8 rounded-md overflow-hidden object-cover" :source="variation.thumbnailUrl" :alt="variation.name" />
                      </div>
                        <div v-else class="w-8 h-8 overflow-hidden rounded-md bg-gray-200 flex justify-center items-center">
                      </div>
                    </FlexCell>
                    <FlexCell center :title="variation.name">
                      {{ shortenText(variation.name, 64) }}
                    </FlexCell>
                  </Flex>
                </FlexCell>
              </Flex>
            </td>
            <td>
              <Icon v-if="variation.active" name="check-circle" class="ml-2 text-green-500" />
              <Icon v-else name="times-circle" class="ml-2 text-red-500" />
            </td>
            <td>
              <Icon
                :name="getInspectorStatusIconMap(t)[variation.inspectorStatus].name"
                :class="iconColorClass(getInspectorStatusIconMap(t)[variation.inspectorStatus].color)"
                :title="getInspectorStatusIconMap(t)[variation.inspectorStatus].hoverText"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <Pagination v-if="pageInfo" :page-info="pageInfo" :change-query-params="false" @query-changed="handleQueryChanged" />
    </div>
    <div class="p-2 border-dashed border-2 rounded-md min-h-[200px] border-gray-300" @dragover.prevent="allowDrop" @drop="handleDrop">
      <div v-if="addedVariations.length === 0">
        <p class="text-xl text-center mt-5 font-medium">{{ t('products.products.addVariations.dragAndDrop') }}</p>
      </div>
      <table v-else class="table-auto w-full">
        <thead>
          <tr>
          <th>{{ t('shared.labels.name') }}</th>
          <th>{{ t('shared.labels.active') }}</th>
          <th>{{ t('products.products.labels.inspectorStatus') }}</th>
          <th v-if="hasQty()">{{ t('shared.labels.quantity') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in addedVariations"
              :key="item.id"
              class="cursor-grab"
              draggable="true"
              @dragstart="dragStart(item.id)"
              @dragend="dragEnd"
          >
            <td>
              <Flex>
                <FlexCell center>
                    <Icon name="trash" size="xl" class="text-danger cursor-pointer mr-3" @click="handleRemoveVariation(item.id)" :disabled="loading" />
                </FlexCell>
                <FlexCell center>
                  <Flex class="gap-4">
                    <FlexCell center>
                      <div v-if="item.thumbnailUrl" class="w-8 h-8 overflow-hidden">
                        <Image class="w-8 h-8 rounded-md overflow-hidden object-cover" :source="item.thumbnailUrl" :alt="item.name" />
                      </div>
                        <div v-else class="w-8 h-8 overflow-hidden rounded-md bg-gray-200 flex justify-center items-center">
                      </div>
                    </FlexCell>
                    <FlexCell center :title="item.name">
                      {{ shortenText(item.name, 64) }}
                    </FlexCell>
                  </Flex>
                </FlexCell>
              </Flex>
            </td>
            <td>
              <Icon v-if="item.active" name="check-circle" class="ml-2 text-green-500" />
              <Icon v-else name="times-circle" class="ml-2 text-red-500" />
            </td>
            <td>
              <Icon
                :name="getInspectorStatusIconMap(t)[item.inspectorStatus].name"
                :class="iconColorClass(getInspectorStatusIconMap(t)[item.inspectorStatus].color)"
                :title="getInspectorStatusIconMap(t)[item.inspectorStatus].hoverText"
              />
            </td>
            <td v-if="hasQty()">{{ item.quantity }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>