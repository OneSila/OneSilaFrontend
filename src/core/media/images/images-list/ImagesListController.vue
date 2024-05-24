<script lang="ts" setup>

import { useI18n } from "vue-i18n";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { SearchConfig } from "../../../../shared/components/organisms/general-search/searchConfig";
import { imageQuery } from "../../../../shared/api/queries/media.js";
import FilesSideBar from "../../files/containers/FilesSideBar.vue";
import FilesList from "../../files/containers/FilesList.vue";
import MediaCards from "../../files/containers/MediaCards.vue";

const { t } = useI18n();

const searchConfig: SearchConfig = {
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
};

const activeTab = 'images';
const queryKey = 'images';
const defaultView = 'images';

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'media.files' }, name: t('media.title') }]" />
    </template>

   <template v-slot:content>
     <main class="flex-grow mt-2">
        <div class="flex">
          <FilesSideBar :active-tab="activeTab" />

          <div class="w-full">
              <div class="grid 2xl:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-6">
                  <MediaCards />

                  <div class="2xl:col-span-4 sm:col-span-2">
                      <FilesList :search-config="searchConfig" :list-query="imageQuery" :query-key="queryKey" :default-view-type="defaultView" :label="t('media.images.title')" />
                  </div>
              </div>
          </div>
        </div>
      </main>
   </template>

</GeneralTemplate>
</template>