<script setup lang="ts">
import { ref, watch } from "vue";
import debounce from "lodash.debounce";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { Icon } from "../../atoms/icon";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    disabled?: boolean;
    updateRoute?: boolean;
    routeKey?: string;
    debounce?: number;
  }>(),
  { routeKey: "search", debounce: 600 }
);

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const input = ref<HTMLInputElement | null>(null);
const inputValue = ref(props.modelValue || "");

watch(() => props.modelValue, (newValue) => {
  if (newValue === null) {
    newValue = "";
  }
  inputValue.value = newValue;
  updateRoute(newValue);
});

const updateRoute = debounce((newValue: string) => {
  if (props.updateRoute) {
    const updatedQuery = { ...route.query };
    if (newValue !== "") {
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
  <div class="w-full">
    <div class="relative flex items-center w-full h-12 rounded-lg focus-within:shadow-lg bg-white overflow-hidden border-2 border-gray100">
      <div class="grid place-items-center h-full w-12 text-gray-300">
        <Icon name="search" class="h-6 w-6" />
      </div>
      <input
        ref="input"
        v-model="inputValue"
        class="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
        type="text"
        :placeholder="placeholder || t('shared.button.search')"
        :disabled="disabled"
        @input="$emit('update:modelValue', inputValue)"
      />
    </div>
  </div>
</template>

