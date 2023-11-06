<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { injectScreen, isWiderThan } from '../../../modules/screen'

import { SecondaryButton } from '../secondary-button'
import { TertiaryButton } from '../tertiary-button'

withDefaults(
  defineProps<{ loading?: boolean; breakWidth?: number; }>(),
  { breakWidth: 368 }
)

const { t } = useI18n()
const screen = injectScreen()
</script>

<template>
</template>