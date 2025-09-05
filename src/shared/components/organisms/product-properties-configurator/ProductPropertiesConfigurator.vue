<script setup lang="ts">
import {ref, computed, onMounted, watch, defineProps, defineEmits, Ref, watchEffect} from 'vue';
import {useI18n} from 'vue-i18n';
import {Button} from '../../atoms/button';
import {Icon} from '../../atoms/icon';
import {TextInput} from '../../atoms/input-text';
import {Pagination} from '../../molecules/pagination';
import debounce from 'lodash.debounce';
import apolloClient from '../../../../../apollo-client';
import {getPropertySelectValueQuery, propertiesQuery} from '../../../api/queries/properties.js';
import {AddPropertyModal} from "./containers/add-property-modal";
import {Badge} from "../../atoms/badge";
import {getPropertyTypeBadgeMap} from "../../../../core/properties/properties/configs";
import {ConfigTypes, PropertyTypes} from "../../../utils/constants";
import {ProductTypeField} from "./containers/product-type-field";
import {Selector} from "../../atoms/selector";
import {PreviewView} from "./containers/preview-view";
import {Accordion} from "../../atoms/accordion";
import {Label} from "../../atoms/label";
import {useRouter} from "vue-router";
import {Toggle} from "../../atoms/toggle";

const {t} = useI18n();
const router = useRouter();

export interface Property {
  id: string;
  name: string;
  type: string;
  configType?: string | null;
  sortOrder: number;
}

const props = defineProps<{
  productType: { id: string, value: string } | null,
  requireEanCode: boolean,
  addedProperties: Property[]
}>();

const emit = defineEmits(['update:addedProperties', 'update:productType', 'update:requireEanCode']);
const toAddProperty: Ref<Property | null> = ref(null);
const availableProperties: Ref<Property[]> = ref([]);
const addedPropertiesRef: Ref<Property[]> = ref(props.addedProperties);
const localProductType: Ref<{ id: string, value: string } | null> = ref(props.productType);
const configTypes: Ref<string[]> = ref(props.addedProperties.map(property => property.configType ?? ''));

const loading = ref(false);
const showPropertyModal = ref(false);
const search = ref('');
const pageInfo = ref(null);
const draggingItemId = ref(null);
const draggingOverItemId = ref(null);
const limit = ref(10);
const fetchPaginationData = ref({});
const rawRequireEanCode = ref(props.requireEanCode);

fetchPaginationData.value['first'] = limit.value;

const fetchData = async () => {

  const excludedIds = addedPropertiesRef.value.map(property => property.id);

  loading.value = true;
  let filters = {
    NOT: {id: {inList: excludedIds}},
    isProductType: {exact: false},
  };

  if (search.value.length > 0) {
    filters['search'] = search.value;
  }

  let variables = {
    filter: filters,
    ...fetchPaginationData.value
  };

  const {data} = await apolloClient.query({
    query: propertiesQuery,
    variables: variables,
    fetchPolicy: 'cache-first'
  });

  if (data && data.properties) {
    availableProperties.value = data.properties.edges.map(edge => edge.node);
    if (data.properties.pageInfo) {
      pageInfo.value = data.properties.pageInfo;
    }
  }

  loading.value = false;
};

const dragStart = (id) => {
  draggingItemId.value = id;
};

const dragEnd = () => {
  if (draggingOverItemId.value !== null) {
    const draggedIndex = addedPropertiesRef.value.findIndex(p => p.id === draggingItemId.value);
    const overIndex = addedPropertiesRef.value.findIndex(p => p.id === draggingOverItemId.value);

    if (draggedIndex !== -1 && overIndex !== -1) {
      const newOrder = [...addedPropertiesRef.value];
      const [movedProperty] = newOrder.splice(draggedIndex, 1);

      newOrder.splice(overIndex, 0, movedProperty);
      newOrder.forEach((p, i) => p.sortOrder = i + 1);
      addedPropertiesRef.value = newOrder;
      emit('update:addedProperties', addedPropertiesRef.value);
    }
  }
  draggingItemId.value = null;
  draggingOverItemId.value = null;
};

const dragOver = (id) => {
  if (draggingItemId.value !== id) {
    draggingOverItemId.value = id;
  }
};


const allowDrop = (event) => {
  event.preventDefault();
};

const handleDrop = (event) => {
  event.preventDefault();
  const property = availableProperties.value.find(p => p.id === draggingItemId.value);
  if (property) {
    handleAddProperty(property);
  }
};

const handleAddProperty = async (property) => {
  showPropertyModal.value = true
  toAddProperty.value = property
};

const handlePropertyAdded = async (configType) => {

  if (toAddProperty.value !== null) {
    const toAdd: Property = {
      id: toAddProperty.value.id,
      name: toAddProperty.value.name,
      type: toAddProperty.value.type,
      configType: configType,
      sortOrder: addedPropertiesRef.value.length,
    }

    addedPropertiesRef.value.push(toAdd);
    showPropertyModal.value = false
    toAddProperty.value = null
    configTypes.value.push(configType)
    emit('update:addedProperties', addedPropertiesRef.value);
    fetchData();
  }

};


const handleRemoveProperty = async (propertyId) => {
  const propertyToRemove = addedPropertiesRef.value.find(p => p.id === propertyId);
  if (propertyToRemove) {

    addedPropertiesRef.value = addedPropertiesRef.value.filter(p => p.id !== propertyId);
    emit('update:addedProperties', addedPropertiesRef.value);

    if (propertyToRemove?.configType != null) {
      const index = configTypes.value.indexOf(propertyToRemove?.configType);
      configTypes.value.splice(index, 1);
    }

    await fetchData();
  }
};


const handleSortOrderChange = (propertyId, direction) => {
  const index = addedPropertiesRef.value.findIndex(p => p.id === propertyId);
  if (index !== -1) {
    const newOrder = [...addedPropertiesRef.value];
    const [movedProperty] = newOrder.splice(index, 1);

    if (direction === 'up' && index > 0) {
      newOrder.splice(index - 1, 0, movedProperty);
    } else if (direction === 'down') {
      // Adjusting the condition to ensure proper placement at the end
      newOrder.splice(index + 1, 0, movedProperty);
    }

    // Update sortOrder values
    newOrder.forEach((p, i) => p.sortOrder = i + 1);

    addedPropertiesRef.value = newOrder;
    emit('update:addedProperties', addedPropertiesRef.value);
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

const handleDropAvailable = () => {
  const propertyToRemove = addedPropertiesRef.value.find(p => p.id === draggingItemId.value);
  if (propertyToRemove) {
    handleRemoveProperty(draggingItemId.value);
  }
};
const debouncedFetchData = debounce(fetchData, 500);
watch(search, debouncedFetchData);

const configTypeChoices = [
  {id: ConfigTypes.REQUIRED_IN_CONFIGURATOR, text: t('properties.rule.configTypes.requiredInConfigurator.title')},
  {id: ConfigTypes.OPTIONAL_IN_CONFIGURATOR, text: t('properties.rule.configTypes.optionalInConfigurator.title')},
  {id: ConfigTypes.REQUIRED, text: t('properties.rule.configTypes.required.title')},
  {id: ConfigTypes.OPTIONAL, text: t('properties.rule.configTypes.optional.title')}
]

const handleProductTypeUpdated = async (newVal) => {

  if (newVal === null) {
    localProductType.value = null;
  } else {
    const {data} = await apolloClient.query({
      query: getPropertySelectValueQuery,
      variables: {id: newVal},
      fetchPolicy: 'cache-first'
    })

    if (data && data.propertySelectValue) {
      localProductType.value = {
        id: data.propertySelectValue.id,
        value: data.propertySelectValue.value
      }
    }
  }

  emit('update:productType', newVal)
}

const onConfigTypeUpdated = () => {
  configTypes.value = []
  configTypes.value = addedPropertiesRef.value.map(property => property.configType ?? '')
  emit('update:addedProperties', addedPropertiesRef.value);
}

const accordionItems = [
  {name: 'preview', label: t('properties.rule.preview.previewTitle'), icon: 'eye'}
];

const openInNewTab = (event) => {
  event.preventDefault();
  event.stopPropagation();
  const url = router.resolve({name: 'properties.properties.create'}).href;
  window.open(url, '_blank');
}

onMounted(fetchData);

</script>

<template>
  <div>
    <div class="pb-4">
      <ProductTypeField :product-type="productType" @product-type-updated="handleProductTypeUpdated"/>
      <FlexCell center>
        <Flex>
          <FlexCell center>
            <span class="mr-2 font-semibold">{{ t('properties.properties.labels.requireEanCode') }}</span>
          </FlexCell>
          <FlexCell center>
            <Toggle v-model="rawRequireEanCode" @update:model-value="emit('update:requireEanCode', rawRequireEanCode)"/>
          </FlexCell>
        </Flex>
      </FlexCell>
    </div>
    <hr>
    <Flex class="gap-2 mt-4">
      <FlexCell grow>
        <label class="search-input relative block">
            <span class="absolute inset-y-0 left-0 flex items-center pl-2">
              <Icon class="text-gray-300" name="search" size="lg"/>
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
        <Button class="btn-primary p-2.5 rounded-full" @click="openInNewTab">
          <Icon name="plus"/>
        </Button>
      </FlexCell>
      <FlexCell center>
        <Button :customClass="'btn btn-primary p-2.5 rounded-full'" @click="fetchData">
          <Icon name="arrows-rotate"/>
        </Button>
      </FlexCell>
    </Flex>

    <div class="my-4 grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-4">
      <div>
        <div class="p-2 border-dashed border-2 rounded-md min-h-[200px] border-gray-300" @dragover.prevent="allowDrop"
             @drop="handleDropAvailable">
          <div v-if="availableProperties.length === 0">
            <p class="text-xl text-center mt-5 font-medium">{{ t('properties.rule.error.noPropertiesLeft') }}</p>
          </div>
          <table v-else class="table-auto w-full mt-2">
            <thead>
            <tr>
              <th>{{ t('shared.labels.name') }}</th>
              <th>{{ t('properties.rule.labels.propertyType') }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="property in availableProperties"
                :key="property.id"
                class="cursor-grab"
                draggable="true"
                @dragstart="dragStart(property.id)"
                @dragend="dragEnd">
              <td>
                <Flex>
                  <FlexCell center>
                    <Icon name="plus" size="xl" class="text-primary cursor-pointer mr-3"
                          @click="handleAddProperty(property)" :disabled="loading"/>
                  </FlexCell>
                  <FlexCell center>
                    <Flex class="gap-4">
                      <FlexCell center>{{ property.name }}</FlexCell>
                    </Flex>
                  </FlexCell>
                </Flex>
              </td>
              <td>
                <Badge :color="getPropertyTypeBadgeMap(t)[property.type].color"
                       :text="getPropertyTypeBadgeMap(t)[property.type].text"/>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <Pagination v-if="pageInfo" class="mt-2" :page-info="pageInfo" :change-query-params="false"
                    @query-changed="handleQueryChanged"/>
      </div>

      <div class="p-2 border-dashed border-2 rounded-md min-h-[200px] border-gray-300 mb-12"
           @dragover.prevent="allowDrop" @drop="handleDrop">
        <div v-if="addedPropertiesRef.length === 0">
          <p class="text-xl text-center mt-5 font-medium">{{ t('properties.rule.error.dragAndDrop') }}</p>
        </div>
        <table v-else class="table-auto w-full">
          <thead>
          <tr>
            <th>{{ t('shared.labels.name') }}</th>
            <th>{{ t('properties.rule.labels.propertyType') }}</th>
            <th>{{ t('properties.rule.labels.type') }}</th>
            <th>{{ t('shared.labels.actions') }}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in addedPropertiesRef"
              :key="item.id"
              class="cursor-grab"
              draggable="true"
              @dragstart="dragStart(item.id)"
              @dragover.prevent="dragOver(item.id)"
              @dragend="dragEnd"
          >
            <td>
              <Flex>
                <FlexCell center>
                  <Icon name="trash" size="xl" class="text-danger cursor-pointer mr-3"
                        @click="handleRemoveProperty(item.id)"/>
                </FlexCell>
                <FlexCell>
                  {{ item.name }}
                </FlexCell>
              </Flex>
            </td>
            <td>
              <Badge :color="getPropertyTypeBadgeMap(t)[item.type].color"
                     :text="getPropertyTypeBadgeMap(t)[item.type].text"/>
            </td>
            <td class="w-60">
              <Selector class="w-full"
                        v-model="item.configType"
                        :options="configTypeChoices"
                        value-by="id"
                        label-by="text"
                        :removable="false"
                        @update:model-value="onConfigTypeUpdated"/>
            </td>
            <td>
              <Flex>
                <FlexCell center>
                  <Icon v-if="index !== 0" name="arrow-up" size="xl" class="text-primary cursor-pointer mr-3"
                        @click="handleSortOrderChange(item.id, 'up')"/>
                  <Icon v-if="index != addedPropertiesRef.length - 1" name="arrow-down" size="xl"
                        class="text-primary cursor-pointer mr-3" @click="handleSortOrderChange(item.id, 'down')"/>
                </FlexCell>
              </Flex>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <AddPropertyModal v-model="showPropertyModal" :property="toAddProperty"
                      :allow-optional="configTypes.includes(ConfigTypes.REQUIRED_IN_CONFIGURATOR)"
                      @property-added="handlePropertyAdded"/>
    <Accordion class="my-4" :items="accordionItems">
      <template #preview>
        <PreviewView :added-properties="addedPropertiesRef" :product-type="localProductType"/>
      </template>
    </Accordion>
  </div>
</template>

<style scoped>

@media (max-width: 640px) {
  table.table-auto th, td {
    padding-left: 2px;
    padding-right: 2px;
  }
}

</style>