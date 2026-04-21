<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ProfileTemplate from "./ProfileTemplate.vue";
import { ShowProfile } from './containers/show-profile';
import { ProfileEdit } from "./containers/profile-edit";
import McpApiKeyPanel from "../company/containers/mcp-api-key-panel/McpApiKeyPanel.vue";
import { Button } from "../../../shared/components/atoms/button";
import { ApolloSubscription } from "./../../../shared/components/molecules/apollo-subscription";
import { meSubscription } from "../../../shared/api/subscriptions/me.js";
import IconPencilPaper from '../../../shared/components/atoms/icons/icon-pencil-paper.vue';
import IconX from '../../../shared/components/atoms/icons/icon-x.vue';
import { useI18n } from 'vue-i18n';
import LanguageDropdown from "../../../shared/components/molecules/languages-dropdown/LanguageDropdown.vue";

const { t } = useI18n();
const route = useRoute();
const editView = ref(false);
const unsavedChanges = ref(false);
const tabItems = ref();
const apolloSubRef = ref();

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
    dateJoined: string;
    avatarResizedFullUrl: string;
    mcpApiKey?: {
      id: string;
      maskedKey: string;
      isActive: boolean;
    } | null;
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

const handleRefreshRequested = () => {
  if (apolloSubRef.value && apolloSubRef.value.refresh) {
    apolloSubRef.value.refresh();
  }
};

</script>

<template>
  <ProfileTemplate>
    <template v-slot:info>
      <div class="pt-5">
        <div class="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-5 mb-5">
          <div class="panel overflow-hidden">
            <div class="-mx-6 -mt-6 mb-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-indigo-50/80 px-6 py-5 dark:border-slate-700/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div class="max-w-2xl">
                  <h5 class="text-xl font-semibold text-slate-900 dark:text-white-light">
                    {{ editView ? t('profile.labels.editDetails') : t('profile.labels.profileDetails') }}
                  </h5>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                  <Button
                    :customClass="'inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white-light dark:hover:bg-slate-800'"
                    @click="toggleEditView"
                  >
                    <IconPencilPaper v-if="!editView"/>
                    <IconX v-else/>
                    <span>
                      {{ editView ? t('profile.actions.closeEditor') : t('profile.actions.editDetails') }}
                    </span>
                  </Button>
                  <LanguageDropdown :show="true" class="w-max"/>
                </div>
              </div>
            </div>

            <ApolloSubscription :subscription="meSubscription" ref="apolloSubRef">
              <template v-slot:default="{ loading, error, result }">
                <template v-if="!loading && result">
                  <div v-if="!editView">
                    <ShowProfile :me-data="getMe(result)" />
                  </div>
                  <div v-else>
                    <ProfileEdit :me-data="getMe(result)" :tabs="tabItems" @unsaved-changes="handleUnsavedChanges" @update-complete="handleUpdateComplete" />
                  </div>
                  <McpApiKeyPanel
                    class="mt-3"
                    :me-data="getMe(result)"
                    @refresh-requested="handleRefreshRequested"
                  />
                </template>
              </template>
            </ApolloSubscription>
          </div>
        </div>
      </div>
    </template>
  </ProfileTemplate>
</template>
