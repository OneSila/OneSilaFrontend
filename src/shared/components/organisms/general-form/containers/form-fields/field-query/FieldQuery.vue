<script setup lang="ts">
import { Ref, ref, watch, onMounted, computed } from 'vue';
import { Selector } from '../../../../../atoms/selector';
import { QueryFormField } from '../../../formConfig';
import { Icon } from "../../../../../atoms/icon";
import { Button } from "../../../../../atoms/button";
import { Modal } from "../../../../../atoms/modal";
import apolloClient from "../../../../../../../../apollo-client";
import CreateOnFlyModal from "./containers/CreateOnFlyModal.vue";
import debounce from 'lodash.debounce';
import { DocumentNode } from "graphql";

const props = defineProps<{
  field: QueryFormField;
  modelValue: any;
}>();

const limit = computed(() => props.field.limit ?? 20);
const DEFAULT_MIN_SEARCH_LENGTH = 3;
const minSearchLength = computed(() => props.field.minSearchLength ?? DEFAULT_MIN_SEARCH_LENGTH);

onMounted(() => {
  fetchData(null, true);
});

const emit = defineEmits(['update:modelValue']);
const showCreateOnFlyModal = ref(false);
const loading = ref(true);
const rawDataRef: Ref<any> = ref([]);
const cleanedData: Ref<any[]> = ref([]);
const selectedValue = ref(props.modelValue);
const isLiveUpdate = ref(props.field.isLiveUpdate ?? true);


const dropdownPosition = props.field.dropdownPosition || 'top';
const mandatory = props.field.mandatory !== undefined ? props.field.mandatory : false;
const multiple = props.field.multiple || false;
const filterable = props.field.filterable || false;
const removable = props.field.removable !== undefined ? props.field.removable : true;

watch(() => props.modelValue, (value) => {
  if (value !== selectedValue.value) {
    selectedValue.value = value
    if (value != null && selectedValue.value != null) {
      ensureSelectedValuesArePresent();
    }
  }
}, { deep: true });

watch(() => props.field.queryVariables, () => {
  fetchData();
}, { deep: true });

const updateValue = (value) => {
  selectedValue.value = value;
  emit('update:modelValue', value);

  if (value == null) {
    fetchData();
  }
};

async function ensureSelectedValuesArePresent() {
  if (!props.field.valueBy || !selectedValue.value) return;

  const extractId = (item: any): string | number | undefined => {
    return typeof item === 'object' && item !== null
      ? item[props.field.valueBy!]
      : item;
  };

  const selectedIds: (string | number | undefined)[] = Array.isArray(selectedValue.value)
    ? selectedValue.value.map(extractId).filter(Boolean)
    : [extractId(selectedValue.value)].filter(Boolean);

  const currentIds = cleanedData.value.map(item => item[props.field.valueBy!]);

  const missingIds = selectedIds.filter(id => !currentIds.includes(id));
  if (missingIds.length === 0) return;

  const { data } = await apolloClient.query({
    query: props.field.query as unknown as DocumentNode,
    variables: {
      filter: {
        [props.field.valueBy]: { inList: missingIds }
      }
    },
    fetchPolicy: 'cache-first'
  });

  const newItems = props.field.isEdge
    ? data[props.field.dataKey]?.edges?.map((e: any) => e.node) ?? []
    : data[props.field.dataKey] ?? [];

  cleanedData.value = [...cleanedData.value, ...newItems];
}


async function fetchData(searchValue: string | null | undefined = null, ensureSelected: boolean = false) {
  try {
    loading.value = true;
    // Start with existing query variables without mutating props
    const variables: any = {
      ...props.field.queryVariables,
      filter: {
        ...(props.field.queryVariables?.filter ?? {}),
      },
    };

    // Handle live updates and search values
    if (isLiveUpdate.value) {
      if (searchValue) {
        variables.filter.search = searchValue;
      } else {
        delete variables.filter.search;
      }
    }

    const { data } = await apolloClient.query({
      query: props.field.query as unknown as DocumentNode,
      variables: variables,
      fetchPolicy: 'cache-first'
    });

    processAndCleanData(data[props.field.dataKey]);

    if (ensureSelected) {
      await ensureSelectedValuesArePresent();
    }

    loading.value = false;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function processAndCleanData(rawData: any) {
  let newData = [];

  if (props.field.isEdge && rawData?.edges) {
    newData = rawData.edges.map((edge: any) => edge.node);

    if (!isLiveUpdate.value && rawData.pageInfo && rawData.pageInfo.hasNextPage === true) {
      isLiveUpdate.value = true;
    }
  } else {
    newData = rawData;
  }

  rawDataRef.value = rawData;

  const preservedItems: any[] = [];

  const selectedIds: (string | number)[] = Array.isArray(selectedValue.value)
      ? selectedValue.value
      : selectedValue.value ? [selectedValue.value] : [];

    if (props.field.valueBy && selectedIds.length > 0) {
      const currentIds = new Set<string | number>(
        newData.map(item => item[props.field.valueBy!] as string | number)
      );

      for (const prev of cleanedData.value) {
        const val = prev[props.field.valueBy!] as string | number;
        if (selectedIds.includes(val) && !currentIds.has(val)) {
          preservedItems.push(prev);
        }
      }
    }

  cleanedData.value = [...newData, ...preservedItems];

  if (
    props.field.autocompleteIfOneResult !== false &&
    !props.field.optional &&
    cleanedData.value.length === 1 &&
    (selectedValue.value === undefined || selectedValue.value === null)
  ) {
    if (props.field.multiple) {
      updateValue([cleanedData.value[0][props.field.valueBy]]);
    } else {
      updateValue(cleanedData.value[0][props.field.valueBy]);
    }
  }

  if (props.field.setDefaultKey && (selectedValue.value === undefined || selectedValue.value === null)) {
    const defaultValue = props.field.defaultExpectedValue === undefined ? true : props.field.defaultExpectedValue;
    const defaultEntry = cleanedData.value.find(entry => entry[props.field.setDefaultKey!] === defaultValue);
    if (defaultEntry) {
      updateValue(defaultEntry[props.field.valueBy]);
    }
  }

  if (props.field.default && !selectedValue.value) {
    updateValue(props.field.default);
  }
}


const handleCancel = () => {
  showCreateOnFlyModal.value = false
};

const handleSubmit = (data) => {

  if (!rawDataRef.value) {
    return;
  }

  if (props.field.isEdge) {
    // Create a new array with existing items plus the new item
    // we do that to avoid the object is not extensible error
    rawDataRef.value = {
        ...rawDataRef.value,
        'edges': [...(rawDataRef.value['edges'] || []), { node: data }]
    };
  } else {
    rawDataRef.value.push(data);
  }

  processAndCleanData(rawDataRef.value);

if (props.field.multiple) {
  updateValue([
    ...(selectedValue.value || []),
    data[props.field.valueBy]
  ]);
} else {
  updateValue(data[props.field.valueBy]);
}
  showCreateOnFlyModal.value = false;
};

const handleInput = debounce(async (searchValue: string) => {
  if (!isLiveUpdate.value) {
    return;
  }

  if (searchValue.length >= minSearchLength.value) {
    fetchData(searchValue);
  } else if (!searchValue.length) {
    fetchData();
  }
}, 500);

const showAddEntry = computed(() => !!props.field.createOnFlyConfig);

</script>

<template>
  <div class="field-item">
      <Flex>
        <FlexCell grow>
          <Selector
            :modelValue="selectedValue"
            :options="cleanedData"
            :label-by="field.labelBy"
            :value-by="field.valueBy"
            :placeholder="field.placeholder"
            :dropdown-position="dropdownPosition"
            :mandatory="mandatory"
            :multiple="multiple"
            :filterable="filterable"
            :removable="removable"
            :limit="limit"
            :disabled="field.disabled"
            :show-add-entry="showAddEntry"
            :is-loading="loading"
            @update:model-value="updateValue"
            @searched="handleInput"
            @add-clicked="showCreateOnFlyModal = true"
          />
        </FlexCell>
        <FlexCell v-if="field.createOnFlyConfig">
          <Button :customClass="'ltr:ml-2 rtl:mr-2 btn btn-primary p-2 rounded-full'" @click="showCreateOnFlyModal = true" :disabled="loading">
            <Icon name="plus" />
          </Button>
        </FlexCell>
      </Flex>
    <Modal v-if="field.createOnFlyConfig" v-model="showCreateOnFlyModal" @closed="showCreateOnFlyModal = false">
        <CreateOnFlyModal :field="field" @cancel-clicked="handleCancel" @submit-clicked="handleSubmit" />
    </Modal>
  </div>

</template>
