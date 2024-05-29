<script lang="ts" setup>

import { useI18n } from "vue-i18n";
import { ref } from "vue";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { SearchConfig } from "../../../../shared/components/organisms/general-search/searchConfig";
import { fileQuery } from "../../../../shared/api/queries/media.js";
import FilesSideBar from "../../files/containers/FilesSideBar.vue";
import FilesList from "../../files/containers/FilesList.vue";
import MediaCards from "../../files/containers/MediaCards.vue";
import { TYPE_DOCUMENT } from "../../files/media";

const { t } = useI18n();
const refetchNeeded = ref(false);

const searchConfig: SearchConfig = {
  search: true,
  orderKey: "sort",
  filters: [],
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