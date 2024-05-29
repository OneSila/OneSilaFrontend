<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { VideoPreview } from "./../video-preview";
import { WebsiteInput } from "../../../../../../shared/components/atoms/input-website";
import { updateVideoMutation } from "../../../../../../shared/api/mutations/media.js";
import { Toast } from "../../../../../../shared/modules/toast";
import apolloClient from "../../../../../../../apollo-client";
import { PrimaryButton } from "../../../../../../shared/components/atoms/button-primary";

const { t } = useI18n();
const props = defineProps<{ video: { videoUrl: string, id: string } }>();
const localVideoUrl = ref(props.video.videoUrl);
const emit = defineEmits(['show-view']);

const saveChanges = async () => {
  const variables = { data: { id: props.video.id, videoUrl: localVideoUrl.value } };
  try {
    const { data } = await apolloClient.mutate({
      mutation: updateVideoMutation,
      variables
    });
    if (data && data.updateVideo) {
      Toast.success(t('media.videos.show.successfullyUpdated'));
      emit('show-view');
    }
  } catch (err) {
    console.error('Error updating video:', err);
    Toast.error(t('media.videos.show.updateFailed'));
  }
};

</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <VideoPreview :videoUrl="localVideoUrl" />

    <div>
      <label class="font-semibold block text-sm leading-6 text-gray-900">
        {{ t('media.videos.labels.videoUrl') }}
      </label>
      <div class="mt-1 flex">
        <WebsiteInput class="flex-grow" v-model="localVideoUrl" />
        <PrimaryButton @click="saveChanges" class="ml-4">
          {{ t('shared.button.save') }}
        </PrimaryButton>
      </div>
    </div>
  </div>
</template>
