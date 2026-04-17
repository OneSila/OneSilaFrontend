<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { GeneralListing } from '../../../shared/components/organisms/general-listing';
import JsonPreviewModal from './JsonPreviewModal.vue';
import { Button } from '../../../shared/components/atoms/button';
import { Icon } from '../../../shared/components/atoms/icon';
import {
  brokenRecordsListingConfigConstructor,
  brokenRecordsSearchConfigConstructor,
  IMPORT_BROKEN_RECORDS_QUERY,
  IMPORT_BROKEN_RECORDS_QUERY_KEY,
} from '../configs';

defineProps<{
  importProcessId: string;
}>();

const { t } = useI18n();
const searchConfig = brokenRecordsSearchConfigConstructor(t);
const listingConfig = brokenRecordsListingConfigConstructor(t);

const selectedRecord = ref<unknown | null>(null);
const isModalOpen = ref(false);

const openRecord = (record: unknown) => {
  selectedRecord.value = record;
  isModalOpen.value = true;
};
</script>

<template>
  <div>
    <GeneralListing
      :search-config="searchConfig"
      :config="listingConfig"
      :query="IMPORT_BROKEN_RECORDS_QUERY"
      :query-key="IMPORT_BROKEN_RECORDS_QUERY_KEY"
      :fixed-filter-variables="{ importProcess: { id: { exact: importProcessId } } }"
    >
      <template #additionalButtons="{ item }">
        <Button type="button" :title="t('shared.button.show')" @click="openRecord(item.node.record)">
          <Icon name="eye" size="lg" class="text-slate-500" />
        </Button>
      </template>
    </GeneralListing>

    <JsonPreviewModal
      v-model="isModalOpen"
      :title="t('importsExports.mappedImports.brokenRecords.modalTitle')"
      :value="selectedRecord"
    />
  </div>
</template>
