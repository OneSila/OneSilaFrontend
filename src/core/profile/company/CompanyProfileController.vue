<script lang="ts" setup>
import { ref, watch } from 'vue';
import CompanyProfileTemplate from "./CompanyProfileTemplate.vue";
import { ShowCompanyProfile } from './containers/show-company-profile';
import { CompanyProfileEditForm } from "./containers/company-profile-edit-form";
import { CompanyMembersList } from "./containers/company-members-list";
import McpApiKeyPanel from "./containers/mcp-api-key-panel/McpApiKeyPanel.vue";
import { Button } from "../../../shared/components/atoms/button";
import { ApolloSubscription } from "./../../../shared/components/molecules/apollo-subscription";
import { meCompanySubscription } from "./../../../shared/api/subscriptions/me.js";
import IconPencilPaper from '../../../shared/components/atoms/icons/icon-pencil-paper.vue';
import IconX from '../../../shared/components/atoms/icons/icon-x.vue';
import { useI18n } from 'vue-i18n';
import {MeCompanySubscriptionResult} from "./meCompanyData";

const { t } = useI18n();
const editView = ref(false);
const unsavedChanges = ref(false);
const apolloSubRef = ref();
const toggleEditView = () => {
  if (unsavedChanges.value && !confirm(t('companyProfile.messages.unsavedChanges'))) {
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

const handleRefreshRequested = () => {
  if (apolloSubRef.value && apolloSubRef.value.refresh) {
    apolloSubRef.value.refresh();
  }
};

const getCompany = (result) => {
  const r: MeCompanySubscriptionResult = result;
  return r.myMultiTenantCompany;
}

const getLanguage = (result) => {
  const r: MeCompanySubscriptionResult = result;
  return r.myMultiTenantCompany.language;
}

const getUsers = (result) => {
  const r: MeCompanySubscriptionResult = result;
  return r.myMultiTenantCompany.multitenantuserSet;
}

</script>

<template>
  <CompanyProfileTemplate>
    <template v-slot:info>
      <div class="pt-5">
        <div class="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-5 mb-5">
          <ApolloSubscription :subscription="meCompanySubscription" ref="apolloSubRef">
            <template v-slot:default="{ loading, error, result }">
              <template v-if="!loading && result">
              <div class="panel overflow-hidden">
                <div class="-mx-6 -mt-6 mb-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-indigo-50/80 px-6 py-5 dark:border-slate-700/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                  <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div class="max-w-2xl">
                      <h5 class="text-xl font-semibold text-slate-900 dark:text-white-light">
                        {{ editView ? t('companyProfile.labels.editCompanyDetails') : t('companyProfile.labels.companyDetails') }}
                      </h5>
                      <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
                        {{ t('companyProfile.descriptions.companyProfile') }}
                      </p>
                    </div>

                    <Button
                      :customClass="'inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white-light dark:hover:bg-slate-800'"
                      @click="toggleEditView"
                    >
                      <IconPencilPaper v-if="!editView"/>
                      <IconX v-else/>
                      <span>
                        {{ editView ? t('companyProfile.actions.closeEditor') : t('companyProfile.actions.editCompanyDetails') }}
                      </span>
                    </Button>
                  </div>
                </div>
                  <div v-if="!editView">
                    <ShowCompanyProfile :company-data="getCompany(result)"/>
                  </div>
                  <div v-else>
                    <CompanyProfileEditForm :company-data="getCompany(result)" @unsaved-changes="handleUnsavedChanges"
                                            @update-complete="handleUpdateComplete"/>
                  </div>
              </div>
              <McpApiKeyPanel
                class="mt-3"
                :company-data="getCompany(result)"
                @refresh-requested="handleRefreshRequested"
              />
              <div class="panel mt-3">
                <CompanyMembersList :members="getUsers(result)" :language="getLanguage(result)" @refresh-requested="handleRefreshRequested" />
              </div>
              </template>
            </template>
          </ApolloSubscription>
        </div>
      </div>
    </template>
  </CompanyProfileTemplate>
</template>
