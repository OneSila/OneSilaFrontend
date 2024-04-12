<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { Label } from '../../../../../../atoms/label';
import { TextInput } from '../../../../../../atoms/input-text';
import { ValueFilter } from '../../../../searchConfig';

const props = defineProps<{ filter: ValueFilter }>();
const emit = defineEmits(['update-value']);
const route = useRoute();

const inputValue = ref(props.filter.default ?? null);

watch(() => route.query[props.filter.name], (newValue) => {
  if (newValue !== undefined) {
    if (props.filter.number && !isNaN(Number(newValue))) {
      inputValue.value = Number(newValue);
    } else {
      inputValue.value = newValue;
    }
  }
}, { immediate: true });

watchEffect(() => {
  emit('update-value', inputValue.value);
});

</script>

<template>
  <div class="filter-item">
    <Label>{{ filter.label }}</Label>
    <div>
      <TextInput
        v-model="inputValue"
        :placeholder="filter.placeholder"
        :error="filter.error"
        :transparent="filter.transparent"
        :disabled="filter.disabled === true"
        :secret="filter.secret"
        :number="filter.number"
        :maxNumber="filter.maxNumber"
        :minNumber="filter.minNumber"
        class="w-full"
      />
    </div>
  </div>
</template>
