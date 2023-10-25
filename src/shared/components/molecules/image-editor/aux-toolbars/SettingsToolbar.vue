<script setup lang="ts">
import { Ref, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

import { debounce } from '../../../../utils'
import { isWiderThan, Screen } from '../../../../modules/screen'

import { TextInput } from '../../../atoms/text-input'
import { Label } from '../../../atoms/label'
import { List } from '../../../atoms/list'
import { Image } from '../../../atoms/image'

const props = defineProps<{
  image: any;
  rawImage: any;
  settings?: { name?: string; altText?: string; metadata?: any[]; canvasWidth?: number; canvasHeight?: number };
  cropper: any;
  stencilProps: any;
  screen?: Screen;
}>()

const emit = defineEmits<{
  (e: 'changed', toolbar: string, payload: Record<string, any>): void,
}>()

const { t } = useI18n()

const name = ref('')
const altText = ref('')
const metadata: Ref<any[]> = ref([])
const width: Ref<number | null> = ref(null)
const height: Ref<number | null> = ref(null)

const updateSettings = (toolbar: string, payload: any) => {
  emit('changed', toolbar, payload)
}

const possibleExtensions = ['png', 'jpg', 'jpeg', 'xlsx']

const removeExtensionFromFilename = (name: string) => possibleExtensions.reduce((filename: string, extension) => {
  return filename.replace(`.${extension}`, '').replace(`,${extension}`, '')
}, name)

watchEffect(() => {
  name.value = removeExtensionFromFilename(props.settings?.name || '')
  altText.value = props.settings?.altText || ''
  metadata.value = props.settings?.metadata || []
  width.value = props.settings?.canvasWidth || null
  height.value = props.settings?.canvasHeight || null
})
</script>

<template>
  <Flex class="settings-toolbar" gap="4" :vertical="isWiderThan(screen, 1059)" :between="!isWiderThan(screen, 1059)">
    <FlexCell :class="{ 'min-w-56': !isWiderThan(screen, 1059) }">
      <Flex gap="4" vertical>
        <FlexCell>
          <Flex gap="2" vertical>
            <FlexCell>
              <Label size="xs" uppercase semi-bold>{{ t('shared.labels.name') }}</Label>
            </FlexCell>

            <FlexCell>
              <TextInput
                :placeholder="t('shared.components.molecules.imageEditor.settingsToolbar.namePlaceholder')"
                class="w-full"
                v-model="name"
                @update:modelValue="name => updateSettings('settings', { name })"
              />
            </FlexCell>
          </Flex>
        </FlexCell>

        <FlexCell>
          <Flex gap="2" vertical>
            <FlexCell>
              <Label size="xs" uppercase semi-bold>{{ t('shared.components.molecules.imageEditor.settingsToolbar.altText') }}</Label>
            </FlexCell>

            <FlexCell>
              <TextInput
                :placeholder="t('shared.components.molecules.imageEditor.settingsToolbar.altTextPlaceholder')"
                class="w-full"
                v-model="altText"
                @update:modelValue="altText => updateSettings('settings', { altText })"
              />
            </FlexCell>
          </Flex>
        </FlexCell>
      </Flex>
    </FlexCell>

    <FlexCell grow>
      <Flex gap="2" vertical>
        <FlexCell>
          <Label size="xs" uppercase semi-bold>{{ t('shared.components.molecules.imageEditor.settingsToolbar.metadata') }}</Label>
        </FlexCell>

        <FlexCell>
          <List :items="metadata">
            <template v-slot="{ item }">
              <Flex class="border-b pb-1" gap="1" between>
                <FlexCell>
                  <Label size="sm" semi-bold>{{ item[0] }}</Label>
                </FlexCell>

                <FlexCell>
                  {{ item[1] }}
                </FlexCell>
              </Flex>
            </template>
          </List>
        </FlexCell>
      </Flex>
    </FlexCell>

    <FlexCell>
      <Flex gap="2" vertical>
        <FlexCell>
          <Label size="xs" uppercase semi-bold>{{ t('shared.components.molecules.imageEditor.settingsToolbar.preview') }}</Label>
        </FlexCell>

        <FlexCell>
          <Image class="border-2" :class="{ 'max-w-56 max-h-40': !isWiderThan(screen, 1059) }" :source="rawImage" />
        </FlexCell>
      </Flex>
    </FlexCell>
  </Flex>
</template>
