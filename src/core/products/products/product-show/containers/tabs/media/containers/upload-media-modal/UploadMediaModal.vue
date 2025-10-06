<script setup lang="ts">

import { ref, watch} from 'vue';
import { Modal } from '../../../../../../../../../shared/components/atoms/modal';
import { mediaQuery } from "../../../../../../../../../shared/api/queries/media.js";
import FilesList from "../../../../../../../../media/files/containers/FilesList.vue";
import { SearchConfig } from "../../../../../../../../../shared/components/organisms/general-search/searchConfig";
import { useI18n } from "vue-i18n";
import apolloClient from "../../../../../../../../../../apollo-client";
import { createMediaProductThroughMutation } from "../../../../../../../../../shared/api/mutations/media.js";
import { processGraphQLErrors } from "../../../../../../../../../shared/utils";
import { Toast } from "../../../../../../../../../shared/modules/toast";


const props = withDefaults(
  defineProps<{ modelValue: boolean; productId?: string; ids?: any[]; linkOnSelect?: boolean; salesChannelId?: string }>(),
  {
    ids: () => [],
    linkOnSelect: true,
  }
);
const emit = defineEmits(['update:modelValue', 'entries-created']);
const localShowModal = ref(props.modelValue);

const { t } = useI18n();

const searchConfig: SearchConfig = {
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
};

const queryKey = 'medias';
const defaultView = 'gallery'

watch(() => props.modelValue, (newVal) => {
  localShowModal.value = newVal;
});

const closeModal = () => {
  localShowModal.value = false;
  emit('update:modelValue', false);
};

const handleMediaAssign = async (media) => {
  if (!props.linkOnSelect || !props.productId) {
    emit('entries-created', media);
    closeModal();
    return;
  }

  const variables: any = {
    product: { id: props.productId},
    media: { id: media.id},
  };
  if (props.salesChannelId) {
    variables.salesChannel = { id: props.salesChannelId };
  }
  try {
    const {data} = await apolloClient.mutate({
      mutation: createMediaProductThroughMutation,
      variables: { data: variables }
    });
    emit('entries-created', data?.createMediaProductThrough ?? media)
    console.log('Linking success:', data);
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    if (validationErrors['__all__']) {
      Toast.error(validationErrors['__all__']);
    }
    console.error('Failed to link video and product:', error);
  }

  closeModal();
};

</script>

<template>
  <div>
    <Modal v-model="localShowModal" @closed="closeModal" >
      <div class="w-2/3">
        <FilesList :search-config="searchConfig"
           :list-query="mediaQuery"
           :query-key="queryKey"
           :default-view-type="defaultView"
           :label="t('media.media.labels.files')"
           :ids="ids"
           :assign-images="true"
           @assign-media="handleMediaAssign"
          />
      </div>
    </Modal>
  </div>
</template>