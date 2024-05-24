<script lang="ts" setup>

import { useI18n } from "vue-i18n";
import { imagesCnt, filesCnt, videosCnt } from "../../../../shared/api/queries/media.js";
import MediaCard from "./MediaCard.vue";

const { t } = useI18n();

</script>

<template>
  <MediaCard :cnt-query="imagesCnt" :label="t('media.images.title')" :url="{ name: 'media.images.list' }" />
  <MediaCard :cnt-query="videosCnt" :label="t('media.videos.title')" :url="{ name: 'media.videos.list' }" />
  <MediaCard :cnt-query="filesCnt" :label="t('media.documents.title')" :url="{ name: 'media.documents.list' }" />
</template>
