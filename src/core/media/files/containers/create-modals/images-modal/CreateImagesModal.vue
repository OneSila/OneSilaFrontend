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
import { createImagesMutation, createMediaProductThroughMutation } from "../../../../../../shared/api/mutations/media.js"
import { Toast } from "../../../../../../shared/modules/toast";
import { IMAGE_TYPE_MOOD, IMAGE_TYPE_PACK } from "../../../media";
import { processGraphQLErrors } from "../../../../../../shared/utils";

const props = defineProps<{ modelValue: boolean; productId?: string }>();
const emit = defineEmits(['update:modelValue', 'entries-created']);
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
  { label: t('media.images.labels.moodShot'), value: IMAGE_TYPE_MOOD }
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

  let variables: Image[] = [];
  images.value.forEach(image => {
    variables.push({image: image.file, imageType: image.type});
  });

  const {data} = await apolloClient.mutate({
    mutation: createImagesMutation,
    variables: { data: variables }

  });

  if (data && data.createImages) {
      if (props.productId) {
        for (const image of data.createImages) {
          const variables = {
            product: {id: props.productId},
            media: {id: image.id},
          };
          try {
            const { data } = await apolloClient.mutate({
              mutation: createMediaProductThroughMutation,
              variables: { data: variables }
            });
            Toast.success(t('media.images.create.successfullyCreated'));
          } catch (error) {
            const validationErrors = processGraphQLErrors(error, t);
            if (validationErrors['__all__']) {
              Toast.error(validationErrors['__all__']);
            }
            console.error('Failed to link video and product:', error);
          }
        }
    }

    emit('entries-created');
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
        <DropZone ref="dropZone" class="mt-2" :formats="['.jpg', '.png', '.jpeg']" @uploaded="onUploaded" />
        <div class="gallery mt-2 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
          <div v-for="(image, index) in images" :key="index" class="file-entry relative w-full h-full border border-gray-300 p-2 rounded-lg">
            <Flex vertical class="w-full">
              <FlexCell>
                <div class="w-full h-48 overflow-hidden flex justify-center items-center">
                  <Image :source="image.url" alt="File thumbnail" class="h-full object-contain rounded-md" />
                </div>
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