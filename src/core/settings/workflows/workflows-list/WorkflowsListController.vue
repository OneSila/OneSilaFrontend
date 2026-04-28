<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Breadcrumbs } from '../../../../shared/components/molecules/breadcrumbs';
import { Button } from '../../../../shared/components/atoms/button';
import { Link } from '../../../../shared/components/atoms/link';
import { TabsMenu } from '../../../../shared/components/molecules/tabs-menu';
import { GeneralListing } from '../../../../shared/components/organisms/general-listing';
import { ApolloAlertMutation } from '../../../../shared/components/molecules/apollo-alert-mutation';
import SettingsTemplate from '../../SettingsTemplate.vue';
import { getTabsConfig } from '../../tabs';
import { deleteWorkflowMutation } from '../../../../shared/api/mutations/workflows.js';
import { listingConfigConstructor, listingQuery, listingQueryKey, searchConfigConstructor } from '../configs';

const { t } = useI18n();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t);
const refreshKey = ref(0);

const handleDeleted = () => {
  refreshKey.value += 1;
};
</script>

<template>
  <SettingsTemplate>
    <template #tabs>
      <TabsMenu :tabs="getTabsConfig(t)" :activeName="'workflows'" />
    </template>

    <template #breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'settings.workflows.list' }, name: t('settings.workflows.title') }]" />
    </template>

    <template #buttons>
      <div>
        <Link :path="{ name: 'settings.workflow.create' }">
          <Button type="button" class="btn btn-primary">
            {{ t('settings.workflows.create.title') }}
          </Button>
        </Link>
      </div>
    </template>

    <template #content>
      <GeneralListing
        :key="refreshKey"
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
      >
        <template #additionalButtons="{ item }">
          <ApolloAlertMutation
            :mutation="deleteWorkflowMutation"
            :mutation-variables="{ id: item.node.id }"
            @done="handleDeleted"
          >
            <template #default="{ loading, confirmAndMutate }">
              <Button
                :disabled="loading"
                class="text-red-600 hover:text-red-600"
                @click="confirmAndMutate"
              >
                {{ t('shared.button.delete') }}
              </Button>
            </template>
          </ApolloAlertMutation>
        </template>
      </GeneralListing>
    </template>
  </SettingsTemplate>
</template>
