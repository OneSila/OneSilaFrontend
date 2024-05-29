<script lang="ts" setup>

import { computed, watchEffect, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{ videoUrl: string; }>();

const isYouTube = computed(() => {
  return props.videoUrl.includes('youtube') || props.videoUrl.includes('youtu.be');
});

const youtubeEmbedUrl = computed(() => {
  if (!isYouTube.value) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = props.videoUrl.match(regExp);
  return match && match[2].length == 11 ? `https://www.youtube.com/embed/${match[2]}` : '';
});


</script>

<template>
  <div>
  <div v-if="isYouTube" class="video-wrapper">
    <iframe :src="youtubeEmbedUrl" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
  </div>
    <video v-else controls class="w-full h-full">
      <source :src="videoUrl" type="video/mp4">
      {{ t('media.videos.show.unsupportedFormatError') }}
    </video>
  </div>
</template>

<style scoped>
.video-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
}
iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>