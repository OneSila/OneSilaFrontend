<script setup lang="ts">
import {defineProps, defineEmits, onMounted} from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import { SweetAlertOptions } from 'sweetalert2';
import {Product} from "../../../../core/products/products/configs";

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
    buttonsStyling: false // Ensure buttonsStyling is always false
  });

  const result = await swalWithBootstrapButtons.fire({ ...defaultSwalOptions, ...props.swalOptions } as SweetAlertOptions);

  if (result.isConfirmed) {
    await mutate();
  }
};

const emit = defineEmits(['done']);

const handleDone = (result) => {
  emit('done', result);
};

</script>

<template>
  <ApolloMutation
    :mutation="mutation"
    :variables="mutationVariables"
    :refetch-queries="refetchQueries"
    @done="handleDone"
  >
    <template v-slot="{ mutate, loading, error }">
      <slot :loading="loading" :confirmAndMutate="() => confirmAndMutate(mutate)" />
      <p v-if="error">An error occurred: {{ error }}</p>
    </template>
  </ApolloMutation>
</template>
