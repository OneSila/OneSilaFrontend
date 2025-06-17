<script setup lang="ts">

import { computed } from 'vue';
import { FormConfig } from '../../formConfig';
import { FieldType } from "../../../../../utils/constants";
import { getFieldComponent } from "../../../general-form/formConfig";

const props = defineProps<{
  config: FormConfig;
  form: Record<string, any>;
  errors?: Record<string, string> | null
}>();


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