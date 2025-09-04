<script setup lang="ts">

import { computed, ref } from 'vue';
import { ApolloSubscription } from '../../molecules/apollo-subscription';
import { ShowConfig, getFieldComponent } from './showConfig';
import {useRouter} from "vue-router";
import { Buttons } from "./containers/buttons";
import {Icon} from "../../atoms/icon";
import {Label} from "../../atoms/label";
import {FieldArray} from "./containers/field-array";
import {FieldType} from "../../../utils/constants";
import ShowSkeleton from "./ShowSkeleton.vue";

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
      <ShowSkeleton v-if="loading" />
      <template v-else-if="result && updateData(result)">
        <div :class="computedStyle">
          <div class="overflow-hidden" :class="gridClass">
            <div v-if="config.title || config.description" class="px-4 py-6 sm:px-6">
              <h3 class="text-xl font-semibold leading-7 text-gray-900">{{ config.title }}</h3>
              <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">{{ config.description }}</p>
            </div>
            <div class="border-t border-gray-100">
              <template v-for="field in config.fields" :key="field.name">
                <div v-if="!(field.type === FieldType.Array && (result[config.subscriptionKey][field.name] as any[]).length === 0)"
                     class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt>
                      <Icon v-if="field.icon" :name="field.icon" />
                      <label v-if="field.label">{{ field.label }}</label>
                  </dt>
                  <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    <component :is="getFieldComponent(field.type)" :field="field" :model-value="result[config.subscriptionKey][field.name]" />
                  </dd>
              </div>
              </template>

            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8"
          v-if="config.addEdit || config.addDelete || config.addBack || config.addCustomButtons">
            <Buttons :config="config" />
            <slot name="buttons"></slot>
        </div>
      </template>
    </template>
  </ApolloSubscription>

</template>