<script setup lang="ts">
import { ref, watch } from "vue"
import debounce from 'lodash.debounce'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router';
import { TextInput } from "../../atoms/input-text"
import { Icon } from "../../atoms/icon"

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    disabled?: boolean;
    updateRoute?: boolean;
    routeKey?: string;
    debounce?: number;
  }>(),
  { routeKey: 'search', debounce: 600 },
);

const { t } = useI18n();
const input: any = ref(null)
const router = useRouter();
const route = useRoute();
const inputValue = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {

  if (newValue === null) {
    newValue = '';
  }

  inputValue.value = newValue;
  updateRoute(newValue);
});

const updateRoute = debounce((newValue) => {
  if (props.updateRoute) {
    const updatedQuery = { ...route.query };

    if (newValue !== '') {
      updatedQuery[props.routeKey] = newValue;
    } else {
      delete updatedQuery[props.routeKey];
    }

    router.push({ query: updatedQuery });
  }
}, props.debounce);

const focus = () => {
  input.value?.focus();
};

defineExpose({ focus });
</script>

<template>
  <label class="search-input relative block">
    <span class="absolute inset-y-0 left-0 flex items-center pl-2">
      <Icon class="text-gray-300" name="search" size="lg" />
    </span>

    <TextInput
      ref="input"
      class="search-input pl-9 w-full"
      v-model="inputValue"
      :placeholder="placeholder || t('shared.button.search')"
      :disabled="disabled"
      @focus="$emit('focus')"
      @update:modelValue="(event) => $emit('update:modelValue', event)"
    />
  </label>
</template>
