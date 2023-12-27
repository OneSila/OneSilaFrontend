<script lang="ts" setup>
import { ref, watch } from 'vue';
import ProfileTemplate from "./ProfileTemplate.vue";
import { ShowProfile } from './containers/show-profile';
import { ProfileEditForm } from "./containers/profile-edit-form";
import { Button } from "../../../shared/components/atoms/button";
import { ApolloSubscription } from "./../../../shared/components/molecules/apollo-subscription";
import { meSubscription } from "./../../../shared/api/subscriptions/me";
import IconPencilPaper from '../../../shared/components/atoms/icons/icon-pencil-paper.vue';
import IconX from '../../../shared/components/atoms/icons/icon-x.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const editView = ref(false);
const unsavedChanges = ref(false);

const toggleEditView = () => {
  if (unsavedChanges.value && !confirm(t('profile.unsavedChanges'))) {
    return;
  }
  editView.value = !editView.value;
};

watch(editView, (newVal) => {
  if (!newVal) {
    unsavedChanges.value = false;
  }
});

const handleUnsavedChanges = (hasChanges) => {
  unsavedChanges.value = hasChanges;
};

const handleUpdateComplete = () => {
  editView.value = false;
};

</script>

<template>
  <ProfileTemplate>
    <template v-slot:info>
      <div class="pt-5">
        <div class="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-5 mb-5">
          <div class="panel">
            <div class="flex items-center justify-between mb-5">
              <h5 class="font-semibold text-lg dark:text-white-light">{{ t('profile.labels.editProfile') }}</h5>
              <Button :customClass="'ltr:ml-auto rtl:mr-auto btn btn-primary p-2 rounded-full'" @click="toggleEditView">
                <IconPencilPaper v-if="!editView"/>
                <IconX v-else/>
              </Button>
            </div>

            <ApolloSubscription :subscription="meSubscription">
              <template v-slot:default="{ loading, error, result }">
                <template v-if="!loading && result">
                  <div v-if="!editView">
                    <ShowProfile :me-data="result.me" />
                  </div>
                  <div v-else>
                    <ProfileEditForm :me-data="result.me" @unsaved-changes="handleUnsavedChanges" @update-complete="handleUpdateComplete" />
                  </div>
                </template>
                <p v-if="error">{{ error.message }}</p>
              </template>
            </ApolloSubscription>
          </div>
        </div>
      </div>
    </template>
  </ProfileTemplate>
</template>
