<template>
  <Link block>
    <img :src="src" :alt="alt" class="w-full" />
  </Link>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { Link } from '../../atoms/link';

const { src, alt, to } = defineProps(['src', 'alt', 'to']);
</script>
