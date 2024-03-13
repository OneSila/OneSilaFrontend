<script setup lang="ts">
import { defineProps } from 'vue';
import { Link } from '../../atoms/link';
import logoImage from '../../../../assets/images/logo/logo.png';

const { src, alt, to } = defineProps(['src', 'alt', 'to']);
</script>

<template>
  <Link block>
    <img :src="logoImage" :alt="alt" class="w-full" />
  </Link>
</template>
