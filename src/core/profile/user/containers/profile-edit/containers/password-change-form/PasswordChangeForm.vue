<script lang="ts" setup>

import { Icon } from "../../../../../../../shared/components/atoms/icon";
import { TextInputPrepend } from "../../../../../../../shared/components/atoms/text-input-prepend";
import {computed, defineEmits, ref, watch} from "vue";
import { useI18n } from 'vue-i18n';
import {updateMeMutation} from "../../../../../../../shared/api/mutations/me";
import {Button} from "../../../../../../../shared/components/atoms/button";

const { t } = useI18n();
const emit = defineEmits(['updateComplete', 'unsavedChanges']);

const form = ref({
  newPassword: '',
  confirmNewPassword:  '',
});
const afterUpdate = () => {
  alert(t('profile.changesMade'));
  emit('updateComplete');
};

const hasUnsavedChanges = computed(() => {
  return '' !== form.value.newPassword || '' !== form.value.confirmNewPassword
});

watch(hasUnsavedChanges, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    emit('unsavedChanges', newVal);
  }
});

</script>


<template>
  <div class="rounded-md p-4 mb-5 bg-white dark:bg-[#0e1726]">
      <h6 class="text-lg font-bold mb-5">{{ t('profile.labels.changePassword') }}</h6>
          <div>
          <TextInputPrepend id="firstName" v-model="form.newPassword" :label="t('profile.labels.newPassword')" type="password"
                            :placeholder="t('profile.placeholders.newPassword')">
            <Icon name="lock"/>
          </TextInputPrepend>
        </div>
        <div>
          <TextInputPrepend id="lastName" v-model="form.confirmNewPassword" :label="t('profile.labels.confirmNewPassword')" type="password"
                            :placeholder="t('profile.placeholders.confirmNewPassword')">
            <Icon name="lock"/>
          </TextInputPrepend>
        </div>
        <div class="mt-2">
          <Button :disabled="form.newPassword != form.confirmNewPassword" custom-class="btn btn-primary" @click="afterUpdate()">
            {{ t('shared.button.update') }}
          </Button>
        </div>
  </div>
</template>