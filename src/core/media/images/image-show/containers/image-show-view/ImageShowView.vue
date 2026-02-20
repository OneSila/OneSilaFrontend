<script lang="ts" setup>

import { defineProps } from "vue";
import { useI18n } from "vue-i18n";
import { Button } from "../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../shared/components/atoms/icon";
import { Image } from "../../../../../../shared/components/atoms/image";
import { Link } from "../../../../../../shared/components/atoms/link";
import { Toast } from "../../../../../../shared/modules/toast";
import {getFileName, getFileSize, truncateText} from "../../../../files/media";

const { t } = useI18n();
const props = defineProps<{ image: { imageWebUrl: string, imageType: string, id: string, image: {size: string, name: string}; imageUrl: string, title?: string | null, description?: string | null } }>();

const imageTypeOptions = {
      PACK: t('media.images.labels.packShot'),
      MOOD: t('media.images.labels.moodShot'),
      COLOR: t('media.images.labels.colorShot')
    };

const copyUrlToClipboard = async (value?: string | null) => {
  if (!value) {
    return;
  }
  try {
    await navigator.clipboard.writeText(value);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (err) {
    console.error('Failed to copy:', err);
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
};

</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Image :source="image.imageWebUrl" alt="Editable Image Preview" class="w-full max-w-[35rem] rounded-md" />
    </div>
    <Flex vertical>
      <FlexCell>
        <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('media.images.labels.imageUrl') }}</label>
        <div class="flex items-center">
          <Link v-if="props.image.imageUrl" :path="props.image.imageUrl" external selectable class="min-w-0 flex-grow">
            <span class="block max-w-full truncate text-gray-900">{{ truncateText(props.image.imageUrl, 70) }}</span>
          </Link>
          <span v-else class="flex-grow text-gray-900">—</span>
          <Button :disabled="!props.image.imageUrl" @click="copyUrlToClipboard(props.image.imageUrl)" class="ml-4">
            <Icon name="clipboard" class="h-5 w-5 text-gray-500" aria-hidden="true" />
          </Button>
        </div>
      </FlexCell>
      <FlexCell>
        <label class="mt-2 font-semibold block text-sm leading-6 text-gray-900">{{ t('shared.labels.name') }}</label>
        <span class="flex-grow text-gray-900">{{ getFileName(image) }}</span>
      </FlexCell>
      <FlexCell>
        <label class="mt-2 font-semibold block text-sm leading-6 text-gray-900">{{ t('media.media.labels.fileSize') }}</label>
        <span class="flex-grow text-gray-900">{{ getFileSize(image) }}</span>
      </FlexCell>
      <FlexCell>
        <label class="mt-2 font-semibold block text-sm leading-6 text-gray-900">{{ t('media.images.labels.title') }}</label>
        <span class="flex-grow text-gray-900">{{ image.title || '—' }}</span>
      </FlexCell>
      <FlexCell>
        <label class="mt-2 font-semibold block text-sm leading-6 text-gray-900">{{ t('media.images.labels.description') }}</label>
        <p class="flex-grow text-gray-900 whitespace-pre-line">{{ image.description || '—' }}</p>
      </FlexCell>
      <FlexCell>
          <div class="mt-2">
          <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('media.images.labels.imageType') }}</label>
          <div class="flex items-center">
            <span class="flex-grow text-gray-900">{{ imageTypeOptions[image.imageType] }}</span>
          </div>
        </div>
      </FlexCell>

    </Flex>
  </div>
</template>
