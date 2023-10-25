<script setup lang="ts">
import { Accordion } from '../../../../shared/components/atoms/accordion';
import { Label } from '../../../../shared/components/atoms/label';
import { Thumbnail } from '../../../../shared/components/molecules/thumbnail';
import { Ref, ref } from 'vue';

const props = defineProps({
  data: Object,
});

const isObject = (item) => {
  return typeof item === 'object' && item !== null;
};

const dataRef: Ref<any> = ref(props.data);
const rearrangedData = ref({});
const objectData = ref({});
const nonObjectData = ref({});

for (const key in props.data) {
  if (isObject(props.data[key])) {
    if (Array.isArray(props.data[key]) && props.data[key].length === 0) {
      continue;
    }
    objectData.value[key] = dataRef.value[key];
  } else {
    if (dataRef.value[key]) {
      nonObjectData.value[key] = dataRef.value[key];
    }
  }
}
rearrangedData.value = { ...nonObjectData.value, ...objectData.value };
const onImageClicked = (url) => {
  window.open(url, '_blank');
};

const isArray = (item) => Array.isArray(item);
const isItemString = (item) =>
  typeof item === 'string' && item.endsWith('.png');

const camelToCapitalizedWords = (camelCase) => {
  return camelCase
    .replace(/([A-Z])/g, ' $1') // Insert space before each capital letter
    .toLowerCase() // Change everything to lower case
    .split(' ') // Split by space to get an array of words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' ');
};
</script>

<template>
  <div>
    <div v-for="(value, key) in rearrangedData" :key="key">
      <div v-if="isObject(value)">
        <Accordion>
          <template #panel>
            <Label class="text-gray-500" size="m">{{ camelToCapitalizedWords(key) }}:</Label>
          </template>
          <template #content>
            <RecursiveAccordion :data="value" />
          </template>
        </Accordion>
      </div>
      <div v-else-if="isArray(value)">
        <div v-for="(item, index) in value" :key="`${key}_${index}`">
          <div v-if="isObject(item)">
            <Accordion>
              <template #panel>
                <Label class="text-gray-500" size="m">{{ camelToCapitalizedWords(key) }}:</Label>
              </template>
              <template #content>
                <RecursiveAccordion :data="item" />
              </template>
            </Accordion>
          </div>
          <div v-else>
            <Flex vertical>
              <FlexCell>
                <Label class="text-gray-500" size="m" bold> {{ camelToCapitalizedWords(key) }}: </Label>
                <Label
                  class="text-gray-500"
                  size="m"
                  v-if="key !== 'url' || !isItemString(item)"
                >
                  {{ item }}
                </Label>
                <Thumbnail
                  v-else
                  class="add-image cursor-pointer border-2"
                  width="64"
                  :link="item"
                  @click="() => onImageClicked(item)"
                />
              </FlexCell>
            </Flex>
          </div>
        </div>
      </div>
      <div v-else>
        <Flex vertical>
          <FlexCell>
            <Label class="text-gray-500" size="m" bold> {{ camelToCapitalizedWords(key) }}: </Label>
            <Label
              class="text-gray-500"
              size="m"
              v-if="key !== 'url' || !isItemString(value)"
            >
              {{ value }}
            </Label>
            <Thumbnail
              v-else
              class="cursor-pointer border-2"
              width="64"
              :link="value"
              @click="onImageClicked(value)"
            />
          </FlexCell>
        </Flex>
      </div>
    </div>
  </div>
</template>