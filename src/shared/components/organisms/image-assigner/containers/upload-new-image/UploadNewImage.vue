<script setup lang="ts">
import {Ref, ref, watch} from 'vue';
import { Modal } from '../../../../../../shared/components/atoms/modal';
import { Card } from '../../../../../../shared/components/atoms/card';
import { Icon } from '../../../../../../shared/components/atoms/icon';
import { Selector } from '../../../../../../shared/components/atoms/selector';
import { DropZone } from "../../../../../../shared/components/molecules/drop-zone";
import { useI18n } from "vue-i18n";
import { Image } from "../../../../../../shared/components/atoms/image";
import { Button } from "../../../../../../shared/components/atoms/button";
import apolloClient from "../../../../../../../apollo-client";
import { createImageMutation } from "../../../../../../shared/api/mutations/media.js"
import {Toast} from "../../../../../../shared/modules/toast";
import { IMAGE_TYPE_COLOR, IMAGE_TYPE_MOOD, IMAGE_TYPE_PACK } from "../../../../../../core/media/files/media";

const props = defineProps<{ modelValue: boolean; }>();
const emit = defineEmits(['update:modelValue', 'entry-created']);
const localShowModal = ref(props.modelValue);

const { t } = useI18n();

type UploadedImage = File;

type ShowImage = {
    file: any;
    url?: any;
    type: string;
};

type Image = {
    image: File;
    imageType: string
};

const images: Ref<ShowImage[]> = ref([])
const dropZone: Ref<any> = ref(null)

const imageTypeOptions = [
  { label: t('media.images.labels.packShot'), value: IMAGE_TYPE_PACK },
  { label: t('media.images.labels.moodShot'), value: IMAGE_TYPE_MOOD },
  { label: t('media.images.labels.colorShot'), value: IMAGE_TYPE_COLOR }
];

watch(() => props.modelValue, (newVal) => {
  localShowModal.value = newVal;
});

const closeModal = () => {
  localShowModal.value = false;
  images.value = [];
  emit('update:modelValue', false);
};

const onUploaded = (files: UploadedImage[]) => {
  images.value = [];
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      images.value.push({ url: e?.target?.result, type: IMAGE_TYPE_PACK, file });
    };
    reader.readAsDataURL(file);
  });
  dropZone.value?.clear();
};

const removeImage = (index) => {
  images.value.splice(index, 1);
};

const updateImageType = (index, type) => {
  images.value[index].type = type;
};

const submitImages = async () => {


  const {data} = await apolloClient.mutate({
    mutation: createImageMutation,
    variables: {data: {
         image: images.value[0].file,
         imageType: images.value[0].type,
      }}

  });

  if (data && data.createImage) {
    emit('entry-created', data.createImage);
    Toast.success(t('media.images.create.successfullyCreated'));
    closeModal();
  }

};

</script>

<template>
  <div>
    <Modal v-model="localShowModal" @closed="closeModal">
      <Card class="modal-content w-2/3">
        <div class="mb-4">
          <h3 class="text-xl font-semibold leading-7 text-gray-900">{{ t('media.images.upload') }}</h3>
        </div>
        <DropZone ref="dropZone" class="mt-2" :formats="['.jpg', '.png', '.jpeg']" @uploaded="onUploaded" :multiple="false" />
        <div class="gallery mt-2 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
          <div v-for="(image, index) in images" :key="index" class="file-entry relative w-full h-full border border-gray-300 p-2 rounded-lg">
            <Flex vertical class="w-full">
              <FlexCell>
                <Image :source="image.url" alt="File thumbnail" class="w-full h-48" />
              </FlexCell>
              <FlexCell>
                <Flex between class="mt-2">
                  <FlexCell grow>
                     <Selector
                      :model-value="image.type"
                      @update:model-value="updateImageType(index, $event)"
                      :options="imageTypeOptions"
                      :mandatory="true"
                      :removable="false"
                      :label-by="'label'"
                      :value-by="'value'"
                      :placeholder="t('media.images.placeholders.imageType')"
                      :dropdown-position="'bottom'"
                      class="pr-2"
                    />
                  </FlexCell>
                  <FlexCell center >
                      <Icon name="trash" @click="removeImage(index)" />
                  </FlexCell>
                </Flex>

              </FlexCell>
            </Flex>

          </div>
        </div>

        <div class="flex justify-end gap-4 mt-4">
          <Button class="btn btn-outline-dark" @click="closeModal">{{ t('shared.button.cancel') }}</Button>
          <Button class="btn btn-primary" :disabled="images.length === 0" @click="submitImages">{{ t('shared.button.submit') }}</Button>
        </div>
      </Card>
    </Modal>
  </div>
</template>

<style scoped>
.gallery .file-entry:hover .overlay-info {
    display: block;
}

.gallery {
    display: grid;
    grid-gap: 4px;
    padding: 4px;
}

.file-entry {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
