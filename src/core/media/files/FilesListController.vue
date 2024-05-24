<script lang="ts" setup>

import { ref } from 'vue';
import { Card } from '../../../shared/components/atoms/card';
import { useI18n } from "vue-i18n";
import GeneralTemplate from "../../../shared/templates/GeneralTemplate.vue";
import {Breadcrumbs} from "../../../shared/components/molecules/breadcrumbs";
import FilesSideBar from "./containers/FilesSideBar.vue";
import {Button} from "../../../shared/components/atoms/button";
import MediaCard from "./containers/MediaCard.vue";
import FilesList from "./containers/FilesList.vue";

const { t } = useI18n();

const files = ref([
  {
    id: 1,
    name: 'Landscape Photo.png',
    lastModified: 'Mar 12, 2024',
    size: '3.5 MB',
    owner: 'Alice Johnson',
    type: 'IMAGE',
    thumbnail: 'https://www.savvyhorsewoman.com/wp-content/uploads/2022/07/Falabella2.jpg'
  },
  {
    id: 2,
    name: 'Business Presentation.pptx',
    lastModified: 'Feb 28, 2024',
    size: '5.2 MB',
    owner: 'Bob Smith',
    type: 'FILE',
    thumbnail: 'https://example.com/path/to/default-document-icon.png'
  },
  {
    id: 3,
    name: 'Marketing Video.mp4',
    lastModified: 'Jan 15, 2024',
    size: '25 MB',
    owner: 'Carolyn Green',
    type: 'VIDEO',
    thumbnail: 'https://example.com/path/to/default-video-icon.png'
  }
]);


</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'media.files' }, name: t('media.title') }]" />
    </template>

   <template v-slot:content>
     <main class="flex-grow mt-2">
        <div class="flex">
          <FilesSideBar :active-tab="'home'" />

          <div class="w-full">
              <div class="grid 2xl:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-6">

                  <MediaCard :cnt="123" :label="'Images'" :url="{path: 'dashboard'}" />
                  <MediaCard :cnt="231" :label="'Videos'" :url="{path: 'dashboard'}" />
                  <MediaCard :cnt="14" :label="'Documents'" :url="{path: 'dashboard'}" />

                  <div class="2xl:col-span-4 sm:col-span-2">
                      <FilesList :files="files" label="Recent Files" />
                  </div>
              </div>
          </div>
        </div>
      </main>
   </template>

</GeneralTemplate>
</template>