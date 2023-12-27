<script lang="ts" setup>
import { ref, watch } from 'vue';
import CompanyProfileTemplate from "./CompanyProfileTemplate.vue";
import { ShowCompanyProfile } from './containers/show-company-profile';
import { CompanyProfileEditForm } from "./containers/company-profile-edit-form";
import { CompanyMembersList } from "./containers/company-members-list";
import { Button } from "../../../shared/components/atoms/button";
import { ApolloSubscription } from "./../../../shared/components/molecules/apollo-subscription";
import { meCompanySubscription } from "./../../../shared/api/subscriptions/me";
import IconPencilPaper from '../../../shared/components/atoms/icons/icon-pencil-paper.vue';
import IconX from '../../../shared/components/atoms/icons/icon-x.vue';
import { useI18n } from 'vue-i18n';

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

</script>

<template>
  <CompanyProfileTemplate>
    <template v-slot:info>
      <div class="pt-5">
        <div class="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-5 mb-5">
          <ApolloSubscription :subscription="meCompanySubscription" ref="apolloSubRef">
            <template v-slot:default="{ loading, error, result }">
              <template v-if="!loading && result">
              <div class="panel">
                <div class="flex items-center justify-between mb-5">
                  <h5 class="font-semibold text-lg dark:text-white-light">{{ t('companyProfile.labels.editProfile') }}</h5>
                  <Button :customClass="'ltr:ml-auto rtl:mr-auto btn btn-primary p-2 rounded-full'" @click="toggleEditView">
                    <IconPencilPaper v-if="!editView"/>
                    <IconX v-else/>
                  </Button>
                </div>
                  <div v-if="!editView">
                    <ShowCompanyProfile :company-data="result.myMultiTenantCompany"/>
                  </div>
                  <div v-else>
                    <CompanyProfileEditForm :company-data="result.myMultiTenantCompany" @unsaved-changes="handleUnsavedChanges"
                                            @update-complete="handleUpdateComplete"/>
                  </div>
                  <p v-if="error">{{ error.message }}</p>

              </div>
              <div class="panel mt-3">
                <CompanyMembersList :members="result.myMultiTenantCompany.multitenantuserSet"
                                    :language="result.myMultiTenantCompany.language"
                                    @refresh-requested="handleRefreshRequested" />
              </div>
              </template>
            </template>
          </ApolloSubscription>
        </div>
      </div>
    </template>
  </CompanyProfileTemplate>
</template>
