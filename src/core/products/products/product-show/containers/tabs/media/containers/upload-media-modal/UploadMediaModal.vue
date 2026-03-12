<script setup lang="ts">

import { ref, watch} from 'vue';
import { Modal } from '../../../../../../../../../shared/components/atoms/modal';
import { mediaQuery } from "../../../../../../../../../shared/api/queries/media.js";
import FilesList from "../../../../../../../../media/files/containers/FilesList.vue";
import { SearchConfig } from "../../../../../../../../../shared/components/organisms/general-search/searchConfig";
import { useI18n } from "vue-i18n";
import apolloClient from "../../../../../../../../../../apollo-client";
import { createMediaProductThroughMutation, createMediaProductThroughsMutation } from "../../../../../../../../../shared/api/mutations/media.js";
import { processGraphQLErrors } from "../../../../../../../../../shared/utils";
import { Toast } from "../../../../../../../../../shared/modules/toast";


const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    productId?: string;
    ids?: any[];
    linkOnSelect?: boolean;
    salesChannelId?: string;
    mediaType?: string;
  }>(),
  {
    ids: () => [],
    linkOnSelect: true,
  }
);
const emit = defineEmits(['update:modelValue', 'entries-created']);
const localShowModal = ref(props.modelValue);
const modalSessionKey = ref(0);

const { t } = useI18n();

const searchConfig: SearchConfig = {
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
};

const queryKey = 'medias';
const defaultView = 'gallery'

watch(() => props.modelValue, (newVal, oldVal) => {
  localShowModal.value = newVal;
  if (newVal && !oldVal) {
    modalSessionKey.value += 1;
  }
});

const closeModal = () => {
  localShowModal.value = false;
  emit('update:modelValue', false);
};

const buildMediaProductThroughInput = (mediaId: string) => {
  const variables: any = {
    product: { id: props.productId },
    media: { id: mediaId },
  };
  if (props.salesChannelId) {
    variables.salesChannel = { id: props.salesChannelId };
  }
  return variables;
};

const handleMediaAssign = async (media) => {
  if (!props.linkOnSelect || !props.productId) {
    emit('entries-created', media);
    closeModal();
    return;
  }

  try {
    const { data } = await apolloClient.mutate({
      mutation: createMediaProductThroughMutation,
      variables: { data: buildMediaProductThroughInput(media.id) }
    });
    emit('entries-created', data?.createMediaProductThrough ?? media);
    closeModal();
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    if (validationErrors['__all__']) {
      Toast.error(validationErrors['__all__']);
    }
    console.error('Failed to link media and product:', error);
  }
};

const handleMediaAssignMultiple = async (medias: any[]) => {
  const selectedMedias = Array.isArray(medias) ? medias.filter((media) => media?.id) : [];
  if (!selectedMedias.length) {
    return;
  }

  if (!props.linkOnSelect || !props.productId) {
    emit('entries-created', selectedMedias);
    closeModal();
    return;
  }

  try {
    const { data } = await apolloClient.mutate({
      mutation: createMediaProductThroughsMutation,
      variables: { data: selectedMedias.map((media) => buildMediaProductThroughInput(media.id)) }
    });
    emit('entries-created', data?.createMediaProductThroughs ?? selectedMedias);
    closeModal();
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    if (validationErrors['__all__']) {
      Toast.error(validationErrors['__all__']);
    }
    console.error('Failed to link media and product:', error);
  }
};

</script>

<template>
  <div>
    <Modal v-model="localShowModal" @closed="closeModal" >
      <div class="w-[90vw] max-w-7xl">
        <FilesList
           :key="modalSessionKey"
           :search-config="searchConfig"
           :list-query="mediaQuery"
           :query-key="queryKey"
           :default-view-type="defaultView"
           :label="t('media.media.labels.files')"
           :ids="ids"
           :fixed-media-type="mediaType"
           :assign-images="true"
           :allow-multi-assign="true"
           @assign-media="handleMediaAssign"
           @assign-medias="handleMediaAssignMultiple"
          />
      </div>
    </Modal>
  </div>
</template>
