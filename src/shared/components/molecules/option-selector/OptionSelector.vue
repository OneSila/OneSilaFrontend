<script setup lang="ts">
import {computed, ref} from 'vue';

interface Choice {
  name: string;
  banner?: string;
  disabled?: boolean
  hideDisabledBanner?: boolean;
}

const props = defineProps<{ choices: Choice[], modelValue: string; row?: boolean }>();

const emit = defineEmits(['update:modelValue']);
const activeOption = ref(props.modelValue);

const gridColumnsClass = computed(() => {
  if (props.row) {
    return 'grid-cols-1';
  }

  return {
    'sm:grid-cols-1': props.choices.length === 1,
    'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2': props.choices.length === 2,
    'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3': props.choices.length === 3,
    'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4': props.choices.length === 4,
    'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5': props.choices.length >= 5,
  };
})

const setActive = (choice, event?: MouseEvent) => {
  if (choice.disabled) return;

  // Ignore clicks on interactive elements like buttons or links
  const tag = (event?.target as HTMLElement)?.tagName;
  if (tag === 'BUTTON' || tag === 'A') return;

  activeOption.value = choice.name;
  emit('update:modelValue', choice.name);
};


</script>

<template>
  <div>
    <slot name="content"></slot>
    <div class="grid gap-4 mt-4" :class="gridColumnsClass">
      <div
        v-for="choice in props.choices"
        :key="choice.name"
        class="relative flex-grow border border-gray-300 group-hover:border-gray-400 md:border-2 rounded-lg p-4"
        :class="{
          'border-primary': activeOption === choice.name,
          'opacity-60 cursor-not-allowed': choice.disabled,
          'cursor-pointer': !choice.disabled
        }"
        @click="setActive(choice)"
      >
        <slot :name="choice.name"></slot>
        <!-- If the choice is disabled, overlay a ribbon -->
        <template v-if="choice.disabled && !choice.hideDisabledBanner">
          <div class="ribbon-danger-container">
            <div class="ribbon-danger-wrapper">
              <div class="ribbon-danger-cs">{{ $t('shared.labels.comingSoon') }}</div>
            </div>
          </div>
        </template>
        <template v-else>
          <template v-if="choice.banner">
            <div class="ribbon-container">
              <div class="ribbon-wrapper">
                <div class="ribbon-cs">{{ $t('shared.labels.beta') }}</div>
              </div>
            </div>
          </template>
       </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ribbon-container {
  position: absolute;
  top: 0;
  right: 0;
}
.ribbon-wrapper {
  width: 85px;
  height: 88px;
  overflow: hidden;
  position: absolute;
  top: -3px;
  right: -3px;
}
.ribbon-cs {
  font: 1em Sans-Serif;
  color: #fff;
  text-align: center;
  transform: rotate(45deg);
  position: relative;
  padding: 7px 0;
  left: -5px;
  top: 15px;
  width: 120px;
  background-color: #4361EE;
}
.ribbon-cs:before,
.ribbon-cs:after {
  content: "";
  border-top: #4361EE;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  position: absolute;
  bottom: -3px;
}
.ribbon-cs:before {
  left: 0;
}
.ribbon-cs:after {
  right: 0;
}

.ribbon-danger-container {
  position: absolute;
  top: 0;
  right: 0;
}
.ribbon-danger-wrapper {
  width: 85px;
  height: 88px;
  overflow: hidden;
  position: absolute;
  top: -3px;
  right: -3px;
}
.ribbon-danger-cs {
  font: 1em Sans-Serif;
  color: #fff;
  text-align: center;
  transform: rotate(45deg);
  position: relative;
  padding: 7px 0;
  left: -5px;
  top: 15px;
  width: 120px;
  background-color: #DC3545;
}
.ribbon-danger-cs:before,
.ribbon-danger-cs:after {
  content: "";
  border-top: #DC3545;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  position: absolute;
  bottom: -3px;
}
.ribbon-danger-cs:before {
  left: 0;
}
.ribbon-danger-cs:after {
  right: 0;
}

</style>