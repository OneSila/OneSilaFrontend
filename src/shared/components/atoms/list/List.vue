<script setup lang="ts">
defineProps<{ items: any[] }>();
</script>

<template>
  <Flex class="list" gap="2" vertical>
    <FlexCell
      v-for="(item, index) in items"
      :key="`list-item-${index + 1}-${item.name}`"
    >
      <slot :item="item" :index="index">{{ item.name }}</slot>
    </FlexCell>
  </Flex>
</template>
