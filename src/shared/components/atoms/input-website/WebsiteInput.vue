<script setup lang="ts">
import { ref, Ref, onMounted } from 'vue';
import { Label } from "../label";
import { Icon } from "../icon";

const props = defineProps<{
  placeholder?: string;
  label?: string;
  icon?: string;
  modelValue?: string;
  disabled?: boolean;
  focused?: boolean;
  required?: boolean;
}>();

const emit = defineEmits({
  'update:modelValue': (value: string) => true,
  'focus': () => true,
  'blur': () => true,
});

const input = ref<HTMLInputElement | null>(null);
const error: Ref<boolean> = ref(false);

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

defineExpose({ focus });

const validateWebsite = (website: string) => {
  return !/^(https?:\/\/)[\w\-]+(\.[\w\-]+)+[/#?]?.*$/.test(website);
};

const handleInput = (event: Event) => {
  let value = (event.target as HTMLInputElement).value.trim();

  if (value === '') {
    error.value = false;
    emit('update:modelValue', '');
    return;
  }

  // Remove multiple https:// if pasted wrongly
  value = value.replace(/^(https?:\/\/)+/, 'https://');

  // Add https:// if missing
  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    value = 'https://' + value;
  }

  error.value = validateWebsite(value);
  emit('update:modelValue', value);
};
</script>

<template>
  <div>
    <Label v-if="label" class="font-semibold text-md">{{ label }}</Label>

    <div
      v-if="icon"
      class="relative border rounded-md mt-2"
      :class="{
        'm-input-wrapper maz-border-success': !error && modelValue,
        'm-input-wrapper maz-border-danger': error && modelValue,
        'border border-gray-300': !modelValue
      }"
    >
      <input
        ref="input"
        type="text"
        class="w-full text-input focus:outline-none block rounded-md px-3 py-2 text-sm placeholder:italic ps-10"
        :class="{ 'cursor-not-allowed': disabled }"
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

    <div
      v-else
      class="border"
      :class="{
        'm-input-wrapper maz-border-success rounded-md': !error && modelValue,
        'm-input-wrapper maz-border-danger rounded-md': error && modelValue,
        'border border-gray-300': !modelValue
      }"
    >
      <input
        ref="input"
        type="text"
        class="w-full text-input focus:outline-none block rounded-md px-3 py-2 text-sm placeholder:italic"
        :class="{ 'cursor-not-allowed': disabled }"
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
