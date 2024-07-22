<script setup lang="ts">
import { Ref, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDropzone } from 'vue3-dropzone'
import { Icon } from '../../atoms/icon'
import { BullettedList } from '../bulletted-list'
import { Toast } from '../../../modules/toast';

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    multiple?: boolean;
    addFromOutside?: boolean;
    formats?: string[]; }>(),
  { multiple: true },
);
const emit = defineEmits<{
  (e: 'uploaded', files: any[]): void,
}>()

const { t } = useI18n()

const selectedFiles: Ref<any[]> = ref([])

const onDropped = (acceptedFiles: any[], rejectedFiles: any[]) => {
  if (rejectedFiles.length > 0) {
    rejectedFiles.forEach((rejectedFile) => {
      Toast.error(t('shared.dropZone.singleDraggingInstruction'))
    });
  }

  selectedFiles.value = acceptedFiles
  emit('uploaded', acceptedFiles)
}

const clear = () => {
  selectedFiles.value = []
}

defineExpose({
  clear
})

const getUploadedFileLabels = () => selectedFiles.value.map((file: File) => file.name)

const { getRootProps, getInputProps, isDragActive }: any = useDropzone({
  onDrop: onDropped,
  accept: props.formats,
  multiple: props.multiple
})
</script>

<template>
  <div>
    <div v-if="addFromOutside">
      <input v-bind="getInputProps()" />
      <slot name="uploadArea"></slot>
    </div>
    <div v-else>
      <Flex class="drop-zone border-dashed border-2 border-gray-600 rounded-lg cursor-pointer py-6 bg-white" v-bind="getRootProps()" center>
        <FlexCell>
          <input v-bind="getInputProps()" />
          <Flex class="text-black" gap="2" center vertical>
            <FlexCell v-if="!loading">
              <Icon name="upload" size="2x" />
            </FlexCell>

            <FlexCell v-if="selectedFiles.length && !multiple">
              <BullettedList :items="getUploadedFileLabels()" />
            </FlexCell>

            <FlexCell v-if="(!selectedFiles.length || multiple) && !loading">
              <span v-if="isDragActive">{{ multiple ? t('shared.dropZone.multipleDraggingInstruction') : t('shared.dropZone.singleDraggingInstruction') }}</span>
              <span v-else>{{ multiple ? t('shared.dropZone.multipleInstruction') : t('shared.dropZone.singleInstruction') }}</span>
            </FlexCell>
          </Flex>
        </FlexCell>
      </Flex>
    </div>
    <div v-if="loading">
      <Flex gap="2" center>
        <FlexCell>
          <Icon name="circle-notch" size="2x" spin />
        </FlexCell>
        <FlexCell class="mt-1">{{ t('shared.labels.uploading') }}</FlexCell>
      </Flex>
    </div>
  </div>
</template>
