<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { isWiderThan, Screen } from '../../../modules/screen'

import { Button } from '../../atoms/button'
import { Icon } from '../../atoms/icon'
import { Label } from '../../atoms/label'

defineProps<{
  cropper: any;
  color: any;
  stencilProps: any;
  option: string;
  horizontal?: boolean;
  screen?: Screen;
}>()

defineEmits<{
  (e: 'chosen', option: string): void,
  (e: 'color-changed', color: any): void,
}>()

const { t } = useI18n()
</script>

<template>
  <Flex class="image-cropper__toolbar bg-gray-700 text-white py-2 h-full" gap="2" :vertical="!horizontal">
    <FlexCell class="p-1" center>
      <Button
        class="p-1 px-2"
        :title="t('shared.components.molecules.imageEditor.toolbar.settingsTooltip')"
        :class="{ 'bg-gray-600': option === 'settings' }"
        @click="$emit('chosen', 'settings')"
      >
        <Flex gap="1" vertical>
          <FlexCell center>
            <Icon name="gear" />
          </FlexCell>

          <FlexCell v-if="isWiderThan(screen, 1399)">
            <Label size="xs" semi-bold uppercase>{{ t('shared.components.molecules.imageEditor.toolbar.settings') }}</Label>
          </FlexCell>
        </Flex>
      </Button>
    </FlexCell>

    <FlexCell class="p-1" center>
      <Button
        class="p-1 px-2"
        :title="t('shared.components.molecules.imageEditor.toolbar.backgroundTooltip')"
        :class="{ 'bg-gray-600': option === 'background' }"
        @click="$emit('chosen', 'background')"
      >
        <Flex gap="1" vertical>
          <FlexCell>
            <Icon name="table-cells" />
          </FlexCell>

          <FlexCell v-if="isWiderThan(screen, 1399)">
            <Label size="xs" semi-bold uppercase>{{ t('shared.components.molecules.imageEditor.toolbar.background') }}</Label>
          </FlexCell>
        </Flex>
      </Button>
    </FlexCell>

    <FlexCell class="p-1" center>
      <Button
        class="p-1 px-2"
        :title="t('shared.components.molecules.imageEditor.toolbar.cropTooltip')"
        :class="{ 'bg-gray-600': option === 'crop' }"
        @click="$emit('chosen', 'crop')"
      >
        <Flex gap="1" vertical>
          <FlexCell>
            <Icon name="crop-simple" />
          </FlexCell>

          <FlexCell v-if="isWiderThan(screen, 1399)">
            <Label size="xs" semi-bold uppercase>{{ t('shared.components.molecules.imageEditor.toolbar.crop') }}</Label>
          </FlexCell>
        </Flex>
      </Button>
    </FlexCell>
  </Flex>
</template>