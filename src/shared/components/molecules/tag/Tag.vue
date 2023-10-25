<script setup lang="ts">
import { Icon } from '../../atoms/icon';
import { Button } from '../../atoms/button';

defineProps<{ disabled?: boolean }>();

defineEmits<{
  (e: 'remove-clicked', event: any): void;
}>();
</script>

<template>
  <Flex
    class="tag bg-gray-200 text-gray-700 rounded-lg text-sm"
    style="padding-top: 2px; padding-bottom: 2px"
    gap="2"
  >
    <FlexCell center>
      <slot />
    </FlexCell>

    <FlexCell v-if="!disabled" center>
      <Button @click.prevent="(event) => $emit('remove-clicked', event)">
        <Icon class="text-gray-400" name="minus-circle" size="sm" />
      </Button>
    </FlexCell>
  </Flex>
</template>
