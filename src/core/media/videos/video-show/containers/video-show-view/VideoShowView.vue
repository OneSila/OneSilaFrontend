<script lang="ts" setup>

import { useI18n } from "vue-i18n";
import { VideoPreview } from "./../video-preview";
import { Button } from "../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../shared/components/atoms/icon";
import { Link } from "../../../../../../shared/components/atoms/link";
import { truncateText } from "../../../../files/media";
import { Toast } from "../../../../../../shared/modules/toast";
const { t } = useI18n();

const props = defineProps<{ video: { videoUrl: string; title?: string | null; description?: string | null } }>();

const copyUrlToClipboard = async (value?: string | null) => {
  if (!value) {
    return;
  }
  try {
    await navigator.clipboard.writeText(value);
    Toast.success(t('shared.alert.toast.clipboardSuccess'))
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <VideoPreview :videoUrl="props.video.videoUrl" />

    <div class="space-y-4">
      <label class="font-semibold block text-sm leading-6 text-gray-900">
        {{ t('media.videos.labels.videoUrl') }}
      </label>
      <Flex class="mt-1">
        <FlexCell>
          <Link v-if="props.video.videoUrl" :path="props.video.videoUrl" external selectable class="min-w-0">
            <span class="block max-w-full truncate text-gray-900">{{ truncateText(props.video.videoUrl, 70) }}</span>
          </Link>
          <span v-else class="flex-grow text-gray-900">—</span>
        </FlexCell>
        <FlexCell>
          <Button :disabled="!props.video.videoUrl" @click="copyUrlToClipboard(props.video.videoUrl)" class="ml-4 flex-shrink-0">
            <Icon name="clipboard" class="h-5 w-5 text-gray-500" aria-hidden="true" />
          </Button>
        </FlexCell>
      </Flex>
      <div>
        <label class="font-semibold block text-sm leading-6 text-gray-900">
          {{ t('media.videos.labels.title') }}
        </label>
        <span class="text-gray-900">{{ props.video.title || '—' }}</span>
      </div>
      <div>
        <label class="font-semibold block text-sm leading-6 text-gray-900">
          {{ t('media.videos.labels.description') }}
        </label>
        <p class="text-gray-900 whitespace-pre-line">{{ props.video.description || '—' }}</p>
      </div>
    </div>
  </div>
</template>
