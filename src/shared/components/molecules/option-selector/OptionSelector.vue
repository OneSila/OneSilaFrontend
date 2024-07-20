<script setup lang="ts">
import {computed, ref} from 'vue';

interface Choice {
  name: string;
}

const props = defineProps<{ choices: Choice[], modelValue: string }>();

const emit = defineEmits(['update:modelValue']);
const activeOption = ref(props.modelValue);

const gridColumnsClass = computed(() => {
  return {
    'grid-cols-1': props.choices.length === 1,
    'grid-cols-2': props.choices.length === 2,
    'grid-cols-3': props.choices.length === 3,
    'grid-cols-4': props.choices.length === 4,
    'grid-cols-5': props.choices.length >= 5,
  };
});

const setActive = (optionName) => {
  activeOption.value = optionName;
  emit('update:modelValue', optionName)
};

</script>


<template>
  <div>
    <slot name="content"></slot>
      <div class="option-selector grid gap-4 mt-4" :class="gridColumnsClass">
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

<style scoped>
.option-selector {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 640px) {
  .option-selector {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .option-selector {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .option-selector {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .option-selector {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
</style>