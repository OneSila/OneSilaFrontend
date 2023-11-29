<script setup lang="ts">
import { Link } from '../../../../shared/components/atoms/link';

const props = defineProps<{ links: { path?: string | object; name: string }[] }>();

</script>

<template>
  <ol class="flex text-gray-500 font-semibold dark:text-white-dark breadcrumb-item"  v-for="(link, index) in links" :key="link.name">

    <li v-if="index == 0" >
        <Link :path="link.path">
        {{ link.name }}
      </Link>
    </li>

      <li class="before:content-['/'] before:px-1.5" v-else-if="index < links.length - 1" >
      <Link :path="link.path">
        {{ link.name }}
      </Link>
    </li>


    <li v-else>
       <span  class="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">
        {{ link.name }}
      </span>
    </li>

  </ol>

</template>

<style scoped>

</style>
