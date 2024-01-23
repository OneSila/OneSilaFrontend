<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { MeData } from '../../meData';
import { ProfileEditForm } from "./containers/profile-edit-form";
import { PasswordChangeForm } from "./containers/password-change-form";
import { Tabs } from "../../../../../shared/components/molecules/tabs";


const { t } = useI18n();
const props = defineProps<{ meData: MeData, tabs: any }>();
const emit = defineEmits(['updateComplete', 'unsavedChanges']);

const handleUnsavedChanges = (newVal) => {
  emit('unsavedChanges', newVal);
};

const handleUpdateComplete = () => {
  emit('updateComplete');
};

</script>

<template>
  <Tabs :tabs="tabs">
    <template v-slot:general>
      <ProfileEditForm :me-data="meData" @unsaved-changes="handleUnsavedChanges" @update-complete="handleUpdateComplete" />
    </template>
    <template v-slot:security>
      <PasswordChangeForm @unsaved-changes="handleUnsavedChanges" @update-complete="handleUpdateComplete" />
    </template>
  </Tabs>
</template>