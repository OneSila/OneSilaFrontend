<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import SettingsTemplate from "../../SettingsTemplate.vue";
import { TabsMenu } from "../../../../shared/components/molecules/tabs-menu";
import { getTabsConfig } from "../../tabs";
import {onMounted, ref} from "vue";
import apolloClient from "../../../../../apollo-client";
import {hasDemoDataQuery} from "../../../../shared/api/queries/me.js";
import {createDemoData, deleteDemoData} from "../../../../shared/api/mutations/auth.js";
import {Toast} from "../../../../shared/modules/toast";
import {DangerButton} from "../../../../shared/components/atoms/button-danger";
import {PrimaryButton} from "../../../../shared/components/atoms/button-primary";
import Swal, {SweetAlertOptions} from "sweetalert2";

const { t } = useI18n();
const hasDemoData = ref(false);

const getHasDemoData = async () => {

  const { data } = await apolloClient.query({
    query: hasDemoDataQuery
  })

  if (data.hasDemoData) {
    hasDemoData.value = data.hasDemoData.hasDemoData;
  }

}

const updateDemoData = async (newVal: boolean) => {

  const defaultSwalOptions = {
  title: hasDemoData.value ? t('settings.demoData.delete.alert.title') : t('settings.demoData.create.alert.title'),
  text: hasDemoData.value ? t('settings.demoData.delete.alert.text') : t('settings.demoData.create.alert.text'),
  confirmButtonText: hasDemoData.value ? t('settings.demoData.delete.alert.confirmButtonText') : t('settings.demoData.create.alert.confirmButtonText'),
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

  const swalWithBootstrapButtons = Swal.mixin({
    customClass: defaultSwalClasses,
    buttonsStyling: false
  });

  const result = await swalWithBootstrapButtons.fire(defaultSwalOptions as SweetAlertOptions);

  if (!result.isConfirmed) {
    return;
  }

  if (newVal) {
    const { data } = await apolloClient.mutate({
      mutation: createDemoData
    })

    if (data && data.createDemoData) {
      Toast.success(t('settings.demoData.create.successfullyCreated'))
    }

  } else {
    const { data } = await apolloClient.mutate({
      mutation: deleteDemoData
    })

    if (data && data.deleteDemoData) {
      Toast.success(t('settings.demoData.delete.successfullyDelete'))
    }
  }

  hasDemoData.value = !hasDemoData.value;

};

onMounted(getHasDemoData);

</script>

<template>
  <SettingsTemplate>
    <template v-slot:tabs>
      <TabsMenu :tabs="getTabsConfig(t)" :activeName="'demoData'" />
    </template>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'settings.demoData.show' }, name: t('settings.demoData.title') }]" />
    </template>

   <template v-slot:content>
      <div v-if="hasDemoData">
        <h2 class="text-xl font-semibold">{{ t('settings.demoData.delete.title') }}</h2>
        <p class="mt-2">{{ t('settings.demoData.delete.content') }}</p>
        <DangerButton :disabled="true" class="mt-4" @click="updateDemoData(false)">
          {{ t('shared.button.delete') }}
        </DangerButton>
      </div>
       <div v-else>
        <h2 class="text-xl font-semibold">{{ t('settings.demoData.create.title') }}</h2>
        <p class="mt-2">{{ t('settings.demoData.create.content') }}</p>
        <PrimaryButton class="mt-4" @click="updateDemoData(true)">
          {{ t('shared.button.create') }}
        </PrimaryButton>
      </div>
   </template>
  </SettingsTemplate>
</template>