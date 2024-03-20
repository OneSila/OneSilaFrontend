<script setup lang="ts">
import { Link } from '../../../../shared/components/atoms/link';
import { Icon } from '../../../../shared/components/atoms/icon';

const props = defineProps<{ links: { path?: string | object; name: string }[] }>();

</script>

<template>
  <nav class="flex ml-1" aria-label="Breadcrumb">
    <ol role="list" class="flex items-center space-x-4">

      <li>
        <div>
          <Link :path="{ name: 'dashboard' }" class="text-gray-400 hover:text-gray-500">
            <Icon name="home" class="h-5 w-5 flex-shrink-0" aria-hidden="true" size="xs" />
            <span class="sr-only">Home</span>
          </Link>
        </div>
      </li>

      <li v-for="link in links" :key="link.name">
        <div class="flex items-center">
          <Icon name="chevron-right" class="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" size="xs" />
          <Link :path="link.path" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            {{ link.name }}
          </Link>
        </div>
      </li>
    </ol>
  </nav>
</template>

<style scoped>

</style>
