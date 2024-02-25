<script setup lang="ts">
import { computed } from 'vue';
import { FieldType, FormConfig } from '../../formConfig';

import { FieldBoolean } from '../form-fields/field-boolean';
import { FieldCalendar } from '../form-fields/field-calendar';
import { FieldCheckbox } from '../form-fields/field-checkbox';
import { FieldChoice } from '../form-fields/field-choice';
import { FieldProxyChoice } from '../form-fields/field-proxy-choice';
import { FieldQuery } from '../form-fields/field-query';
import { FieldSlider } from '../form-fields/field-slider';
import { FieldValue } from '../form-fields/field-value';

const props = defineProps<{
  config: FormConfig;
  form: Record<string, any>;
}>();

const getFieldComponent = (type) => {
  switch (type) {
    case FieldType.Boolean: return FieldBoolean;
    case FieldType.Calendar: return FieldCalendar;
    case FieldType.Checkbox: return FieldCheckbox;
    case FieldType.Choice: return FieldChoice;
    case FieldType.ProxyChoice: return FieldProxyChoice;
    case FieldType.Query: return FieldQuery;
    case FieldType.Slider: return FieldSlider;
    case FieldType.Value: return FieldValue;
    default: return null;
  }
};

const gridClass = computed(() => `grid grid-cols-1 ${props.config.cols === 2 ? 'md:grid-cols-2' : ''} gap-3`);
const computedStyle = computed(() => props.config.customStyle || '');
</script>

<template>
  <div :class="computedStyle">
    <div :class="gridClass">
      <component
        v-for="field in config.fields"
        v-model="form[field.name]"
        :model-value="form[field.name]"
        :key="field.name"
        :is="getFieldComponent(field.type)"
        :field="field"
      />
    </div>
  </div>
</template>
