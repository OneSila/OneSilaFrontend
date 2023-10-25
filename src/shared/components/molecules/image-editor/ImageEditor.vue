<script setup lang="ts">
import { onBeforeUnmount, onMounted, Ref, ref, watchEffect } from 'vue';
import { Cropper } from 'vue-advanced-cropper'
import { computed } from '@vue/reactivity'
import 'vue-advanced-cropper/dist/style.css'
import { useI18n } from 'vue-i18n'

import { debounce, dataImageToBlob } from '../../../utils'
import { injectScreen, isWiderThan } from '../../../modules/screen'

import { Icon } from '../../atoms/icon'
import { Button } from '../../atoms/button'

import { SecondaryButton } from '../secondary-button'
import { TertiaryButton } from '../tertiary-button'
import { UploadedFile } from '../upload-manager'

import SystemToolbarTemplate from './SystemToolbarTemplate.vue'
import Toolbar from './Toolbar.vue'
import SettingsToolbar from './aux-toolbars/SettingsToolbar.vue'
import BackgroundToolbar from './aux-toolbars/BackgroundToolbar.vue'
import CropToolbar from './aux-toolbars/CropToolbar.vue'

const props = defineProps<{
  image: UploadedFile;
  defaultAspectRatio?: string | null;
  noDuplication?: boolean;
  noReset?: boolean;
}>()

const emit = defineEmits<{
  (e: 'cropped', image: Blob, newName: string, altText: string): void,
  (e: 'duplicate-clicked', image: Blob): void,
  (e: 'reset-clicked'): void,
  (e: 'updated:crop:shouldCrop', shouldCrop: boolean): void,
  (e: 'updated:crop:aspectRatio', aspectRatio: number): void,
  (e: 'updated:toolbar', toolbar: string): void,
  (e: 'updated:crop', image: Blob, newName: string, altText: string): void,
}>()

const { t } = useI18n()
const screen = injectScreen()
const cropperParentElement: any = ref(null)
const rootElement: any = ref(null)
const cropper: any = ref(null)
const cropperWidth = ref(640)
const cropperHeight = ref(640)
const color = ref('#fff')
const loaded = ref(false)
const unsavedChanges = ref(false)
const auxToolbar = ref('settings')

const rootWidth = ref(0)
const stencilWidth = ref(0)
const stencilHeight = ref(0)

const modifiedScreen = computed(() => ({
  width: rootWidth.value || screen.width,
  height: screen.height,
}))

const rawImage = ref(props.image.cropperFile)
const rawFilename = ref('')
const rawAltText = ref('')
const rawBlobImage: Ref<Blob | null> = ref(null)

const settings = computed(() => ({
  name: rawFilename.value,
  altText: rawAltText.value,
  shouldCrop: props.image.shouldCrop,
  aspectRatio: props.defaultAspectRatio || props.image.aspectRatio,
  metadata: getMetadata(),
  stencilWidth: stencilWidth.value,
  stencilHeight: stencilHeight.value,
  color: color.value,
  canvasWidth: cropperWidth.value,
  canvasHeight: cropperHeight.value,
}))

const stencilProps = ref({
  aspectRatio: props.defaultAspectRatio || props.image.aspectRatio || 1,
  movable: true,
  resizable: true,
  linesClasses: {
    default: 'bg-green-500'
  },
  handlersClasses: {
    default: 'bg-green-500'
  }
})

const getMetadata = () => {
  if (!rawBlobImage.value) {
    return []
  }

  const fileSize = rawBlobImage.value.size
  const oneKB = 1024
  const oneMB = oneKB * 1024

  let size = ''

  if (fileSize >= oneKB) {
    size = `${(fileSize / oneKB).toFixed(2)}KB`
  }

  if (fileSize >= oneMB) {
    size = `${(fileSize / oneMB).toFixed(2)}MB`
  }

  return [
    [t('shared.labels.type'), rawBlobImage.value.type.replace('image/', '').toUpperCase()],
    // ['Resolution', '1917x2874'],
    [t('shared.labels.size'), size],
    // ['Encoding', 'Progressive DCT, Huffman']
  ]
}

// const throttleExtraction = debounce((canvas: any) => {
//   canvas.toBlob((image: Blob) => {
//     rawBlobImage.value = image
//     console.log('onChanged - toBlob', image)
//   }, 'image/jpeg')

//   rawImage.value = canvas.toDataURL('image/jpeg')
//   console.log('onChanged - rawImage', rawImage.value)
// })

const onChanged = ({ canvas, coordinates }) => {
  if (!canvas || !props.image.shouldCrop) {
    return
  }

  stencilWidth.value = coordinates.width
  stencilHeight.value = coordinates.height

  unsavedChanges.value = true

  const context = canvas.getContext('2d')

  context.globalCompositeOperation = 'destination-over'

  context.fillStyle = color.value;
  context.fillRect(0, 0, canvas.width, canvas.height)

  // throttleExtraction(canvas)

  canvas.toBlob((image: Blob) => {
    rawBlobImage.value = image
    // console.log('onChanged - toBlob', image)
  }, 'image/jpeg')

  rawImage.value = canvas.toDataURL('image/jpeg')
  // console.log('onChanged - rawImage', rawImage.value)
}

const onColorChanged = (newColor: string) => {
  color.value = newColor

  if (cropper.value) {
    try {
      onChanged(cropper.value.getResult())
    } catch {}
  }
}

const resizeCropper = () => {
  rootWidth.value = rootElement.value?.$el?.offsetWidth

  const newWidth = cropperParentElement.value?.$el?.offsetWidth
  // const newHeight = cropperParentElement.value?.$el?.offsetHeight

  cropperWidth.value = (newWidth * 3 / 4) || 640
  cropperHeight.value = (newWidth * 3 / 4) || 640
  cropper.value?.refresh()
}

const onResized = debounce(() => {
  resizeCropper()
}, 300)

const onOptionChosen = (option: string) => {
  // const optionsWithAux = ['settings', 'background', 'crop', 'zoom', 'position']

  // if (optionsWithAux.includes(option)) {
  //   auxToolbar.value = option
  // }
  auxToolbar.value = option
}

const onSaveClicked = () => {
  if (!rawBlobImage.value) {
    return
  }

  emit('cropped', rawBlobImage.value, rawFilename.value, rawAltText.value)
  emit('updated:crop', rawBlobImage.value, rawFilename.value, rawAltText.value)
  unsavedChanges.value = false
}

const onResetClicked = () => {
  emit('reset-clicked')
  cropper.value?.reset()
  unsavedChanges.value = false
}

const getAuxToolbarComponent = () => {
  switch(auxToolbar.value) {
    case 'settings': {
      return SettingsToolbar
    }

    case 'background': {
      return BackgroundToolbar
    }

    case 'crop': {
      return CropToolbar
    }
  }
}

const onAuxToolbarChanged = (toolbar: string, payload: Record<string, any>) => {
  // console.log({ toolbar, payload })
  switch(toolbar) {
    case 'background': {
      onColorChanged(payload.color)
      break
    }

    case 'settings': {
      if (payload.name !== undefined) {
        rawFilename.value = payload.name || ''
      }

      if (payload.altText !== undefined) {
        rawAltText.value = payload.altText || ''
      }

      if (payload.canvasWidth) {
        cropperWidth.value = payload.canvasWidth
      }

      if (payload.canvasHeight) {
        cropperHeight.value = payload.canvasHeight
      }

      cropper.value?.refresh()

      break
    }

    case 'crop': {
      if (payload.shouldCrop !== undefined) {
        props.image.shouldCrop = payload.shouldCrop
        // emit('updated:crop:shouldCrop', payload.shouldCrop)
      }

      if (payload.aspectRatio) {
        props.image.aspectRatio = payload.aspectRatio
        // emit('updated:crop:aspectRatio', payload.aspectRatio)
        arrangeStencil(payload.aspectRatio)
      }

      break
    }
  }
}

const arrangeStencil = (aspectRatio: number) => {
  stencilProps.value.aspectRatio = aspectRatio
  cropper.value?.refresh()
}

const onDuplicateClicked = () => {
  if (!rawBlobImage.value) {
    return
  }

  emit('duplicate-clicked', rawBlobImage.value)
}

onMounted(() => {
  resizeCropper()

  window.addEventListener('resize', onResized, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResized)
})

watchEffect(() => {
  if (rawImage.value.includes('data:')) {
    rawBlobImage.value = dataImageToBlob(rawImage.value)
  }
})

watchEffect(() => {
  rawFilename.value = props.image.name
  rawAltText.value = props.image.altText
})

defineExpose({
  refresh: () => cropper.value?.refresh(),
  reset: () => cropper.value?.reset()
})
</script>

<template>
  <Flex ref="rootElement" class="image-editor" vertical>
    <FlexCell class="border-t-2 border-l-2 border-r-2 bg-white p-2">
      <SystemToolbarTemplate :file-name="image.name" :uploaded="image.uploaded" :unsaved-changes="unsavedChanges" :screen="modifiedScreen">
        <template v-slot:apply>
          <SecondaryButton class="px-3 w-full" @click="onSaveClicked()">
            <slot name="apply">{{ t('shared.components.molecules.buttons.apply') }}</slot>
          </SecondaryButton>
        </template>

        <template v-if="!noReset" v-slot:reset>
          <TertiaryButton class="px-3 w-full" @click="onResetClicked()">{{ t('shared.components.molecules.buttons.reset') }}</TertiaryButton>
        </template>

        <template v-if="!noDuplication" v-slot:duplicate>
          <TertiaryButton class="px-3 w-full" @click="onDuplicateClicked()">{{ t('shared.components.molecules.buttons.duplicate') }}</TertiaryButton>
        </template>
      </SystemToolbarTemplate>
    </FlexCell>

    <FlexCell>
      <Grid columns="12" v-if="isWiderThan(modifiedScreen, 1059)">
        <GridCell span="1">
          <Toolbar
            :stencil-props="stencilProps"
            :cropper="cropper"
            :color="color"
            :option="auxToolbar"
            :screen="modifiedScreen"
            @chosen="onOptionChosen"
            @color-changed="onColorChanged"
          />
        </GridCell>

        <GridCell
          ref="cropperParentElement"
          class="border-t-2 border-b-2 p-2 bg-gray-50 flex items-center justify-center relative"
          :span="isWiderThan(modifiedScreen, 1356) ? '8' : '7'"
        >
          <Icon name="circle-notch" size="4x" v-if="!loaded" spin />

          <Button
            class="p-2 absolute top-2 left-2"
            :title="t('shared.components.molecules.imageEditor.toggleMove')"
            :class="{ 'bg-gray-300': stencilProps.movable, 'bg-gray-200': !stencilProps.movable }"
            @click="stencilProps.movable = !stencilProps.movable"
          >
            <Icon name="arrows-up-down-left-right" />
          </Button>

          <Cropper
            ref="cropper"
            image-restriction="none"
            class="shadow-md"
            :style="{
              'background-color': color,
              width: `${cropperWidth}px`,
              height: `${cropperHeight}px`
            }"
            :src="image.cropperFile"
            :stencil-props="stencilProps"
            :resize-image="{ wheel: { ratio: 0.07 } }"
            @change="onChanged"
            @ready="loaded = true"
          />
        </GridCell>

        <GridCell
          class="border-2 bg-white"
          :span="isWiderThan(modifiedScreen, 1356) ? '3' : '4'"
        >
          <div class="overflow-y-auto p-2 max-h-100">
            <component
              :is="getAuxToolbarComponent()"
              :image="image"
              :raw-image="rawImage"
              :settings="settings"
              :cropper="cropper"
              :stencil-props="stencilProps"
              :screen="modifiedScreen"
              @changed="onAuxToolbarChanged"
            />
          </div>
        </GridCell>
      </Grid>

      <Flex v-else vertical>
        <FlexCell
          ref="cropperParentElement"
          class="border-2 p-2 bg-gray-50 flex items-center justify-center relative"
        >
          <Icon name="circle-notch" size="4x" v-if="!loaded" spin />

          <Button
            class="p-2 absolute top-2 left-2"
            :title="t('shared.components.molecules.imageEditor.toggleMove')"
            :class="{ 'bg-gray-300': stencilProps.movable, 'bg-gray-200': !stencilProps.movable }"
            @click="stencilProps.movable = !stencilProps.movable"
          >
            <Icon name="arrows-up-down-left-right" />
          </Button>

          <Cropper
            ref="cropper"
            image-restriction="none"
            class="shadow-md"
            :style="{
              'background-color': color,
              width: `${cropperWidth}px`,
              height: `${cropperHeight}px`
            }"
            :src="image.cropperFile"
            :stencil-props="stencilProps"
            @change="onChanged"
            @ready="loaded = true"
          />
        </FlexCell>

        <FlexCell class="border-l-2 border-r-2">
          <div class="overflow-y-auto p-2 max-h-100">
            <component
              :is="getAuxToolbarComponent()"
              :image="image"
              :raw-image="rawImage"
              :settings="settings"
              :cropper="cropper"
              :stencil-props="stencilProps"
              :screen="modifiedScreen"
              @changed="onAuxToolbarChanged"
              horizontal
            />
          </div>
        </FlexCell>

        <FlexCell>
          <Toolbar
            :stencil-props="stencilProps"
            :cropper="cropper"
            :color="color"
            :option="auxToolbar"
            :screen="modifiedScreen"
            @chosen="onOptionChosen"
            @color-changed="onColorChanged"
            horizontal
          />
        </FlexCell>
      </Flex>
    </FlexCell>
  </Flex>
</template>

<style>
.vue-advanced-cropper__background, .vue-advanced-cropper__foreground {
  background-color: transparent;
  opacity: 1 !important;
}
</style>
