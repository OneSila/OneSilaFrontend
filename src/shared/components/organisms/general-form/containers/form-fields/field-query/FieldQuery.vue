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

onMounted(() => {
  if (props.field.disabled !== true) {
    fetchData();
  }
});

const emit = defineEmits(['update:modelValue']);
const showCreateOnFlyModal = ref(false);
const loading = ref(true);
const rawDataRef: Ref<any> = ref([]);
const cleanedData: Ref<any[]> = ref([]);
const selectedValue = ref(props.modelValue);
const isLiveUpdate = ref(true); // in order to be live updates this always have to be true


const dropdownPosition = props.field.dropdownPosition || 'top';
const mandatory = props.field.mandatory !== undefined ? props.field.mandatory : false;
const multiple = props.field.multiple || false;
const filterable = props.field.filterable || false;
const removable = props.field.removable !== undefined ? props.field.removable : true;
const limit = props.field.limit || undefined;

watch(() => props.modelValue, (value) => {
  if (value !== selectedValue.value) {
    selectedValue.value = value
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

async function fetchData(searchValue: string | null | undefined = null) {
  try {
    loading.value = true;
    // Start with existing query variables or initialize if not set
    const variables = { ...props.field.queryVariables };

    // Initialize filter object if it doesn't exist
    if (isLiveUpdate.value) {
      if (!variables.filter) {
        variables.filter = {};
      }

      // Add or update the search value in the filter object
      if (searchValue !== null && searchValue !== undefined) {
        variables.filter.search = searchValue;
      }
    }

    const { data } = await apolloClient.query({
      query: props.field.query as unknown as DocumentNode,
      variables: variables,
      fetchPolicy: 'network-only'
    });

    processAndCleanData(data[props.field.dataKey]);
    loading.value = false;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function processAndCleanData(rawData: any) {
  let toCleanData = [];
  if (props.field.isEdge && rawData?.edges) {
    toCleanData = rawData.edges.map((edge: any) => edge.node);

    if (!isLiveUpdate.value && rawData.pageInfo && rawData.pageInfo.hasNextPage === true) {
      isLiveUpdate.value = true;
    }

  } else {
    toCleanData = rawData;
  }
  rawDataRef.value = rawData;
  cleanedData.value = toCleanData;

  // Automatically select the single value if the field is mandatory and there is only one option
  if (!props.field.optional && cleanedData.value.length === 1 && (selectedValue.value === undefined || selectedValue.value === null)) {
    updateValue(cleanedData.value[0][props.field.valueBy]);
  }

  // Auto-select based on setDefaultKey and defaultExpectedValue
  if (props.field.setDefaultKey && (selectedValue.value === undefined || selectedValue.value === null)) {
    const defaultValue = props.field.defaultExpectedValue === undefined ? true : props.field.defaultExpectedValue;
    const defaultEntry = cleanedData.value.find(entry => entry[props.field.setDefaultKey!] === defaultValue);
    if (defaultEntry) {
      updateValue(defaultEntry[props.field.valueBy]);
    }
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
    const newData = selectedValue.value;
    newData.push(data[props.field.valueBy]);
    updateValue(newData);

  } else {
    updateValue(data[props.field.valueBy]);
  }
  showCreateOnFlyModal.value = false;
};

const handleInput = debounce(async (searchValue: string) => {
  if (isLiveUpdate.value && (selectedValue.value === null || selectedValue.value === undefined)) {
    fetchData(searchValue);
  }
}, 500);

const showAddEntry = computed(() => !!props.field.createOnFlyConfig);

</script>

<template>
  <div class="field-item">
    <Selector
      v-if="field.disabled"
      :modelValue="selectedValue"
      :options="[]"
      :label-by="field.labelBy"
      :value-by="field.valueBy"
      :placeholder="field.placeholder"
      :dropdown-position="dropdownPosition"
      :mandatory="mandatory"
      :multiple="multiple"
      :filterable="filterable"
      :removable="removable"
      :limit="limit"
      :disabled="true"
      @update:model-value="updateValue"
    />
    <template v-else>
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
    </template>
    <Modal v-if="field.createOnFlyConfig" v-model="showCreateOnFlyModal" @closed="showCreateOnFlyModal = false">
        <CreateOnFlyModal :field="field" @cancel-clicked="handleCancel" @submit-clicked="handleSubmit" />
    </Modal>
  </div>

</template>
