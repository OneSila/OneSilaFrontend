<script setup lang="ts">
import { ref } from 'vue';

interface Choice {
  name: string;
}

const props = defineProps<{ choices: Choice[], modelValue: string }>();

const emit = defineEmits(['update:modelValue']);
const activeOption = ref(props.modelValue);

const setActive = (optionName) => {
  activeOption.value = optionName;
  emit('update:modelValue', optionName)
};

</script>


<template>
  <div>
    <slot name="content"></slot>
    <div class="option-selector flex flex-col xl:flex-row gap-2 md:gap-4 w-full mt-4 max-h-[40rem]">
    <div
      v-for="choice in choices"
      :key="choice.name"
      class="flex-grow cursor-pointer border border-gray-300 group-hover:border-gray-400 md:border-2 rounded-lg p-4"
      :class="{ 'border-primary': activeOption === choice.name }"
      @click="setActive(choice.name)"
    >
      <slot :name="choice.name"></slot>
    </div>
  </div>
  </div>
</template>