<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

import { isWiderThan, Screen } from '../../../../modules/screen'

import { Label } from '../../../atoms/label'
import { ColorPicker } from '../../../atoms/color-picker'

const props = defineProps<{
  image: any;
  rawImage: any;
  settings?: { name?: string; altText?: string; color?: string; };
  cropper: any;
  stencilProps: any;
  screen?: Screen;
}>()

const { t } = useI18n()

const rawColor = ref('#fff')

watchEffect(() => {
  rawColor.value = props.settings?.color || '#fff'
})
</script>

<template>
  <Flex class="background-toolbar" gap="4" vertical>
    <FlexCell>
      <Flex gap="2" vertical>
        <FlexCell>
          <Label size="xs" uppercase semi-bold>{{ t('shared.labels.color') }}</Label>
        </FlexCell>

        <FlexCell>
          <ColorPicker
            :model-value="rawColor"
            @update:modelValue="newColor => $emit('changed', 'background', { color: newColor })"
            :widget="isWiderThan(screen, 1059)"
          />
        </FlexCell>
      </Flex>
    </FlexCell>
  </Flex>
</template>
