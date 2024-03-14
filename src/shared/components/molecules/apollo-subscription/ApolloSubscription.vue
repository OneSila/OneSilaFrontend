<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import apolloClient from '../../../../../apollo-client';
import { onBeforeRouteLeave } from 'vue-router';

const props = defineProps<{ subscription: any; variables?: Object }>();

const result = ref(null);
const error = ref(null);
const loading = ref(true);
let subscriptionObserver;

const subscribe = () => {
  const observable = apolloClient.subscribe({
    query: props.subscription,
    variables: props.variables
  });

  subscriptionObserver = observable.subscribe({
    next: ({data}) => {
      result.value = data;
      loading.value = false;
    },
    error: (e) => {
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
  unsubscribe();
  subscribe();
};

onMounted(subscribe);

onUnmounted(unsubscribe);

onBeforeRouteLeave(unsubscribe);

defineExpose({ refresh });

</script>

<template>
  <div>
    <slot name="default" :loading="loading" :error="error" :result="result"/>
  </div>
</template>
