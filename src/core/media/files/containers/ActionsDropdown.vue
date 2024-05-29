<script lang="ts" setup>

import { ref } from "vue";
import { Icon } from '../../../../shared/components/atoms/icon';
import { useI18n } from "vue-i18n";
import { Button } from "../../../../shared/components/atoms/button";
import { Toast } from "../../../../shared/modules/toast";
import { deleteFileMutation, deleteImageMutation, deleteVideoMutation } from "../../../../shared/api/mutations/media.js";
import apolloClient from "../../../../../apollo-client";
import Swal, {SweetAlertOptions} from "sweetalert2";
import { useRouter } from 'vue-router';
import { TYPE_DOCUMENT, TYPE_IMAGE, TYPE_VIDEO} from "../media";

const router = useRouter();
const props = defineProps<{ id: string; type: string; dark?: boolean ; item: any}>();
const emit = defineEmits(['trigger-refetch']);

const { t } = useI18n();


const dropdownVisible = ref(false);
const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;
};

const handleEntryDeleted = () => {
  emit('trigger-refetch');
};

const defaultSwalOptions = {
  title: t('shared.alert.mutationAlert.title'),
  text: t('shared.alert.mutationAlert.text'),
  confirmButtonText: t('shared.alert.mutationAlert.confirmButtonText'),
  cancelButtonText: t('shared.alert.mutationAlert.cancelButtonText'),
  icon: 'warning',
  showCancelButton: true,
  reverseButtons: true,
  padding: '2em'
};

const defaultSwalClasses = {
  popup: 'sweet-alerts',
  confirmButton: 'btn btn-secondary',
  cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3'
}

const getPath = () => {
  const routeName = getRouteName();
  return { name: routeName, params: { id: props.id }, query: {editView: 1} };
};

const getRouteName = () => {
  switch (props.type) {
    case TYPE_IMAGE:
      return 'media.images.show';
    case TYPE_VIDEO:
      return 'media.videos.show';
    default:
      throw 'Wrong routes';
  }
};

const goToEditPage = async () => {
  router.push(getPath());
}
const deleteEntry = async (close) => {

    close();
    const swalWithBootstrapButtons = Swal.mixin({
    customClass: defaultSwalClasses,
    buttonsStyling: false
  });

  const result = await swalWithBootstrapButtons.fire(defaultSwalOptions as SweetAlertOptions);

  if (!result.isConfirmed) {
    return;
  }

  let mutation;
  let successMessage;

  switch (props.type) {
    case TYPE_IMAGE:
      mutation = deleteImageMutation;
      successMessage = t('media.images.delete.successfullyDeleted');
      break;
    case TYPE_VIDEO:
      mutation = deleteVideoMutation;
      successMessage = t('media.videos.delete.successfullyDeleted');
      break;
    case TYPE_DOCUMENT:
      mutation = deleteFileMutation;
      successMessage = t('media.documents.delete.successfullyDeleted');
      break;
    default:
      console.error('Unknown type');
      return;
  }

  try {
    const { data } = await apolloClient.mutate({
      mutation: mutation,
      variables: { id: props.id }
    });

    if (data) {
      emit('trigger-refetch');
      Toast.success(successMessage);
      toggleDropdown();
    }
  } catch (error) {
    Toast.error(t('shared.alert.toast.deletionFailed'));
  }
};

const getDownloadLink = () => {

  if (props.type === TYPE_IMAGE && props.item.imageWebUrl) {
    return props.item.imageWebUrl;
  } else if (props.type === TYPE_DOCUMENT && props.item.fileUrl) {
    return props.item.fileUrl;
  }
  return '#';
};

const getName = () => {
  if (props.type === TYPE_IMAGE && props.item.image) {
    return props.item.imageWebUrl.image.name;
  } else if (props.type === TYPE_DOCUMENT && props.item.file) {
    return props.item.fileUrl.file.name;
  }
  return '#';
};

const downloadResource = (close) => {
  close();
  const url = getDownloadLink();

  if (new URL(url).origin !== window.location.origin) {

    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', getName());
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(e => console.error('Download failed:', e));
  } else {
    window.location.href = url;
  }
};

</script>

<template>
  <div>
      <Popper :placement="'bottom'" >
        <Button
            @click="toggleDropdown"
            :class="{
              'inline-flex text-slate-700 hover:bg-slate-100 rounded-full p-2': !props.dark,
              'inline-flex dark:text-white hover:bg-gray-600 rounded-full p-2': props.dark,
            }">
          <Icon name="ellipsis-vertical" />
        </Button>
        <template #content="{ close }">
          <ul class="text-dark dark:text-white-dark !py-0 dark:text-white-light/90 bg-white border border-gray-300 rounded-md">
            <li v-if="type !== TYPE_DOCUMENT">
              <Button class="flex items-center w-full px-4 py-2 hover:bg-gray-100" @click="goToEditPage">
                <Icon name="edit" class="w-4.5 h-4.5 mr-2 shrink-0" />
                {{ t('shared.button.edit') }}
              </Button>
            </li>
            <li v-if="type !== TYPE_VIDEO">
              <Button class="flex items-center w-full px-4 py-2 hover:bg-gray-100" @click="downloadResource(close)">
                <Icon name="download" class="w-4.5 h-4.5 mr-2 shrink-0" />
                {{ t('shared.button.download') }}
              </Button>
            </li>
            <li>
              <Button class="flex items-center w-full px-4 py-2 hover:bg-gray-100" @click="deleteEntry(close)">
                <Icon name="trash" class="w-4.5 h-4.5 mr-2 shrink-0" />
                {{ t('shared.button.delete') }}
              </Button>
            </li>
          </ul>
        </template>
      </Popper>
  </div>
</template>
