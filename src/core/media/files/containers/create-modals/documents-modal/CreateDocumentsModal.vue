<script setup lang="ts">
import {Ref, ref, watch} from 'vue';
import { Modal } from '../../../../../../shared/components/atoms/modal';
import { Card } from '../../../../../../shared/components/atoms/card';
import { Icon } from '../../../../../../shared/components/atoms/icon';
import { DropZone } from "../../../../../../shared/components/molecules/drop-zone";
import { useI18n } from "vue-i18n";
import { Button } from "../../../../../../shared/components/atoms/button";
import apolloClient from "../../../../../../../apollo-client";
import {createFilesMutation, createMediaProductThroughMutation} from "../../../../../../shared/api/mutations/media.js"
import {Toast} from "../../../../../../shared/modules/toast";

const props = defineProps<{ modelValue: boolean; productId?: string }>();
const emit = defineEmits(['update:modelValue', 'entries-created']);
const localShowModal = ref(props.modelValue);

const { t } = useI18n();

type Document = {
    file: File;
    type?: string
};

const documents: Ref<Document[]> = ref([])
const dropZone: Ref<any> = ref(null)

watch(() => props.modelValue, (newVal) => {
  localShowModal.value = newVal;
});

const closeModal = () => {
  localShowModal.value = false;
  documents.value = [];
  emit('update:modelValue', false);
};

const onUploaded = (files: File[]) => {
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      documents.value.push({file: file});
    };
    reader.readAsDataURL(file);
  });
  dropZone.value?.clear();
};

const removeImage = (index) => {
  documents.value.splice(index, 1);
};

const updateImageType = (index, type) => {
  documents.value[index].type = type;
};

const submitImages = async () => {

  const variables: Document[] = [];
  documents.value.forEach(document => {
    variables.push({file: document.file});
  });

  const {data} = await apolloClient.mutate({
    mutation: createFilesMutation,
    variables: {data: variables}

  });

  if (data && data.createFiles) {

    if (props.productId) {
      for (const file of data.createFiles) {
        const variables = {
          product: {id: props.productId},
          media: {id: file.id},
        };
        try {
          const {data} = await apolloClient.mutate({
            mutation: createMediaProductThroughMutation,
            variables: { data: variables }
          });
          console.log('Linking success:', data);
        } catch (error) {
          console.error('Failed to link video and product:', error);
        }
      }
    }

    emit('entries-created');
    Toast.success(t('media.documents.create.successfullyCreated'));
    closeModal();
  }

};

</script>

<template>
  <div>
    <Modal v-model="localShowModal" @closed="closeModal">
      <Card class="modal-content w-2/3">
        <div class="mb-4">
          <h3 class="text-xl font-semibold leading-7 text-gray-900">{{ t('media.documents.upload') }}</h3>
        </div>
        <DropZone ref="dropZone" class="mt-2" :formats="['.pdf', '.xlsx', '.xls', '.docx', '.doc']" @uploaded="onUploaded" />
        <div class="gallery mt-2 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
          <div v-for="(document, index) in documents" :key="index" class="file-entry relative w-full h-full border border-gray-300 p-2 rounded-lg">
            <Flex vertical class="w-full">
              <FlexCell>
                <div class="flex justify-center items-center h-48">
                    <Icon :name="'file-text'" size="2xl" class="text-gray-600"/>
                </div>
              </FlexCell>
              <FlexCell>
                <Flex between class="mt-2">
                  <FlexCell grow>
                     <div></div>
                  </FlexCell>
                  <FlexCell center >
                      <Button>
                        <Icon name="trash" @click="removeImage(index)" />
                      </Button>
                  </FlexCell>
                </Flex>

              </FlexCell>
            </Flex>

          </div>
        </div>

        <div class="flex justify-end gap-4 mt-4">
          <Button class="btn btn-outline-dark" @click="closeModal">{{ t('shared.button.cancel') }}</Button>
          <Button class="btn btn-primary" :disabled="documents.length === 0" @click="submitImages">{{ t('shared.button.submit') }}</Button>
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