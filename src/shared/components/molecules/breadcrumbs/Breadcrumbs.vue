<script setup lang="ts">
import { Link } from '../../atoms/link';

defineProps<{ links: { path?: string | object; name: string; }[]; }>()
</script>

<template>
  <Flex class="breadcrumbs" gap="2" wrap>
    <FlexCell class="breadcrumb-item" v-for="(link, index) in links" :key="link.name">
      <Link :path="link.path" v-if="index < links.length - 1">
        {{ link.name }}
      </Link>

      <span class="text-gray-700" v-else>
        {{ link.name }}
      </span>

      <span class="ml-2" v-if="index < links.length - 1">&gt;</span>
    </FlexCell>
  </Flex>
</template>
