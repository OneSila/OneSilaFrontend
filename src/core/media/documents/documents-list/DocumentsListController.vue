<script lang="ts" setup>

import { useI18n } from "vue-i18n";
import { ref } from "vue";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { SearchConfig } from "../../../../shared/components/organisms/general-search/searchConfig";
import { FieldType } from "../../../../shared/utils/constants";
import { fileQuery } from "../../../../shared/api/queries/media.js";
import { documentTypesQuerySelector } from "../../../../shared/api/queries/documentTypes.js";
import { companyLanguagesQuery } from "../../../../shared/api/queries/languages.js";
import FilesSideBar from "../../files/containers/FilesSideBar.vue";
import FilesList from "../../files/containers/FilesList.vue";
import MediaCards from "../../files/containers/MediaCards.vue";
import { TYPE_DOCUMENT } from "../../files/media";
import { deleteFilesMutation } from "../../../../shared/api/mutations/media.js"

const { t } = useI18n();
const refetchNeeded = ref(false);

const searchConfig: SearchConfig = {
  search: true,
  orderKey: "sort",
  filters: [
    {
      type: FieldType.Query,
      query: documentTypesQuerySelector,
      dataKey: 'documentTypes',
      name: 'documentType',
      label: t('media.documents.filters.documentType'),
      labelBy: 'name',
      valueBy: 'id',
      filterable: true,
      isEdge: true,
      addLookup: true,
      lookupKeys: ['id']
    },
    {
      type: FieldType.Query,
      query: companyLanguagesQuery,
      dataKey: 'companyLanguages',
      name: 'documentLanguage',
      label: t('shared.labels.language'),
      labelBy: 'name',
      valueBy: 'code',
      filterable: true,
      isEdge: false,
      addLookup: true,
      lookupKeys: []
    },
    {
      type: FieldType.Choice,
      name: 'isDocumentImage',
      label: t('media.documents.filters.documentKind'),
      options: [
        { name: t('media.documents.filters.imageDocuments'), code: 'true' },
        { name: t('media.documents.filters.fileDocuments'), code: 'false' },
      ],
      labelBy: 'name',
      valueBy: 'code',
      filterable: false,
      removable: true,
      addLookup: true,
      lookupKeys: []
    },
  ],
  orders: []
};

const activeTab = TYPE_DOCUMENT;
const queryKey = 'files';
const defaultView = 'table';

const handleDocumentsAdded = () => {
  refetchNeeded.value = true;
};

const handleRefeched = () => {
  refetchNeeded.value = false;
};
</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'media.documents.list' }, name: t('media.documents.title') }]" />
    </template>

   <template v-slot:content>
     <main class="flex-grow mt-2">
        <div class="flex">
          <FilesSideBar :active-tab="activeTab" @trigger-refetch="handleDocumentsAdded" />

          <div class="w-full">
              <div class="grid 2xl:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-6">
                  <MediaCards :refetch-needed="refetchNeeded" />

                  <div class="2xl:col-span-4 sm:col-span-2">
                      <FilesList
                          :search-config="searchConfig"
                          :list-query="fileQuery"
                          :query-key="queryKey"
                          :default-view-type="defaultView"
                          :label="t('media.documents.title')"
                          :refetch-needed="refetchNeeded"
                          :bulk-delete-mutation="deleteFilesMutation"
                          :bulk-delete-success-alert="t('media.documents.alert.toast.bulkDeleteSuccess')"
                          :bulk-delete-error-alert="t('media.documents.alert.toast.bulkDeleteError')"
                          @refetched="handleRefeched"
                      />
                  </div>
              </div>
          </div>
        </div>
      </main>
   </template>

</GeneralTemplate>
</template>
