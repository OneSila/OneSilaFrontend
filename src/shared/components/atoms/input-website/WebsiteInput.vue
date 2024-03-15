<script setup lang="ts">

import { ref, Ref, onMounted } from 'vue';
import {Label} from "../label";
import {Icon} from "../icon";

const props = defineProps<{
  placeholder?: string;
  label?: string;
  icon?: string;
  modelValue?: any;
  disabled?: boolean;
  focused?: boolean;
  required?: boolean;
}>();


const emit = defineEmits({
  'update:modelValue': (value: any) => true,
  'focus': () => true,
  'blur': () => true
});

const focus = () => {
  input.value?.focus();
};

const blur = () => {
  input.value?.blur();
};

onMounted(() => {
  if (props.focused) {
    focus();
  }
});

defineExpose({
  focus,
});

const validateEmail = (website) => {
  return !/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(website);
}

const handleInput = (event) => {
  let value = event.target.value;

  error.value = validateEmail(value)
  emit('update:modelValue', value);
};

const input: any = ref(null);
const error: Ref<boolean> = ref(validateEmail(props.modelValue));

</script>

<template>
  <div>
    <Label v-if="label" class="mb-2">{{ label }}</Label>

    <div v-if="icon" class="relative border rounded-md" :class="{
          'm-input-wrapper maz-border-success': !error && modelValue !== '' &&  modelValue !== null,
          'm-input-wrapper maz-border-danger': error && modelValue !== '' &&  modelValue !== null,
          'border border-gray-300': !(error && modelValue !== '' && modelValue !== null) && !(modelValue !== '' && modelValue !== null)
        }">
        <input
            ref="website"
            for="website"
            type="text"
            class="w-full text-input focus:outline-none block rounded-md px-3 py-2 text-sm placeholder:italic ps-10"
            :class="{'cursor-not-allowed': disabled}"
            :value="modelValue"
            :placeholder="placeholder"
            :disabled="disabled"
            :required="required"
            @input="handleInput"
            @focus="$emit('focus')"
            @keyup.enter="blur"
        />
      <span class="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
        <Icon :name="icon" />
      </span>
    </div>
    <div v-else class="border" :class="{
          'm-input-wrapper maz-border-success rounded-md': !error && modelValue !== '' &&  modelValue !== null,
          'm-input-wrapper maz-border-danger rounded-md': error && modelValue !== '' &&  modelValue !== null,
          'border border-gray-300': !(error && modelValue !== '' && modelValue !== null) && !(modelValue !== '' && modelValue !== null)
        }"
    >
      <input
          ref="website"
          for="website"
          type="website"
          class="w-full text-input focus:outline-none block rounded-md px-3 py-2 text-sm placeholder:italic"
          :class="{'cursor-not-allowed': disabled}"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :required="required"
          @input="handleInput"
          @focus="$emit('focus')"
          @keyup.enter="blur"
      />
    </div>
  </div>

</template>
