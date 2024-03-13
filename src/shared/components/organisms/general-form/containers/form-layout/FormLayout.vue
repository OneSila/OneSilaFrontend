<script setup lang="ts">
import {computed} from 'vue';
import {FormConfig} from '../../formConfig';
import {FieldType} from "../../../../../utils/constants";

import {FieldBoolean} from '../form-fields/field-boolean';
import {FieldDate} from '../form-fields/field-date';
import {FieldCheckbox} from '../form-fields/field-checkbox';
import {FieldChoice} from '../form-fields/field-choice';
import {FieldProxyChoice} from '../form-fields/field-proxy-choice';
import {FieldQuery} from '../form-fields/field-query';
import {FieldSlider} from '../form-fields/field-slider';
import {FieldValue} from '../form-fields/field-value';
import {Label} from '../../../../atoms/label';

const props = defineProps<{
  config: FormConfig;
  form: Record<string, any>;
}>();

const getFieldComponent = (type) => {
  switch (type) {
    case FieldType.Boolean: return FieldBoolean;
    case FieldType.Date: return FieldDate;
    case FieldType.Checkbox: return FieldCheckbox;
    case FieldType.Choice: return FieldChoice;
    case FieldType.ProxyChoice: return FieldProxyChoice;
    case FieldType.Query: return FieldQuery;
    case FieldType.Slider: return FieldSlider;
    case FieldType.Text: return FieldValue;
    default: return null;
  }
};

const gridClass = computed(() => `grid grid-cols-1 ${props.config.cols === 2 ? 'md:grid-cols-2' : ''} gap-3`);
const computedStyle = computed(() => props.config.customStyle || '');

</script>

<template>
  <div :class="computedStyle">
    <Flex vertical :class="gridClass">
      <template v-for="field in config.fields" :key="field.name">
        <FlexCell v-if="field.type !== FieldType.Hidden">
          <Label semi-bold>{{ field.label }}{{ !field.optional && field.type !== FieldType.Hidden && field.label ? '*' : '' }}</Label>
        </FlexCell>
        <FlexCell v-if="field.type !== FieldType.Hidden">
          <component
            v-model="form[field.name]"
            :model-value="form[field.name]"
            :is="getFieldComponent(field.type)"
            :field="field"
          />
        </FlexCell>
      </template>
    </Flex>
  </div>
</template>