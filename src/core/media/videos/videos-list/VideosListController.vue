<script lang="ts" setup>

import { useI18n } from "vue-i18n";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { SearchConfig } from "../../../../shared/components/organisms/general-search/searchConfig";
import { videoQuery } from "../../../../shared/api/queries/media.js";
import FilesSideBar from "../../files/containers/FilesSideBar.vue";
import FilesList from "../../files/containers/FilesList.vue";
import MediaCards from "../../files/containers/MediaCards.vue";
import { ref } from "vue";

const { t } = useI18n();
const refetchNeeded = ref(false);

const searchConfig: SearchConfig = {
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
};

const activeTab = 'videos';
const queryKey = 'videos';
const defaultView = 'table';


const handleVideoAdded = () => {
  refetchNeeded.value = true;
};

const handleRefeched = () => {
  refetchNeeded.value = false;
};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'media.videos.list' }, name: t('media.videos.title') }]" />
    </template>

   <template v-slot:content>
     <main class="flex-grow mt-2">
        <div class="flex">
          <FilesSideBar :active-tab="activeTab" @trigger-refetch="handleVideoAdded" />

          <div class="w-full">
              <div class="grid 2xl:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-6">
                  <MediaCards :refetch-needed="refetchNeeded" />

                  <div class="2xl:col-span-4 sm:col-span-2">
                      <FilesList :search-config="searchConfig"
                                 :list-query="videoQuery"
                                 :query-key="queryKey"
                                 :default-view-type="defaultView"
                                 :label="t('media.videos.title')"
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