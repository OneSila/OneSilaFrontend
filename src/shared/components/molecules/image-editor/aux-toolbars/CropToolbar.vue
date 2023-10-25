<script setup lang="ts">
import { Ref, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

import { isWiderThan, Screen } from '../../../../modules/screen'

import { Button } from '../../../atoms/button'
import { Label } from '../../../atoms/label'
import { Icon } from '../../../atoms/icon'
import { TextInput } from '../../../atoms/text-input'
import { Switch } from '../../../atoms/switch'
import { Selector } from '../../../atoms/selector'

const props = defineProps<{
  image: any;
  rawImage: any;
  settings?: { name?: string; altText?: string; stencilWidth?: number; stencilHeight?: number; shouldCrop?: boolean; aspectRatio?: number; };
  cropper: any;
  stencilProps: any;
  horizontal?: boolean;
  screen?: Screen;
}>()

const emit = defineEmits<{
  (e: 'changed', toolbar: string, payload: Record<string, any>): void,
}>()

const { t } = useI18n()

const width: Ref<string | null> = ref(null)
const height: Ref<string | null> = ref(null)
const shouldCrop = ref(false)
const aspectRatio = ref(1)

const aspectRatios = [
  { id: 1366/768, name: `${t('shared.components.molecules.imageEditor.cropToolbar.aspectRatios.product')} (1366:768)` },
  { id: 1, name: t('shared.components.molecules.imageEditor.cropToolbar.aspectRatios.square') },
  { id: 874/156, name: `${t('shared.components.molecules.imageEditor.cropToolbar.aspectRatios.banner')} (874:156)` },
]

const onMaximizeClicked = () => {
  if (props.cropper) {
    const center = {
      left: props.cropper.coordinates.left + props.cropper.coordinates.width / 2,
      top: props.cropper.coordinates.top + props.cropper.coordinates.height / 2,
    };

    props.cropper.setCoordinates([
      ({ visibleArea }) => {
        return {
          width: visibleArea.width,
          height: visibleArea.width / props.stencilProps.aspectRatio,
        }
      },
      ({ coordinates }) => ({
        left: center.left - coordinates.width / 2,
        top: center.top - coordinates.height / 2,
      }),
    ]);
  }
}

const onMinimizeClicked = () => {
  if (props.cropper) {
    const center = {
      left: props.cropper.coordinates.left + props.cropper.coordinates.width / 2,
      top: props.cropper.coordinates.top + props.cropper.coordinates.height / 2,
    };

    props.cropper.setCoordinates([
      ({ visibleArea }) => {
        return {
          width: visibleArea.width * 0.1,
          height: visibleArea.width * 0.1 / props.stencilProps.aspectRatio,
        }
      },
      ({ coordinates }) => ({
        left: center.left - coordinates.width / 2,
        top: center.top - coordinates.height / 2,
      }),
    ]);
  }
}

const onZoomInClicked = () => {
  props.cropper && props.cropper.zoom(2)
}

const onZoomOutClicked = () => {
  props.cropper && props.cropper.zoom(0.5)
}

const onRotateLeftClicked = () => {
  props.cropper && props.cropper.rotate(-90)
}

const onRotateRightClicked = () => {
  props.cropper && props.cropper.rotate(90)
}

const onFlipHorizontallyClicked = () => {
  props.cropper && props.cropper.flip(true, false)
}

const onFlipVerticallyClicked = () => {
  props.cropper && props.cropper.flip(false, true)
}

const onShouldCropChanged = (crop: boolean) => {
  emit('changed', 'crop', { shouldCrop: crop })
}

const onWidthChanged = (newWidth: string) => {
  if (props.cropper) {
    const center = {
      left: props.cropper.coordinates.left + props.cropper.coordinates.width / 2,
      top: props.cropper.coordinates.top + props.cropper.coordinates.height / 2,
    };

    props.cropper.setCoordinates([
      ({ visibleArea }) => {
        return {
          width: parseInt(newWidth),
          height: visibleArea.height,
        }
      },
      ({ coordinates }) => ({
        left: center.left - coordinates.width / 2,
        top: center.top - coordinates.height / 2,
      }),
    ]);
  }
}

const onHeightChanged = (newHeight: string) => {
  if (props.cropper) {
    const center = {
      left: props.cropper.coordinates.left + props.cropper.coordinates.width / 2,
      top: props.cropper.coordinates.top + props.cropper.coordinates.height / 2,
    };

    props.cropper.setCoordinates([
      ({ visibleArea }) => {
        return {
          width: visibleArea.width,
          height: parseInt(newHeight),
        }
      },
      ({ coordinates }) => ({
        left: center.left - coordinates.width / 2,
        top: center.top - coordinates.height / 2,
      }),
    ]);
  }
}

watchEffect(() => {
  width.value = props.settings?.stencilWidth ? `${props.settings?.stencilWidth}` : null
  height.value = props.settings?.stencilHeight ? `${props.settings?.stencilHeight}` : null
})

watchEffect(() => {
  shouldCrop.value = props.settings?.shouldCrop ?? true
  aspectRatio.value = props.settings?.aspectRatio ?? 1
})
</script>

<template>
  <Flex class="crop-toolbar" gap="4" :vertical="!horizontal">
    <FlexCell :class="{ 'min-w-44': isWiderThan(screen, 641), 'min-w-40': !isWiderThan(screen, 641) }">
      <Flex gap="4" vertical>
        <FlexCell>
          <Flex gap="2" vertical>
            <FlexCell>
              <Label size="xs" uppercase semi-bold>{{ t('shared.components.molecules.imageEditor.cropToolbar.enable') }}</Label>
            </FlexCell>

            <FlexCell>
              <Switch :model-value="shouldCrop" @update:modelValue="onShouldCropChanged" />
            </FlexCell>
          </Flex>
          
        </FlexCell>

        <FlexCell v-if="shouldCrop">
          <Flex gap="2" vertical>
            <FlexCell>
              <Label size="xs" uppercase semi-bold>{{ t('shared.components.molecules.imageEditor.cropToolbar.zoom') }}</Label>
            </FlexCell>

            <FlexCell>
              <Flex gap="2" wrap>
                <FlexCell>
                  <Button
                    class="p-1"
                    :title="t('shared.components.molecules.imageEditor.cropToolbar.zoomIn')"
                    @click="onZoomInClicked()"
                  >
                    <Icon name="magnifying-glass-plus" />
                  </Button>
                </FlexCell>

                <FlexCell>
                  <Button
                    class="p-1"
                    :title="t('shared.components.molecules.imageEditor.cropToolbar.zoomOut')"
                    @click="onZoomOutClicked()"
                  >
                    <Icon name="magnifying-glass-minus" />
                  </Button>
                </FlexCell>
              </Flex>
            </FlexCell>
          </Flex>
        </FlexCell>
      </Flex>
    </FlexCell>

    <FlexCell v-if="shouldCrop">
      <Flex gap="4" vertical>
        <FlexCell>
          <Flex gap="2" vertical>
            <FlexCell>
              <Label size="xs" uppercase semi-bold>{{ t('shared.components.molecules.imageEditor.cropToolbar.stencil') }}</Label>
            </FlexCell>

            <FlexCell>
              <Flex gap="2">
                <FlexCell>
                  <TextInput
                    :placeholder="t('shared.components.molecules.imageEditor.cropToolbar.stencilWidth')"
                    class="w-full bg-gray-100 text-gray-400"
                    v-model="width"
                    @update:modelValue="onWidthChanged"
                    disabled
                  />
                </FlexCell>

                <FlexCell center>X</FlexCell>

                <FlexCell>
                  <TextInput
                    :placeholder="t('shared.components.molecules.imageEditor.cropToolbar.stencilHeight')"
                    class="w-full bg-gray-100 text-gray-400"
                    v-model="height"
                    @update:modelValue="onHeightChanged"
                    disabled
                  />
                </FlexCell>
              </Flex>
            </FlexCell>

            <FlexCell>
              <Flex gap="2" wrap>
                <FlexCell>
                  <Button
                    class="p-1"
                    :title="t('shared.components.molecules.imageEditor.cropToolbar.maximize')"
                    @click="onMaximizeClicked()"
                  >
                    <Icon name="maximize" />
                  </Button>
                </FlexCell>

                <FlexCell>
                  <Button
                    class="p-1"
                    :title="t('shared.components.molecules.imageEditor.cropToolbar.minimize')"
                    @click="onMinimizeClicked()"
                  >
                    <Icon name="minimize" />
                  </Button>
                </FlexCell>
              </Flex>
            </FlexCell>
          </Flex>
        </FlexCell>

        <FlexCell>
          <Flex gap="2" vertical>
            <FlexCell>
              <Label size="xs" uppercase semi-bold>{{ t('shared.components.molecules.imageEditor.cropToolbar.aspectRatio') }}</Label>
            </FlexCell>

            <FlexCell>
              <Selector
                value-by="id"
                label-by="name"
                v-model="aspectRatio"
                :options="aspectRatios"
                @update:modelValue="newAspectRatio => $emit('changed', 'crop', { aspectRatio: newAspectRatio })"
              />
            </FlexCell>
          </Flex>
        </FlexCell>
      </Flex>
    </FlexCell>

    <FlexCell :class="{ 'min-w-44': isWiderThan(screen, 641), 'min-w-40': !isWiderThan(screen, 641) }" v-if="shouldCrop">
      <Flex vertical>
        <FlexCell>
          <Flex gap="2" vertical>
            <FlexCell>
              <Label size="xs" uppercase semi-bold>{{ t('shared.components.molecules.imageEditor.cropToolbar.rotation') }}</Label>
            </FlexCell>

            <FlexCell>
              <Flex gap="2" wrap>
                <FlexCell>
                  <Button
                    class="p-1"
                    :title="t('shared.components.molecules.imageEditor.cropToolbar.rotateLeft')"
                    @click="onRotateLeftClicked()"
                  >
                    <Icon name="rotate-left" />
                  </Button>
                </FlexCell>

                <FlexCell>
                  <Button
                    class="p-1"
                    :title="t('shared.components.molecules.imageEditor.cropToolbar.rotateRight')"
                    @click="onRotateRightClicked()"
                  >
                    <Icon name="rotate-right" />
                  </Button>
                </FlexCell>
              </Flex>
            </FlexCell>
          </Flex>
        </FlexCell>

        <FlexCell>
          <Flex gap="2" vertical>
            <FlexCell>
              <Label size="xs" uppercase semi-bold>{{ t('shared.components.molecules.imageEditor.cropToolbar.flip') }}</Label>
            </FlexCell>

            <FlexCell>
              <Flex gap="2" wrap>
                <FlexCell>
                  <Button
                    class="p-1"
                    :title="t('shared.components.molecules.imageEditor.cropToolbar.flipHorizontal')"
                    @click="onFlipHorizontallyClicked()"
                  >
                    <Icon name="arrows-left-right-to-line" />
                  </Button>
                </FlexCell>

                <FlexCell>
                  <Button
                    class="p-1"
                    :title="t('shared.components.molecules.imageEditor.cropToolbar.flipVertical')"
                    @click="onFlipVerticallyClicked()"
                  >
                    <Icon name="arrows-left-right-to-line" rotation="90" />
                  </Button>
                </FlexCell>
              </Flex>
            </FlexCell>
          </Flex>
        </FlexCell>
      </Flex>
    </FlexCell>
  </Flex>
</template>