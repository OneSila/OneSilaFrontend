<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ProfileTemplate from "./ProfileTemplate.vue";
import { ShowProfile } from './containers/show-profile';
import { ProfileEdit } from "./containers/profile-edit";
import { Button } from "../../../shared/components/atoms/button";
import { ApolloSubscription } from "./../../../shared/components/molecules/apollo-subscription";
import { meSubscription } from "../../../shared/api/subscriptions/me.js";
import IconPencilPaper from '../../../shared/components/atoms/icons/icon-pencil-paper.vue';
import IconX from '../../../shared/components/atoms/icons/icon-x.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const editView = ref(false);
const unsavedChanges = ref(false);
const tabItems = ref();

interface MeSubscriptionResult {
  me: {
    username: string;
    lastName: string;
    firstName: string;
    mobileNumber: string;
    whatsappNumber: string;
    telegramNumber: string;
    timezone: string;
    isMultiTenantCompanyOwner: boolean;
    isActive: boolean;
    dateJoined: string; // Assuming dateJoined is a string (e.g., ISO format), adjust if it's a different type
    avatarResizedFullUrl: string;
  };
}


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


tabItems.value = [
    { name: 'general', label: t('profile.tabs.general'), icon: 'id-card' },
    { name: 'security', label: t('profile.tabs.security'), icon: 'cog' }
  ];

const tabQueryParam = route.query.tab;
if (tabItems.value.some(tab => tab.name === tabQueryParam)) {
  editView.value = true;
}

const getMe = (result) => {
 const r: MeSubscriptionResult = result;
 return r.me;
}

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
                    <ShowProfile :me-data="getMe(result)" />
                  </div>
                  <div v-else>
                    <ProfileEdit :me-data="getMe(result)" :tabs="tabItems" @unsaved-changes="handleUnsavedChanges" @update-complete="handleUpdateComplete" />
                  </div>
                </template>
              </template>
            </ApolloSubscription>
          </div>
        </div>
      </div>
    </template>
  </ProfileTemplate>
</template>
