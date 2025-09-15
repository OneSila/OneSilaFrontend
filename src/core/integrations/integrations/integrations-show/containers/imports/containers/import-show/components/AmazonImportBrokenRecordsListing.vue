<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { GeneralListing } from '../../../../../../../../../shared/components/organisms/general-listing';
import { Button } from '../../../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../../../shared/components/atoms/icon';
import { Modal } from '../../../../../../../../../shared/components/atoms/modal';
import { Card } from '../../../../../../../../../shared/components/atoms/card';
import { Tabs } from '../../../../../../../../../shared/components/molecules/tabs';
import { searchConfigConstructor, listingConfigConstructor, listingQuery, listingQueryKey } from './configs';

const props = defineProps<{ importId: string }>();
const { t } = useI18n();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t);

const showModal = ref(false);
const modalRecord = ref<any | null>(null);

const openModal = (record: any) => {
  modalRecord.value = record;
  showModal.value = true;
};
</script>

<template>
  <div>
    <GeneralListing
      :search-config="searchConfig"
      :config="listingConfig"
      :query="listingQuery"
      :query-key="listingQueryKey"
      :fixed-filter-variables="{ importProcess: { id: { exact: importId } }, excludeUnknownIssues: true }"
    >
      <template #additionalButtons="{ item }">
        <Button type="button" @click="openModal(item.node)">
          <Icon name="eye" size="lg" class="text-gray-500" />
        </Button>
      </template>
    </GeneralListing>

    <Modal v-model="showModal" @closed="showModal = false">
      <Card class="modal-content w-[800px] h-[600px] overflow-auto">
        <Tabs
          tab-key="amazonImportIssuesModal"
          :tabs="[
            { name: 'message', label: t('shared.labels.message'), alwaysRender: true },
            { name: 'data', label: t('shared.labels.data'), alwaysRender: true },
            { name: 'context', label: t('shared.labels.context'), alwaysRender: true },
            ...(modalRecord?.record.error ? [{ name: 'error', label: t('shared.labels.error'), alwaysRender: true }] : []),
          ]"
        >
          <template #message>
            <pre class="p-4 whitespace-pre-wrap overflow-auto">{{ modalRecord?.record.message }}</pre>
          </template>
          <template #data>
            <pre class="p-4 whitespace-pre-wrap overflow-auto">{{ JSON.stringify(modalRecord?.record.data, null, 2) }}</pre>
          </template>
          <template #context>
            <pre class="p-4 whitespace-pre-wrap overflow-auto">{{ JSON.stringify(modalRecord?.record.context, null, 2) }}</pre>
          </template>
          <template v-if="modalRecord?.record.error" #error>
            <pre class="p-4 whitespace-pre-wrap overflow-auto">{{ modalRecord?.record.error }}</pre>
          </template>
        </Tabs>
      </Card>
    </Modal>
  </div>
</template>
