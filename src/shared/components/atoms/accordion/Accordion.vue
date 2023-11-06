<script setup lang="ts">
import { ref, computed } from 'vue'

import { Button } from '../button'
import { Icon } from '../icon'

const props = defineProps<{ withoutStyles?: boolean; disabled?: boolean; openedFirst?: boolean }>()

const opened = ref(!!props.openedFirst)

</script>

<template>
</template>
