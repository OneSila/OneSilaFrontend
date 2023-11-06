<script setup lang="ts">
import { ref } from "vue";

import { List } from "../../atoms/list";

const props = defineProps<{ items: string[]; perColumn?: string; columnGap?: string }>()

const perColumnNumber = ref(Number(props.perColumn))
const columns = ref(Math.ceil(props.items.length / perColumnNumber.value))
</script>

<template>
</template>
