<script lang="ts" setup>

import { ref } from "vue";
import { ShowConfig } from '../../showConfig';
import { ApolloAlertMutation } from "../../../../molecules/apollo-alert-mutation";
import { Link } from "../../../../atoms/link";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import { CancelButton } from "../../../../atoms/button-cancel";
import { DangerButton } from "../../../../atoms/button-danger";
import { PrimaryButton } from "../../../../atoms/button-primary";
import {
  useEnterKeyboardListener,
  useShiftBackspaceKeyboardListener,
  useShiftDeleteKeyboardListener
} from "../../../../../modules/keyboard";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const props = defineProps<{ config: ShowConfig;}>();

const deleteButtonRef = ref();

const handleDelete = (response) => {

  if (props.config.deleteUrl) {
      router.push(props.config.deleteUrl);
  }
}

const goBack = () => {
  if (props.config.addBack && props.config.backUrl !== undefined) {
    router.push(props.config.backUrl);
  }
}

const goEdit = () => {
  if (props.config.addEdit && props.config.editUrl !== undefined) {
    router.push(props.config.editUrl);
  }
}

const onDeletePressed = () => {
  deleteButtonRef.value?.$el.click();
};

useShiftDeleteKeyboardListener(onDeletePressed);
useEnterKeyboardListener(goEdit);
useShiftBackspaceKeyboardListener(goBack);

</script>

<template>
  <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8"  v-if="config.addEdit || config.addDelete || config.addBack">

    <Link v-if="config.addBack" :path="config.backUrl">
      <CancelButton>
        {{ t('shared.button.back') }}
      </CancelButton>
    </Link>

    <ApolloAlertMutation v-if="config.addDelete && config.deleteMutation" :mutation="config.deleteMutation" :mutation-variables="config.deleteVariables" @done="handleDelete">
      <template v-slot="{ loading, confirmAndMutate }">
        <DangerButton ref="deleteButtonRef" :disabled="loading" @click="confirmAndMutate">{{ t('shared.button.delete') }}</DangerButton>
      </template>
    </ApolloAlertMutation>

    <Link v-if="config.addEdit" :path="{
        name: config.editUrl?.name,
        params: config.editUrl?.params,
        query: {
          ...route.query,
          ...config.editUrl?.query
        }}">
      <PrimaryButton>
        {{ t('shared.button.edit') }}
      </PrimaryButton>
    </Link>

  </div>
</template>
