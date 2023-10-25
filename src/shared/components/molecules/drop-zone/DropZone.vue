<script setup lang="ts">
import { Ref, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDropzone } from 'vue3-dropzone'
import { Icon } from '../../atoms/icon'
import { BullettedList } from '../bulletted-list'
import { Toast } from '../../../modules/toast';

const props = defineProps<{ loading?: boolean; multiple?: boolean; formats?: string[]; }>()

const emit = defineEmits<{
  (e: 'uploaded', files: any[]): void,
}>()

const { t } = useI18n()

const selectedFiles: Ref<any[]> = ref([])

const onDropped = (acceptedFiles: any[], rejectedFiles: any[]) => {
  if (rejectedFiles.length > 0) {
    rejectedFiles.forEach((rejectedFile) => {
        console.log(rejectedFile);
      Toast.error(
        t('products.limitedProduct.technicalFiles.errors.notAllowed', {
          file: rejectedFile.file.name,
        }),
      );
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
})
</script>

<template>
  <Flex class="drop-zone border-dashed border-4 border-gray-400 rounded-lg cursor-pointer py-6 bg-gray-100" v-bind="getRootProps()" center>
    <FlexCell>
      <input v-bind="getInputProps()" />
      <Flex class="text-gray-500" gap="2" center vertical>
        <FlexCell v-if="!loading">
          <Icon name="upload" size="2x" />
        </FlexCell>

        <FlexCell v-if="selectedFiles.length && !multiple">
          <BullettedList :items="getUploadedFileLabels()"  />
        </FlexCell>

        <FlexCell v-if="(!selectedFiles.length || multiple) && !loading">
          <span v-if="isDragActive">{{ multiple ? t('shared.components.molecules.dropZone.multipleDraggingInstruction') : t('shared.components.molecules.dropZone.singleDraggingInstruction') }}</span>
          <span v-else>{{ multiple ? t('shared.components.molecules.dropZone.multipleInstruction') : t('shared.components.molecules.dropZone.singleInstruction') }}</span>
        </FlexCell>

        <FlexCell v-if="loading">
          <Flex gap="2" center>
            <FlexCell>
              <Icon name="circle-notch" size="2x" spin />
            </FlexCell>

            <FlexCell class="mt-1">{{ t('shared.labels.uploading') }}</FlexCell>
          </Flex>
        </FlexCell>
      </Flex>
    </FlexCell>
  </Flex>
</template>
