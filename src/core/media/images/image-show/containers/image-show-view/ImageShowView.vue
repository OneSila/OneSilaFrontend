<script lang="ts" setup>
import { defineProps } from "vue";
import { useI18n } from "vue-i18n";
import { Button } from "../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../shared/components/atoms/icon";
import { Toast } from "../../../../../../shared/modules/toast";

const { t } = useI18n();
const props = defineProps<{ image: { imageUrl: string } }>();

const imageTypeOptions = {
      PACK: t('media.images.labels.packShot'),
      MOOD: t('media.images.labels.moodShot')
    };
const copyUrlToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.image.imageWebUrl);
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
      <img :src="props.image.imageWebUrl" alt="Image Preview" class="w-full" />
    </div>
    <Flex vertical>
      <FlexCell>
        <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('media.images.labels.imageUrl') }}</label>
        <div class="mt-1 flex items-center">
          <span class="flex-grow text-gray-900">{{ props.image.imageWebUrl }}</span>
          <Button @click="copyUrlToClipboard" class="ml-4">
            <Icon name="clipboard" class="h-5 w-5 text-gray-500" aria-hidden="true" />
          </Button>
        </div>
      </FlexCell>
      <FlexCell>
          <div class="mt-2">
          <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('media.images.labels.imageType') }}</label>
          <div class="mt-1 flex items-center">
            <span class="flex-grow text-gray-900">{{ imageTypeOptions[props.image.imageType] }}</span>
          </div>
        </div>
      </FlexCell>

    </Flex>
  </div>
</template>
