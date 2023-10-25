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
  <Flex class="form-save-buttons" gap="2" :vertical="!isWiderThan(screen, breakWidth)">
    <FlexCell>
      <SecondaryButton class="px-3" :class="{ 'w-full': !isWiderThan(screen, breakWidth) }" :loading="loading" @click="$emit('save-clicked')">
        <slot name="save">{{ t('shared.components.molecules.buttons.save') }}</slot>
      </SecondaryButton>
    </FlexCell>

    <FlexCell>
      <TertiaryButton class="px-3" :class="{ 'w-full': !isWiderThan(screen, breakWidth) }" :loading="loading" @click="$emit('continue-clicked')">
        <slot name="continue">{{ t('shared.components.molecules.buttons.saveAndContinue') }}</slot>
      </TertiaryButton>
    </FlexCell>
  </Flex>
</template>