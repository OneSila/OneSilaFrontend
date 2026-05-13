import { computed, ref } from 'vue';

const optionApiLoadingCount = ref(0);

export const updateApolloOptionLoading = (countModifier: number) => {
  optionApiLoadingCount.value = Math.max(0, optionApiLoadingCount.value + countModifier);
};

export const useApolloOptionLoading = () =>
  computed(() => optionApiLoadingCount.value > 0);
