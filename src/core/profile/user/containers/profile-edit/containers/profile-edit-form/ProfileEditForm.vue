<script lang="ts" setup>
import {computed, Ref, ref, watch} from 'vue';
import { updateMeMutation } from "./../../../../../../../shared/api/mutations/me.js";
import { TextInputPrepend } from '../../../../../../../shared/components/atoms/input-text-prepend';
import { Icon } from "../../../../../../../shared/components/atoms/icon";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { MeData } from '../../../../meData';
import { Selector } from "../../../../../../../shared/components/atoms/selector";
import { Label } from "../../../../../../../shared/components/atoms/label";
import { timezonesQuery } from "../../../../../../../shared/api/queries/languages.js";
import { DropZone } from "../../../../../../../shared/components/molecules/drop-zone";

import { useI18n } from 'vue-i18n';
import {PhoneNumberInput} from "../../../../../../../shared/components/atoms/input-phone-number";
import {Toast} from "../../../../../../../shared/modules/toast";
import apolloClient from "../../../../../../../../apollo-client";
import { Image } from "../../../../../../../shared/components/atoms/image";

const { t } = useI18n();
const props = defineProps<{ meData: MeData }>();

const emit = defineEmits(['updateComplete', 'unsavedChanges']);
const dropZone: Ref<any> = ref(null)
const loading = ref(false);
const form = ref({
  firstName: props.meData.firstName || '',
  lastName: props.meData.lastName || '',
  mobileNumber: props.meData.mobileNumber || '',
  whatsappNumber: props.meData.whatsappNumber || '',
  telegramNumber: props.meData.telegramNumber || '',
  timezone: props.meData.timezone || '',
});

const getMutationVariables = () => {
  return {
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    mobileNumber: form.value.mobileNumber,
    whatsappNumber: form.value.whatsappNumber,
    telegramNumber: form.value.telegramNumber,
    timezone: form.value.timezone
  };
};

const afterUpdate = () => {
  Toast.success(t('profile.changesMade'));
  emit('updateComplete');
};

const executeMutation = async (variables: any | null = null) => {
  loading.value = true;
  try {
    const { data } = await apolloClient.mutate({
      mutation: updateMeMutation,
      variables: variables || getMutationVariables() ,
    });
    if (!data || !data.updateMe) {
      Toast.error(t('shared.alert.toast.unexpectedResult'));
      return;
    }
    afterUpdate();
  } catch (error) {
    console.error(error);
    Toast.error(t('shared.alert.toast.errorOccurred'));
  } finally {
    loading.value = false;
  }
};

const hasUnsavedChanges = computed(() => {
  return props.meData.firstName !== form.value.firstName ||
      props.meData.lastName !== form.value.lastName ||
      props.meData.mobileNumber !== form.value.mobileNumber ||
      props.meData.whatsappNumber !== form.value.whatsappNumber ||
      props.meData.timezone !== form.value.timezone ||
      props.meData.telegramNumber !== form.value.telegramNumber
});

watch(hasUnsavedChanges, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    emit('unsavedChanges', newVal);
  }
});

const fileFormats = ['image/png', 'image/jpeg'];

const onUploaded = async (files: any[]) => {
  if (files.length > 0) {
    const variables = {file: files[0]};
    await executeMutation(variables);
  }
  dropZone.value?.clear();
}

</script>


<template>
  <div class="rounded-md p-4 mb-5 bg-white dark:bg-[#182434]">
      <h6 class="text-lg font-bold mb-5">{{ t('profile.labels.generalInformation') }}</h6>
      <div class="flex flex-col sm:flex-row">
        <div class="ltr:sm:mr-4 rtl:sm:ml-4 w-full sm:w-2/12 mb-5">
          <Image class="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover mx-auto" :source="meData.avatarResizedFullUrl" />
          <DropZone ref="dropZone" class="mt-2" :formats="fileFormats" @uploaded="onUploaded" :multipl="false" />
        </div>
        <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <TextInputPrepend id="firstName" v-model="form.firstName" :label="t('profile.labels.firstName')" :placeholder="t('profile.placeholders.firstName')">
              <Icon name="id-card"/>
            </TextInputPrepend>
          </div>
          <div>
            <TextInputPrepend id="lastName" v-model="form.lastName" :label="t('profile.labels.lastName')" :placeholder="t('profile.placeholders.lastName')">
              <Icon name="id-card"/>
            </TextInputPrepend>
          </div>
          <div>
              <PhoneNumberInput v-model:model-value="form.mobileNumber" :label="t('profile.labels.mobileNumber')" />
          </div>
          <div>
            <PhoneNumberInput v-model:model-value="form.whatsappNumber" :label="t('profile.labels.whatsappNumber')" />
          </div>
          <div>
            <PhoneNumberInput v-model:model-value="form.telegramNumber" :label="t('profile.labels.telegramNumber')" />
          </div>
          <div>
            <Label>{{ t('profile.labels.timezone') }}</Label>
            <ApolloQuery :query="timezonesQuery">
              <template v-slot="{ result: { data } }">
                <Selector v-if="data" v-model="form.timezone" :options="data.timezones" :placeholder="t('auth.register.company.placeholders.selector.country')" filterable
                          labelBy="key" valueBy="key"/>
              </template>
            </ApolloQuery>
          </div>

          <div class="sm:col-span-2">
            <Button :disabled="loading" custom-class="btn btn-primary" @click="executeMutation()">
              {{ t('shared.button.update') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
</template>