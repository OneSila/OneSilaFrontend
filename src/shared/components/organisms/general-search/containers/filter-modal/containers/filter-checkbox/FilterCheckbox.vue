<script setup lang="ts">
import { ref, watch, defineProps } from 'vue';
import { useRoute } from 'vue-router';
import Checkbox from '../../../../../../atoms/checkbox/Checkbox.vue';
import Label from '../../../../../../atoms/label/Label.vue';
import { CheckboxFilter } from '../../../../searchConfig';

const props = defineProps<{ filter: CheckboxFilter }>();
const emit = defineEmits(['update-value']);
const route = useRoute();

const checked = ref(false);

// Watch for changes in the route query and adjust the checkbox state
watch(() => route.query[props.filter.name], (newValue) => {
  checked.value = newValue === 'true';
}, { immediate: true });

watch(checked, (newValue) => {
  emit('update-value', newValue ? true : props.filter.uncheckedValue === 'false' ? false : null);
});
</script>

<template>
  <Flex class="filter-item">
    <FlexCell>
      <Label class="mr-2">{{ filter.label }}</Label>
    </FlexCell>
    <FlexCell>
      <Checkbox v-model="checked" :disabled="filter.disabled"/>
    </FlexCell>

  </Flex>
</template>


