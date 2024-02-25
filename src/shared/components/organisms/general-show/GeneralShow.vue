<script setup lang="ts">
import { computed } from 'vue';
import { ApolloSubscription } from '../../molecules/apollo-subscription';
import { ShowConfig } from './showConfig';
import { FieldType } from '../general-listing/listingConfig'
import {useRouter} from "vue-router";
import { FieldText } from "./containers/field-text";
import { FieldImage } from "./containers/field-image";
import { FieldNestedText } from "./containers/field-nested-text";
import { FieldArray } from "./containers/field-array";
import { FieldBoolean } from "./containers/field-boolean";
import { Buttons } from "./containers/buttons";

const router = useRouter();
const props = defineProps<{ config: ShowConfig;}>();

const gridClass = computed(() => `grid grid-cols-1 ${props.config.cols === 2 ? 'md:grid-cols-2' : ''} gap-4`);
const computedStyle = computed(() => props.config.customStyle || '');

const getFieldComponent = (type) => {
  switch (type) {
    case FieldType.Text: return FieldText;
    case FieldType.Image: return FieldImage;
    case FieldType.NestedText: return FieldNestedText;
    case FieldType.Array: return FieldArray;
    case FieldType.Boolean: return FieldBoolean;
    default: return null;
  }
};

</script>


<template>
      <ApolloSubscription :subscription="config.subscription" :variables="config.subscriptionVariables">
    <template v-slot:default="{ loading, error, result }">
      <template v-if="!loading && result">
        <div :class="computedStyle" class="mb-2">
          <div :class="gridClass">
            <div v-for="field in config.fields" :key="field.name" :class="field.customCssClass" :style="field.customCss">
              <component
                :is="getFieldComponent(field.type)"
                :field="field"
                :model-value="result[config.subscriptionKey][field.name]"
              />

            </div>
          </div>
        </div>
        <Buttons :config="config" />
      </template>
      <p v-if="error">{{ error.message }}</p>
    </template>
  </ApolloSubscription>

</template>