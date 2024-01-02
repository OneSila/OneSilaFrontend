<script setup lang="ts">
import { ref, watch } from "vue"
import debounce from 'lodash.debounce'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router';
import { TextInput } from "../../atoms/text-input"
import { Icon } from "../../atoms/icon"

const props = defineProps({
  modelValue: String,
  placeholder: String,
  disabled: Boolean,
  updateRoute: Boolean,
  routeKey: {
    type: String,
    default: 'search',
  },
  debounce: {
  type: Number,
  default: 600,
}
});

const { t } = useI18n();
const input: any = ref(null)
const router = useRouter();
const route = useRoute();

const updateRoute = debounce((newValue) => {
  if (props.updateRoute) {
    router.push({ query: { ...route.query, [props.routeKey]: newValue } });
  }
}, props.debounce);

watch(() => props.modelValue, (newValue) => {
  updateRoute(newValue);
});

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
      :placeholder="placeholder || t('shared.button.search')"
      :disabled="disabled"
      :model-value="modelValue"
      @focus="$emit('focus')"
      @update:modelValue="(event) => $emit('update:modelValue', event)"
    />
  </label>
</template>

<style scoped>
</style>
