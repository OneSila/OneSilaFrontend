<script setup lang="ts">
import {defineProps, Ref, ref, watch} from 'vue';
import { Selector } from '../../../../../atoms/selector';
import { QueryFormField } from '../../../formConfig';
import {Icon} from "../../../../../atoms/icon";
import {Button} from "../../../../../atoms/button";
import {Modal} from "../../../../../atoms/modal";
import CreateOnFlyModal from "./containers/CreateOnFlyModal.vue";

const props = defineProps<{
  field: QueryFormField;
  modelValue: any;
}>();
const emit = defineEmits(['update:modelValue']);
const showCreateOnFlyModal = ref(false);
const rawDataRef: Ref<any> = ref();
const cleanedData: Ref<any[]> = ref([]);

const selectedValue = ref(props.modelValue);

watch(() => props.modelValue, (value) => {
  if (value !== selectedValue.value) {
    selectedValue.value = value
  }
}, { deep: true });

const updateValue = (value) => {
  selectedValue.value = value;
  emit('update:modelValue', value);
};

const dropdownPosition = props.field.dropdownPosition || 'top';
const mandatory = props.field.mandatory !== undefined ? props.field.mandatory : false;
const multiple = props.field.multiple || false;
const filterable = props.field.filterable || false;
const removable = props.field.removable !== undefined ? props.field.removable : true;
const limit = props.field.limit || undefined;

const cleanData = (rawData) => {
  rawDataRef.value = rawData;

  if (props.field.isEdge && rawDataRef.value?.edges) {
    cleanedData.value = rawDataRef.value.edges.map(edge => edge.node)
  } else {
    cleanedData.value = rawDataRef.value;
  }

  return true;
};

const handleCancel = () => {
  showCreateOnFlyModal.value = false
};

const handleSubmit = (data) => {

  if (!rawDataRef.value) {
    return;
  }

  if (props.field.isEdge) {
    rawDataRef.value['edges'].push({node: data});
  } else {
    rawDataRef.value.push(data);
  }

  cleanData(rawDataRef.value);

  if (props.field.multiple) {
    const newData = selectedValue.value;
    newData.push(data[props.field.valueBy]);
    updateValue(newData);

  } else {
    updateValue(data[props.field.valueBy]);
  }
  showCreateOnFlyModal.value = false;
};

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
    <ApolloQuery v-else :query="field.query" :variables="field.queryVariables">
      <template v-slot="{ result: { data, loading } }">
        <Flex v-if="data && data[field.dataKey]">
          <FlexCell v-if="cleanData(data[field.dataKey])" grow>
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
              @update:model-value="updateValue"
            />
          </FlexCell>
          <FlexCell v-if="field.createOnFlyConfig">
            <Button :customClass="'ltr:ml-2 rtl:mr-2 btn btn-primary p-2 rounded-full'" @click="showCreateOnFlyModal = true">
              <Icon name="plus" />
            </Button>
          </FlexCell>
        </Flex>
        <Flex v-else>
        <FlexCell grow>
          <Selector
              class="h-9"
              :modelValue="null"
              :options="[]"
              :label-by="field.labelBy"
              :value-by="field.valueBy"
              :removable="false"
              :is-loading="true"
              disabled />
          </FlexCell>
          <FlexCell v-if="field.createOnFlyConfig">
            <Button :customClass="'ltr:ml-2 rtl:mr-2 btn btn-primary p-2 rounded-full'" disabled>
              <Icon name="plus" />
            </Button>
          </FlexCell>
        </Flex>
        <Modal v-if="field.createOnFlyConfig" v-model="showCreateOnFlyModal" @closed="showCreateOnFlyModal = false">
            <CreateOnFlyModal :field="field" @cancel-clicked="handleCancel" @submit-clicked="handleSubmit" />
        </Modal>
      </template>
    </ApolloQuery>
  </div>
</template>
