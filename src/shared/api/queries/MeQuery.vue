<script setup lang="ts">
import { Ref, ref, watchEffect, computed } from 'vue';
import { useQuery } from 'vql';

import { useSafeRequest } from '../../modules/network';

const props = withDefaults(defineProps<{ manual?: boolean }>(), {
  manual: false,
});

const emit = defineEmits<{
  (e: 'loaded', me: any): void;
}>();

const me: Ref<Record<string, any> | null> = ref(null);
const errors: Ref<any[]> = ref([]);

const safeRequest = useSafeRequest(errors);

const { data, executeQuery, fetching } = useQuery({
  pause: computed(() => props.manual),
});

const run = () => safeRequest(async () => executeQuery());

watchEffect(() => {
  me.value = data.value?.me || null;

  if (data.value) {
    emit('loaded', me.value);
  }
});

defineExpose({
  run,
});
</script>

<template>
  <div class="me-query">
    <slot :me="me" :loading="fetching" />
  </div>
</template>

<gql>
query {
  me {
    id
    email
    firstName
    lastName
    language
    showOnboarding
  }
}
</gql>
