<script lang="ts" setup>
import { computed } from 'vue';
import { Icon } from '../../../../../../shared/components/atoms/icon'; // adjust path as needed

const props = defineProps<{ videoUrl: string }>();

const isYouTube = computed(() => {
  return props.videoUrl.includes('youtube') || props.videoUrl.includes('youtu.be');
});

const youtubeThumbnailUrl = computed(() => {
  if (!isYouTube.value) return '';
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = props.videoUrl.match(regExp);
  return match && match[2].length === 11
    ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
    : '';
});
</script>

<template>
  <div>
    <div v-if="isYouTube" class="relative px-4">
      <img :src="youtubeThumbnailUrl" alt="Video thumbnail" class="object-cover w-full h-full" />
      <div class="absolute inset-0 flex justify-center items-center">
        <Icon name="play" size="2xl" class="text-red-600" />
      </div>
    </div>
    <div v-else class="flex justify-center items-center h-48 bg-gray-200 px-28 rounded-md">
      <Icon name="play" size="2xl" class="text-gray-600" />
    </div>
  </div>
</template>
