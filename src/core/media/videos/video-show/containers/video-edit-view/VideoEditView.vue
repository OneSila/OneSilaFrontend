<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { VideoPreview } from "./../video-preview";
import { WebsiteInput } from "../../../../../../shared/components/atoms/input-website";
import { TextInput } from "../../../../../../shared/components/atoms/input-text";
import { TextEditor } from "../../../../../../shared/components/atoms/input-text-editor";
import { updateVideoMutation } from "../../../../../../shared/api/mutations/media.js";
import { Toast } from "../../../../../../shared/modules/toast";
import apolloClient from "../../../../../../../apollo-client";
import { PrimaryButton } from "../../../../../../shared/components/atoms/button-primary";

const { t } = useI18n();
const props = defineProps<{ video: { videoUrl: string; id: string; title?: string | null; description?: string | null } }>();
const localVideoUrl = ref(props.video.videoUrl);
const localTitle = ref(props.video.title ?? '');
const localDescription = ref(props.video.description ?? '');
const emit = defineEmits(['show-view']);

const saveChanges = async () => {
  const variables = {
    data: {
      id: props.video.id,
      videoUrl: localVideoUrl.value,
      title: localTitle.value.trim() || null,
      description: localDescription.value.trim() || null,
    }
  };
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

    <div class="space-y-4">
      <div>
        <label class="font-semibold block text-sm leading-6 text-gray-900">
          {{ t('media.videos.labels.videoUrl') }}
        </label>
        <WebsiteInput class="mt-1 w-full" v-model="localVideoUrl" />
      </div>
      <div>
        <label class="font-semibold block text-sm leading-6 text-gray-900">
          {{ t('media.videos.labels.title') }}
        </label>
        <TextInput class="mt-1 w-full" v-model="localTitle" :placeholder="t('media.videos.placeholders.title')" />
      </div>
      <div>
        <label class="font-semibold block text-sm leading-6 text-gray-900">
          {{ t('media.videos.labels.description') }}
        </label>
        <TextEditor class="mt-1 h-32" v-model="localDescription" :placeholder="t('media.videos.placeholders.description')" />
      </div>
      <div class="flex justify-end">
        <PrimaryButton @click="saveChanges">
          {{ t('shared.button.save') }}
        </PrimaryButton>
      </div>
    </div>
  </div>
</template>
