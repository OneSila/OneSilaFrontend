<script lang="ts" setup>

import { Icon } from "../../../../../../../shared/components/atoms/icon";
import { TextInputPrepend } from "../../../../../../../shared/components/atoms/input-text-prepend";
import {computed, ref, watch} from "vue";
import { useI18n } from 'vue-i18n';
import { updateMyPasswordMutation } from "../../../../../../../shared/api/mutations/me.js";
import {Button} from "../../../../../../../shared/components/atoms/button";
import {Toast} from "../../../../../../../shared/modules/toast";
import {displayApolloError} from "../../../../../../../shared/utils";

const { t } = useI18n();
const emit = defineEmits(['updateComplete', 'unsavedChanges']);

const form = ref({
  newPassword: '',
  confirmNewPassword:  '',
});
const afterUpdate = () => {
  Toast.success(t('profile.changesMade'));
  emit('updateComplete');
};

const hasUnsavedChanges = computed(() => {
  return '' !== form.value.newPassword || '' !== form.value.confirmNewPassword
});

const onError = (error) => {

  let messages: string[] = [];

  // If error.message is a string that represents an array
  if (
    typeof error.message === 'string' &&
    error.message.trim().startsWith('[') &&
    error.message.trim().endsWith(']')
  ) {
    try {
      // Replace single quotes with double quotes and parse.
      messages = JSON.parse(error.message.replace(/'/g, '"')) as string[];
    } catch (e) {
      // Fallback: if parsing fails, use the original message in an array.
      messages = [error.message];
    }
    messages.forEach(msg => {
      Toast.error(msg);
    });
  }
  // If error itself is an array, iterate over it.
  else if (Array.isArray(error)) {
    error.forEach(err => {
      Toast.error(err.message || err);
    });
  }
  // If Apollo returns a single error object with a graphQLErrors array.
  else if (error && error.graphQLErrors && Array.isArray(error.graphQLErrors)) {
    error.graphQLErrors.forEach(err => {
      Toast.error(err.message || err);
    });
  }
  // Fallback in case it's a single error object.
  else {
    Toast.error(error.message || error);
  }
};


watch(hasUnsavedChanges, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    emit('unsavedChanges', newVal);
  }
});

</script>


<template>
  <div class="rounded-md p-4 mb-5 bg-white dark:bg-[#182434]">
      <h6 class="text-lg font-bold mb-5">{{ t('profile.labels.changePassword') }}</h6>
          <div>
          <TextInputPrepend id="firstName" v-model="form.newPassword" :label="t('profile.labels.newPassword')" type="password"
                            :placeholder="t('profile.placeholders.newPassword')">
            <Icon name="lock"/>
          </TextInputPrepend>
        </div>
        <div class="my-4">
          <TextInputPrepend id="lastName" v-model="form.confirmNewPassword" :label="t('profile.labels.confirmNewPassword')" type="password"
                            :placeholder="t('profile.placeholders.confirmNewPassword')">
            <Icon name="lock"/>
          </TextInputPrepend>
        </div>

        <hr/>

        <div class="flex items-center justify-end mt-4">
          <ApolloMutation :mutation="updateMyPasswordMutation" :variables="{password: form.newPassword}" @done="afterUpdate" @error="onError">
            <template v-slot="{ mutate, loading, error }">
              <Button :disabled="form.newPassword != form.confirmNewPassword" custom-class="btn btn-primary" @click="mutate()">
                {{ t('shared.button.update') }}
              </Button>
            </template>
          </ApolloMutation>
        </div>
  </div>
</template>