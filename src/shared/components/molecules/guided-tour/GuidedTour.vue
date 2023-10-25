<script lang="ts" setup>
import { getCurrentInstance, onMounted } from 'vue';

const props = defineProps<{ steps: any[]; name: string }>()
const emit = defineEmits<{ (e: 'stopped'): void }>()

const callbacks = {
  onSkip: () => {
    emit('stopped')
  },
  onFinish: () => {
    emit('stopped')
  },
  onStop: () => {
    emit('stopped')
  },
}

onMounted(() => {
  const app = getCurrentInstance()!
  app.appContext.config.globalProperties.$tours[props.name]?.start()
})
</script>

<template>
  <div class="guided-tour">
    <v-tour :name="name" :steps="steps" :callbacks="callbacks" :options="{ highlight: true }" />
  </div>
</template>

<style>
.v-tour__target--highlighted {
  box-shadow: 0 0 0 99999px rgba(0,0,0,.4);
  border-radius: 0.75rem;
  padding: 5px;
}

.v-tour .v-step {
  background-color: rgba(59, 130, 246, var(--tw-bg-opacity));
  border-radius: 0.75rem;
}

.v-tour .v-step__button {
  border-radius: 0.375rem;
  border-width: 2px;
}
</style>