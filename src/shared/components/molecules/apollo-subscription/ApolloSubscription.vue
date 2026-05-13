<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import apolloClient from '../../../../../apollo-client';

const props = defineProps<{
  subscription: any;
  variables?: Object;
  initialQuery?: any;
  initialQueryVariables?: Object;
  initialFetchPolicy?: any;
}>();

const result = ref<any>(null);
const error = ref<any>(null);
const loading = ref(true);
let subscriptionObserver: { unsubscribe: () => void } | null = null;
let refreshToken = 0;
let subscriptionResultToken: number | null = null;
const emit = defineEmits(['result-updated']);

const updateResult = (data) => {
  result.value = data;
  loading.value = false;
  emit('result-updated', data);
};

const loadInitialResult = async (token: number) => {
  if (!props.initialQuery) {
    return;
  }

  try {
    const response = await apolloClient.query({
      query: props.initialQuery,
      variables: props.initialQueryVariables || props.variables,
      fetchPolicy: props.initialFetchPolicy || 'network-only',
    });

    if (token !== refreshToken || subscriptionResultToken === token) {
      return;
    }

    updateResult(response.data);
  } catch (e) {
    if (token !== refreshToken) {
      return;
    }

    error.value = e;
  }
};

const subscribe = () => {
  const token = refreshToken;
  const observable = apolloClient.subscribe({
    query: props.subscription,
    variables: props.variables
  });

  subscriptionObserver = observable.subscribe({
    next: ({data}) => {
      if (token !== refreshToken) {
        return;
      }

      updateResult(data);
      subscriptionResultToken = token;
    },
    error: (e) => {
      if (token !== refreshToken) {
        return;
      }

      error.value = e;
      loading.value = false;
    }
  });
};

const unsubscribe = () => {
  if (subscriptionObserver) {
    subscriptionObserver.unsubscribe();
  }
};

const refresh = () => {
  refreshToken += 1;
  subscriptionResultToken = null;
  unsubscribe();
  error.value = null;
  loading.value = !result.value;
  void loadInitialResult(refreshToken);
  subscribe();
};

onMounted(refresh);

onUnmounted(() => {
  refreshToken += 1;
  unsubscribe();
});

defineExpose({ refresh });

</script>

<template>
  <div>
    <slot name="default" :loading="loading" :error="error" :result="result"/>
  </div>
</template>
