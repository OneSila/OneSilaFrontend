<script setup lang="ts">
import {Ref, ref, watch} from 'vue';
import { Modal } from '../../../../../../shared/components/atoms/modal';
import { useI18n } from "vue-i18n";
import FilesList from "../../../../../../core/media/files/containers/FilesList.vue";
import {SearchConfig} from "../../../general-search/searchConfig";
import {imageQuery} from "../../../../../api/queries/media.js";
import apolloClient from "../../../../../../../apollo-client";

const props = defineProps<{ modelValue: boolean; }>();
const emit = defineEmits(['update:modelValue', 'entry-created']);
const localShowModal = ref(props.modelValue);

const { t } = useI18n();

const searchConfig: SearchConfig = {
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
};

const queryKey = 'images';
const defaultView = 'gallery'

watch(() => props.modelValue, (newVal) => {
  localShowModal.value = newVal;
});

const closeModal = () => {
  localShowModal.value = false;
  emit('update:modelValue', false);
};

const handleMediaAssign = async (image) => {

  const img = {
    id: image.id,
    imageWebUrl: image.imageWebUrl
  }
  emit('entry-created', img)
  closeModal();
};

</script>

<template>
  <div>
    <Modal v-model="localShowModal" @closed="closeModal" >
      <div class="w-2/3">
        <FilesList :search-config="searchConfig"
           :list-query="imageQuery"
           :query-key="queryKey"
           :default-view-type="defaultView"
           :label="t('media.media.labels.images')"
           :assign-images="true"
           @assign-media="handleMediaAssign"
          />
      </div>
    </Modal>
  </div>
</template>