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
  MAPPED_IMPORT_LISTING_QUERY,
  MAPPED_IMPORT_LISTING_QUERY_KEY,
  mappedImportsListingConfigConstructor,
  mappedImportsSearchConfigConstructor,
} from '../../configs';
import { resyncMappedImportMutation } from '../../../../shared/api/mutations/importsExports.js';

const { t } = useI18n();
const searchConfig = mappedImportsSearchConfigConstructor(t);
const listingConfig = mappedImportsListingConfigConstructor(t);
const resyncingId = ref<string | null>(null);

const resyncMappedImport = async (id: string) => {
  resyncingId.value = id;

  try {
    await apolloClient.mutate({
      mutation: resyncMappedImportMutation,
      variables: { id },
      fetchPolicy: 'network-only',
    });
    await apolloClient.reFetchObservableQueries();
    Toast.success(t('importsExports.mappedImports.alerts.resyncSuccess'));
  } catch (error) {
    console.error(error);
    Toast.error(t('importsExports.mappedImports.alerts.resyncError'));
  } finally {
    resyncingId.value = null;
  }
};
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'importsExports.mappedImports.list' }, name: t('importsExports.mappedImports.title') }]" />
    </template>

    <template #content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="MAPPED_IMPORT_LISTING_QUERY"
        :query-key="MAPPED_IMPORT_LISTING_QUERY_KEY"
      >
        <template #headerActions>
          <Link :path="{ name: 'importsExports.mappedImports.create' }">
            <Button type="button" class="btn btn-primary">
              {{ t('importsExports.mappedImports.create.title') }}
            </Button>
          </Link>
        </template>
        <template #additionalButtons="{ item }">
          <Button
            type="button"
            :disabled="resyncingId === item.node.id"
            :title="t('shared.button.resync')"
            @click="resyncMappedImport(item.node.id)"
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
