<script lang="ts" setup>

import { useI18n } from "vue-i18n";
import { VideoPreview } from "./../video-preview";
import { Button } from "../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../shared/components/atoms/icon";
import { Label } from "../../../../../../shared/components/atoms/label";
import { Toast } from "../../../../../../shared/modules/toast";
const { t } = useI18n();

const props = defineProps<{ video: { videoUrl: string } }>();

const copyUrlToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.video.videoUrl);
    Toast.success(t('shared.alert.toast.clipboardSuccess'))
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <VideoPreview :videoUrl="props.video.videoUrl" />

    <div>
      <label class="font-semibold block text-sm leading-6 text-gray-900">
        {{ t('media.videos.labels.videoUrl') }}
      </label>
      <Flex class="mt-1">
        <FlexCell>
          <span class="flex-grow text-gray-900">{{ props.video.videoUrl }}</span>
        </FlexCell>
        <FlexCell>
          <Button @click="copyUrlToClipboard" class="ml-4 flex-shrink-0">
            <Icon name="clipboard" class="h-5 w-5 text-gray-500" aria-hidden="true" />
          </Button>
        </FlexCell>
      </Flex>
    </div>
  </div>
</template>