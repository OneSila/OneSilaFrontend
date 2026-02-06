<script setup lang="ts">
import { ref, watch, defineProps } from 'vue';
import { useRoute } from 'vue-router';
import { Toggle } from '../../../../../../atoms/toggle';
import Label from '../../../../../../atoms/label/Label.vue';
import { CheckboxFilter } from '../../../../searchConfig';

const props = defineProps<{ filter: CheckboxFilter }>();
const emit = defineEmits(['update-value']);
const route = useRoute();

const checked = ref(false);

// Watch for changes in the route query and adjust the toggle state
watch(() => route.query[props.filter.name], (newValue) => {
  checked.value = newValue === 'true';
}, { immediate: true });

watch(checked, (newValue) => {
  emit('update-value', newValue ? true : props.filter.uncheckedValue === 'false' ? false : null);
});
</script>

<template>
  <div class="filter-item space-y-1">
    <Flex class="items-center">
      <FlexCell>
        <Label class="mr-2">{{ filter.label }}</Label>
      </FlexCell>
      <FlexCell>
        <Toggle v-model="checked" :disabled="filter.disabled"/>
      </FlexCell>
    </Flex>
    <p v-if="filter.helpText" class="text-xs text-gray-500">{{ filter.helpText }}</p>
  </div>
</template>

