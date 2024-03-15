<script setup lang="ts">

import { computed, ref } from 'vue';
import { ApolloSubscription } from '../../molecules/apollo-subscription';
import { ShowConfig, getFieldComponent } from './showConfig';
import {useRouter} from "vue-router";
import { Buttons } from "./containers/buttons";

const router = useRouter();
const props = defineProps<{ config: ShowConfig;}>();
const emit = defineEmits(['dataFetched']);
const data = ref(null);

const gridClass = computed(() => `grid grid-cols-1 ${props.config.cols === 2 ? 'md:grid-cols-2' : ''} gap-4`);
const computedStyle = computed(() => props.config.customStyle || '');

const updateData = (newData) => {

  if (data.value === null) {
    data.value = newData;
    emit('dataFetched', data.value)
  }

  return true
}

</script>


<template>
  <ApolloSubscription :subscription="config.subscription" :variables="config.subscriptionVariables">
    <template v-slot:default="{ loading, error, result }">
      <template v-if="!loading && result && updateData(result)">
        <div :class="computedStyle" class="mb-2">
          <div :class="gridClass">
            <div v-for="field in config.fields" :key="field.name" :class="field.customCssClass" :style="field.customCss">
              <component :is="getFieldComponent(field.type)" :field="field" :model-value="result[config.subscriptionKey][field.name]" />
            </div>
          </div>
        </div>
        <Buttons :config="config" />
      </template>
    </template>
  </ApolloSubscription>

</template>