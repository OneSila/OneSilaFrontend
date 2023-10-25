<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

import { debounce } from '../../../utils'

import { Icon } from '../../atoms/icon'
import { Button } from '../../atoms/button'
import { ColorPicker } from '../../atoms/color-picker'

defineProps<{ image: any; }>()

const emit = defineEmits<{
  (e: 'cropped', image: Blob): void,
}>()

const rootElement: any = ref(null)
const cropper: any = ref(null)
const cropperWidth = ref(640)
const color = ref('#fff')
const loaded = ref(false)

const rawImage = ref(null)
const debug = ref(false)

const stencilProps = ref({
  aspectRatio: 1366/768,
  movable: true,
  resizable: true,
  linesClasses: {
    default: 'bg-green-500'
  },
  handlersClasses: {
    default: 'bg-green-500'
  }
})

const onChanged = ({ canvas }) => {
  if (!canvas) {
    return
  }

  const context = canvas.getContext('2d')

  context.globalCompositeOperation = 'destination-over'

  context.fillStyle = color.value;
  context.fillRect(0, 0, canvas.width, canvas.height)

  canvas.toBlob((image: Blob) => {
    emit('cropped', image)
  })

  if (debug.value) {
    rawImage.value = canvas.toDataURL()
  }
}

const onColorChanged = () => {
  if (cropper.value) {
    onChanged(cropper.value.getResult())
  }
}

const onZoomInClicked = () => {
  cropper.value && cropper.value.zoom(2)
}

const onZoomOutClicked = () => {
  cropper.value && cropper.value.zoom(0.5)
}

const onRotateLeftClicked = () => {
  cropper.value && cropper.value.rotate(-90)
}

const onRotateRightClicked = () => {
  cropper.value && cropper.value.rotate(90)
}

const onFlipHorizontallyClicked = () => {
  cropper.value && cropper.value.flip(true, false)
}

const onFlipVerticallyClicked = () => {
  cropper.value && cropper.value.flip(false, true)
}

const onMaximizeClicked = () => {
  if (cropper.value) {
    const center = {
      left: cropper.value.coordinates.left + cropper.value.coordinates.width / 2,
      top: cropper.value.coordinates.top + cropper.value.coordinates.height / 2,
    };

    cropper.value.setCoordinates([
      ({ visibleArea }) => ({
        width: visibleArea.width,
        height: visibleArea.width / stencilProps.value.aspectRatio,
      }),
      ({ coordinates }) => ({
        left: center.left - coordinates.width / 2,
        top: center.top - coordinates.height / 2,
      }),
    ]);
  }
}

const onMinimizeClicked = () => {
  if (cropper.value) {
    const center = {
      left: cropper.value.coordinates.left + cropper.value.coordinates.width / 2,
      top: cropper.value.coordinates.top + cropper.value.coordinates.height / 2,
    };

    cropper.value.setCoordinates([
      ({ visibleArea }) => ({
        width: visibleArea.width * 0.1,
        height: visibleArea.width * 0.1 / stencilProps.value.aspectRatio,
      }),
      ({ coordinates }) => ({
        left: center.left - coordinates.width / 2,
        top: center.top - coordinates.height / 2,
      }),
    ]);
  }
}

const resizeCropper = () => {
  cropperWidth.value = rootElement.value?.$el?.offsetWidth || 640
  cropper.value?.refresh()
}

const onResized = debounce(() => {
  resizeCropper()
}, 300)

onMounted(() => {
  resizeCropper()

  window.addEventListener('resize', onResized, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResized)
})

defineExpose({
  refresh: () => cropper.value?.refresh()
})
</script>

<template>
  <Flex ref="rootElement" class="image-cropper" gap="2" vertical>
    <FlexCell class="image-cropper__toolbar bg-gray-200">
      <Flex gap="2" wrap>
        <FlexCell class="pl-2 pb-1" center>
          <ColorPicker v-model="color" @update:modelValue="onColorChanged()" />
        </FlexCell>

        <FlexCell class="p-1" center>
          <Button
            class="p-1"
            title="Toggle between moving the stencil or the image"
            :class="{ 'bg-gray-400': stencilProps.movable }"
            @click="stencilProps.movable = !stencilProps.movable"
          >
            <Icon name="arrows-up-down-left-right" />
          </Button>
        </FlexCell>

        <FlexCell class="p-1" center>
          <Button
            class="p-1"
            title="Zoom in"
            @click="onZoomInClicked()"
          >
            <Icon name="magnifying-glass-plus" />
          </Button>
        </FlexCell>

        <FlexCell class="p-1" center>
          <Button
            class="p-1"
            title="Zoom out"
            @click="onZoomOutClicked()"
          >
            <Icon name="magnifying-glass-minus" />
          </Button>
        </FlexCell>

        <FlexCell class="p-1" center>
          <Button
            class="p-1"
            title="Rotate left"
            @click="onRotateLeftClicked()"
          >
            <Icon name="rotate-left" />
          </Button>
        </FlexCell>

        <FlexCell class="p-1" center>
          <Button
            class="p-1"
            title="Rotate right"
            @click="onRotateRightClicked()"
          >
            <Icon name="rotate-right" />
          </Button>
        </FlexCell>

        <FlexCell class="p-1" center>
          <Button
            class="p-1"
            title="Flip horizontally"
            @click="onFlipHorizontallyClicked()"
          >
            <Icon name="arrows-left-right-to-line" />
          </Button>
        </FlexCell>

        <FlexCell class="p-1" center>
          <Button
            class="p-1"
            title="Flip vertically"
            @click="onFlipVerticallyClicked()"
          >
            <Icon name="arrows-left-right-to-line" rotation="90" />
          </Button>
        </FlexCell>

        <FlexCell class="p-1" center>
          <Button
            class="p-1"
            title="Maximize"
            @click="onMaximizeClicked()"
          >
            <Icon name="maximize" />
          </Button>
        </FlexCell>

        <FlexCell class="p-1" center>
          <Button
            class="p-1"
            title="Minimize"
            @click="onMinimizeClicked()"
          >
            <Icon name="minimize" />
          </Button>
        </FlexCell>
      </Flex>
    </FlexCell>

    <FlexCell class="flex items-center justify-center" v-if="!loaded">
      <Icon name="circle-notch" size="4x" spin />
    </FlexCell>

    <FlexCell>
      <Cropper
        ref="cropper"
        image-restriction="none"
        :style="`background-color: ${color}; width: ${cropperWidth}px`"
        :src="image"
        :stencil-props="stencilProps"
        @change="onChanged"
        @ready="loaded = true"
      />
    </FlexCell>

    <FlexCell v-if="rawImage && debug">
      <img class="w-full" :src="rawImage" />
    </FlexCell>
  </Flex>
</template>

<style>
.vue-advanced-cropper__background, .vue-advanced-cropper__foreground {
  background-color: transparent;
  opacity: 1 !important;
  border: 2px solid black;
}
</style>
