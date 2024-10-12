<script setup lang="ts">

import {computed} from 'vue';
import {Icon} from "../../../../atoms/icon";
import {Label} from '../../../../atoms/label';
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
import {FieldTextarea} from "../form-fields/field-textarea";
import {FieldPhone} from "../form-fields/field-phone";
import {FieldEmail} from "../form-fields/field-email";
import {FieldDateRange} from "../form-fields/field-date-range";
import {FieldImage} from "../form-fields/field-image";
import {FieldWebsite} from "../form-fields/field-website";
import {FieldIndividualFile} from "../form-fields/field-individual-file";

const props = defineProps<{
  config: FormConfig;
  form: Record<string, any>;
  errors?: Record<string, string> | null
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
    case FieldType.Textarea: return FieldTextarea;
    case FieldType.Phone: return FieldPhone;
    case FieldType.Email: return FieldEmail;
    case FieldType.RangeDate: return FieldDateRange;
    case FieldType.Image: return FieldImage;
    case FieldType.Website: return FieldWebsite;
    case FieldType.IndividualFile: return FieldIndividualFile;
    default: return null;
  }
};

const computedStyle = computed(() => props.config.customStyle || '');

</script>

<template>
    <template v-for="field in config.fields" :key="field.name">
      <div v-if="field.type !== FieldType.Hidden" class="col-span-full" :class="computedStyle">
        <Flex>
          <FlexCell center>
            <label class="font-semibold block text-sm leading-6 text-gray-900">{{ field.label }}{{ !field.optional && field.label ? '*' : '' }}</label>
          </FlexCell>
          <FlexCell v-if="field.type === FieldType.Checkbox" class="ml-2" center>
            <component v-model="form[field.name]" :is="getFieldComponent(field.type)" :field="field" />
          </FlexCell>
          <FlexCell center>
            <div v-if="errors && errors[field.name]" class="text-danger text-small blink-animation ml-1 mb-1">
              <Icon size="sm" name="exclamation-circle" />
              <span class="ml-1">{{ errors[field.name] }}</span>
            </div>
          </FlexCell>
        </Flex>
          <div v-if="field.type !== FieldType.Checkbox" class="mt-2" >
            <component v-model="form[field.name]" :is="getFieldComponent(field.type)" :field="field" />
          </div>
          <p v-if="field.help" class="mt-1 text-sm leading-6 text-gray-400">{{ field.help }}</p>
      </div>
    </template>
</template>

<style scoped>

.blink-animation {
  animation: blinker 2s linear infinite;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}

</style>