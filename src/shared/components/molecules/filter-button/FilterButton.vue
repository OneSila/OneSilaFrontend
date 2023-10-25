<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { Icon } from '../../atoms/icon'

import { SecondaryButton } from '../secondary-button'

const { t } = useI18n()
</script>

<template>
  <SecondaryButton class="filter-button px-2">
    <Flex gap="2" center>
      <FlexCell>
        <Icon name="sliders-h" />
      </FlexCell>

      <FlexCell>
        {{ t('shared.components.molecules.buttons.filter') }}
      </FlexCell>
    </Flex>
  </SecondaryButton>
</template>
