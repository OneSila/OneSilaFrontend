<script setup lang="ts">
import { Link } from '../../atoms/link';

defineProps<{ route?: string | object; compact?: boolean }>();
</script>

<template>
  <Link
    class="nav-item"
    horizontal-gutter="2"
    :path="route"
    :vertical-gutter="compact ? '1' : '3'"
    inline-block
    ><slot
  /></Link>
</template>
