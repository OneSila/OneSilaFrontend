<script setup lang="ts">
import { Icon } from "../../atoms/icon";
import { Button } from "../../atoms/button";
import {computed, ref} from "vue";
import { UploadNewFile } from "./containers/upload-new-image";
import {useI18n} from "vue-i18n";

const emit = defineEmits(['update:model-value']);
const { t } = useI18n();

const props = defineProps<{ modelValue?: File | null }>();
const file = ref(props.modelValue);
const uploadNewFileVisible = ref(false);

const fileName = computed(() => {
  if (!file.value) return t('media.documents.uploadDocument');
  return file.value.name.split(/(\\|\/)/g).pop();
});

const handleFileAdded = (addedFile) => {
  file.value = addedFile;
  emit('update:model-value', file.value);
}

const clearFile = () => {
  handleFileAdded(null)
};

const openModal = () => {
  uploadNewFileVisible.value = true;
};

if (file.value) {
  // we do that because strawberry django have a bug where if we use update mutation with initial data it will error so we need to exclude it
  const exitentFile = { ...file.value, notUpdated: true };
  handleFileAdded(exitentFile)
}

</script>

<template>
  <div>
    <div v-if="file === null" class="relative p-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer" @click="openModal">
      <Flex center between>
        <FlexCell grow>
          <div class="file-info flex items-center">
            <Icon name="plus" size="xl" class="text-gray-600" />
            <span class="ml-2 text-gray-600">{{ fileName }}</span>
          </div>
        </FlexCell>
      </Flex>
    </div>

    <div v-else class="relative p-2 border border-gray-300 rounded-md bg-gray-100">
      <Button @click="clearFile" class="absolute top-0 right-0 p-1">
        <Icon name="circle-xmark" class="text-gray-600" />
      </Button>

      <Flex center between>
        <FlexCell grow>
          <div class="file-info flex items-center">
            <Icon name="file-text" size="2xl" class="text-gray-600" />
            <span class="mx-2 text-gray-600">{{ fileName }}</span>

            <Button @click="openModal">
              <Icon name="arrows-rotate" class="mr-4" />
            </Button>
          </div>
        </FlexCell>
      </Flex>
    </div>

    <UploadNewFile v-model="uploadNewFileVisible" @entry-created="handleFileAdded" />
  </div>
</template>

<style scoped>

.file-info {
  padding: 10px;
}

</style>