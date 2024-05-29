<script lang="ts" setup>

import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { imagesCnt, filesCnt, videosCnt } from "../../../../shared/api/queries/media.js";
import MediaCard from "./MediaCard.vue";

const { t } = useI18n();
const props = defineProps<{ refetchNeeded?: boolean  }>();
const localRefetchNeeded = ref(props.refetchNeeded)
const handleRefeched = () => {
  localRefetchNeeded.value = false;
};

watch(() => props.refetchNeeded, (newVal) => {
  localRefetchNeeded.value = newVal;
});

</script>

<template>
  <MediaCard :refetch-needed="refetchNeeded" @refetched="handleRefeched" :cnt-query="imagesCnt" :label="t('media.images.title')" :url="{ name: 'media.images.list' }" />
  <MediaCard :refetch-needed="refetchNeeded" @refetched="handleRefeched" :cnt-query="videosCnt" :label="t('media.videos.title')" :url="{ name: 'media.videos.list' }" />
  <MediaCard :refetch-needed="refetchNeeded" @refetched="handleRefeched" :cnt-query="filesCnt" :label="t('media.documents.title')" :url="{ name: 'media.documents.list' }" />
</template>
