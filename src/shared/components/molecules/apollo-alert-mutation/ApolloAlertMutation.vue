<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import { SweetAlertOptions } from 'sweetalert2';
import { Toast } from "../../../modules/toast";
import {displayApolloError} from "../../../utils";

interface SwalOptions {
  title?: string;
  text?: string;
  icon?: string;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  reverseButtons?: boolean;
  padding?: string;
}

const { t } = useI18n();

const props = defineProps<{ mutation: object | string; mutationVariables?: object; refetchQueries?: Function; swalOptions?: SwalOptions; swalClasses?: SwalClasses  }>();

interface SwalClasses {
  popup?: string;
  confirmButton?: string;
  cancelButton?: string;
}

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

const confirmAndMutate = async (mutate) => {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: { ...defaultSwalClasses, ...props.swalClasses },
    buttonsStyling: false
  });

  const result = await swalWithBootstrapButtons.fire({ ...defaultSwalOptions, ...props.swalOptions } as SweetAlertOptions);

  if (result.isConfirmed) {
    await mutate();
  }
};

const emit = defineEmits(['done']);

const handleDone = (result) => {
  emit('done', result);
  Toast.success(t('shared.alert.toast.deleteSuccess'));
};

const showError = (error) => {
  if (error) {
      const message = error.toString();
      const deletionErrorPattern = /Cannot delete some instances of model '(.+?)' because they are referenced through protected foreign keys: (.+?)\./;
      const match = message.match(deletionErrorPattern);
      if (match && match[1]) {
        Toast.error(t('shared.alert.toast.protectedDelete'));
      } else {
        displayApolloError(error);
      }
  }
};

</script>

<template>
  <ApolloMutation
    :mutation="mutation"
    :variables="mutationVariables"
    :refetch-queries="refetchQueries"
    @done="handleDone"
    @error="showError"
  >
    <template v-slot="{ mutate, loading }">
      <slot :loading="loading" :confirmAndMutate="() => confirmAndMutate(mutate)" />
    </template>
  </ApolloMutation>
</template>
