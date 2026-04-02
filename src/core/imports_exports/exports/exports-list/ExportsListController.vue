<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../apollo-client';
import GeneralTemplate from '../../../../shared/templates/GeneralTemplate.vue';
import { Breadcrumbs } from '../../../../shared/components/molecules/breadcrumbs';
import { Button } from '../../../../shared/components/atoms/button';
import { Link } from '../../../../shared/components/atoms/link';
import { Icon } from '../../../../shared/components/atoms/icon';
import { GeneralListing } from '../../../../shared/components/organisms/general-listing';
import { Toast } from '../../../../shared/modules/toast';
import {
  EXPORTS_LISTING_QUERY,
  EXPORTS_LISTING_QUERY_KEY,
  exportsListingConfigConstructor,
  exportsSearchConfigConstructor,
} from '../../configs';
import { resyncExportMutation } from '../../../../shared/api/mutations/importsExports.js';

const { t } = useI18n();
const searchConfig = exportsSearchConfigConstructor(t);
const listingConfig = exportsListingConfigConstructor(t);
const resyncingId = ref<string | null>(null);

const resyncExport = async (id: string) => {
  resyncingId.value = id;

  try {
    await apolloClient.mutate({
      mutation: resyncExportMutation,
      variables: { id },
      fetchPolicy: 'network-only',
    });
    await apolloClient.reFetchObservableQueries();
    Toast.success(t('importsExports.exports.alerts.resyncSuccess'));
  } catch (error) {
    console.error(error);
    Toast.error(t('importsExports.exports.alerts.resyncError'));
  } finally {
    resyncingId.value = null;
  }
};
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'importsExports.exports.list' }, name: t('importsExports.exports.title') }]" />
    </template>

    <template #content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="EXPORTS_LISTING_QUERY"
        :query-key="EXPORTS_LISTING_QUERY_KEY"
      >
        <template #headerActions>
          <Link :path="{ name: 'importsExports.exports.create' }">
            <Button type="button" class="btn btn-primary">
              {{ t('importsExports.exports.create.title') }}
            </Button>
          </Link>
        </template>
        <template #additionalButtons="{ item }">
          <Button
            type="button"
            :disabled="resyncingId === item.node.id"
            :title="t('shared.button.resync')"
            @click="resyncExport(item.node.id)"
          >
            <Icon
              name="refresh"
              size="lg"
              :class="resyncingId === item.node.id ? 'animate-spin text-slate-400' : 'text-slate-500'"
            />
          </Button>
        </template>
      </GeneralListing>
    </template>
  </GeneralTemplate>
</template>
