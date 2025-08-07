<script setup lang="ts">
import { ref, watch, computed } from "vue";
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
    loading?: boolean;
  }>(),
  { routeKey: "search", debounce: 600, loading: false }
);

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const input = ref<HTMLInputElement | null>(null);
const emit = defineEmits(["update:modelValue"]);
const inputValue = ref((props.modelValue || "").slice(0, 100));
const loading = computed(() => props.loading);

watch(() => props.modelValue, (newValue) => {
  if (newValue === null) {
    newValue = "";
  }
  if (newValue.length > 100) {
    newValue = newValue.slice(0, 100);
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

const onInput = () => {
  if (inputValue.value.length > 100) {
    inputValue.value = inputValue.value.slice(0, 100);
  }
  emit("update:modelValue", inputValue.value);
};
</script>

<template>
  <div class="w-full" :class="disabled ? 'bg-gray-100' : 'bg-white'">
    <div class="relative flex items-center w-full h-12 rounded-lg focus-within:shadow-lg  overflow-hidden border-2 border-gray100">
      <div class="grid place-items-center h-full w-12 text-gray-300">
        <Icon v-if="!loading" name="search" class="h-6 w-6" />
        <div v-else class="loader-mini"></div>
      </div>
      <input
        ref="input"
        v-model="inputValue"
        class="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
        type="text"
        :placeholder="placeholder || t('shared.button.search')"
        :disabled="disabled"
        @input="onInput"
      />
    </div>
  </div>
</template>

<style scoped>
.loader-mini {
  width: 24px;
  aspect-ratio: 1;
  display: grid;
}

.loader-mini::before,
.loader-mini::after {
  content: "";
  grid-area: 1/1;
  --c: no-repeat radial-gradient(farthest-side, currentColor 92%, #0000);
  background:
    var(--c) 50% 0,
    var(--c) 50% 100%,
    var(--c) 100% 50%,
    var(--c) 0 50%;
  background-size: 5px 5px;
  animation: l2 1s infinite;
}

.loader-mini::after {
  margin: 2px;
  filter: hue-rotate(45deg);
  background-size: 3px 3px;
  animation-direction: reverse;
}

@keyframes l2 {
  100% {
    transform: rotate(0.5turn);
  }
}
</style>

