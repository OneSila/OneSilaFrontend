<script setup lang="ts">
import { computed, ref, watch, withDefaults } from 'vue';
import {Modal} from '../../../../../../shared/components/atoms/modal';
import {Card} from '../../../../../../shared/components/atoms/card';
import {WebsiteInput} from "../../../../../../shared/components/atoms/input-website";
import { TextInput } from "../../../../../../shared/components/atoms/input-text";
import {useI18n} from "vue-i18n";
import {Icon} from "../../../../../../shared/components/atoms/icon";
import {Button} from "../../../../../../shared/components/atoms/button";
import {createVideosMutation, createMediaProductThroughMutation} from "../../../../../../shared/api/mutations/media.js"
import {processGraphQLErrors} from "../../../../../../shared/utils";
import {Toast} from "../../../../../../shared/modules/toast";
import {VideoPreview} from "../../../../videos/video-show/containers/video-preview";
import apolloClient from "../../../../../../../apollo-client";

const props = withDefaults(
  defineProps<{ modelValue: boolean; productId?: string; salesChannelId?: string; singleUpload?: boolean }>(),
  {
    singleUpload: false,
  }
);
const emit = defineEmits(['update:modelValue', 'entries-created']);
type VideoEntry = {
  videoUrl: string;
  title: string;
  description: string;
};
const websites = ref<VideoEntry[]>([{ videoUrl: '', title: '', description: '' }]);

const localShowModal = ref(props.modelValue);
const {t} = useI18n();
const singleUpload = computed(() => props.singleUpload ?? false);

const stripExtension = (value: string) => value.replace(/\.[^/.]+$/, '');

const getDefaultTitleFromUrl = (value: string) => {
  if (!value) {
    return '';
  }
  try {
    const parsed = new URL(value);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const lastSegment = segments.pop();
    if (!lastSegment) {
      return stripExtension(parsed.hostname);
    }
    const decoded = decodeURIComponent(lastSegment);
    const stripped = stripExtension(decoded);
    return stripped || decoded;
  } catch (error) {
    const fallbackSegments = value.split('/').filter(Boolean);
    const lastSegment = fallbackSegments.pop();
    if (!lastSegment) {
      return value;
    }
    const stripped = stripExtension(lastSegment);
    return stripped || lastSegment;
  }
};


watch(() => props.modelValue, (newVal) => {
  localShowModal.value = newVal;
});

const updateWebsite = (index, value) => {
  websites.value[index].videoUrl = value;
  if (!websites.value[index].title.trim()) {
    websites.value[index].title = getDefaultTitleFromUrl(value);
  }
};

const closeModal = () => {
  localShowModal.value = false;
  websites.value = [{ videoUrl: '', title: '', description: '' }];
  emit('update:modelValue', false);
};

const addWebsiteInput = () => {
  if (singleUpload.value) {
    return;
  }
  if (websites.value[websites.value.length - 1]?.videoUrl?.trim()) {
    websites.value.push({ videoUrl: '', title: '', description: '' });
  }
};

const onError = (error) => {
  const validationErrors = processGraphQLErrors(error, t);
  for (const key in validationErrors) {
    if (validationErrors.hasOwnProperty(key)) {
      Toast.error(validationErrors[key]);
    }
  }
};

const onVideosCreated = async (d) => {

  if (props.productId) {
    for (const video of d.data.createVideos) {
      const variables: any = {
        product: {id: props.productId},
        media: {id: video.id},
      };
      if (props.salesChannelId) {
        variables.salesChannel = { id: props.salesChannelId };
      }
      try {
        const {data} = await apolloClient.mutate({
          mutation: createMediaProductThroughMutation,
          variables: {data: variables}
        });
      } catch (error) {
        const validationErrors = processGraphQLErrors(error, t);
        if (validationErrors['__all__']) {
          Toast.error(validationErrors['__all__']);
        }
        console.error('Failed to link video and product:', error);
      }
    }
  }

  emit('entries-created', d.data.createVideos);
  Toast.success(t('media.videos.create.successfullyCreated'));
  closeModal();
};

const removeWebsite = (index: number) => {
  if (websites.value.length > 1) {
    websites.value.splice(index, 1);
  } else {
    websites.value[0] = { videoUrl: '', title: '', description: '' };
  }
};


</script>

<template>
  <div>
    <Modal v-model="localShowModal" @closed="closeModal">
      <Card class="modal-content w-2/3">
        <div class="mb-4">
          <h3 class="text-xl font-semibold leading-7 text-gray-900">{{ t('media.videos.upload') }}</h3>
        </div>
        <div v-for="(website, index) in websites" :key="index">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <VideoPreview :videoUrl="website.videoUrl"/>

            <div class="mt-1 w-full">
              <Flex vertical>
                <FlexCell>
                  <label
                      class="font-semibold block text-sm leading-6 text-gray-900">{{
                      t('media.videos.labels.videoUrl')
                    }}</label>
                </FlexCell>
                <FlexCell>
                  <Flex>
                    <FlexCell grow>
                      <WebsiteInput
                          class="w-full"
                          v-model:model-value="websites[index].videoUrl"
                          @update:model-value="updateWebsite(index, $event)"
                      />
                    </FlexCell>
                    <FlexCell center>
                      <Button class="btn btn-outline-danger ml-2" @click="removeWebsite(index)">
                        <Icon name="trash"/>
                      </Button>
                    </FlexCell>
                  </Flex>
                </FlexCell>
                <FlexCell class="mt-2">
                  <label class="font-semibold block text-sm leading-6 text-gray-900">
                    {{ t('media.videos.labels.title') }}
                  </label>
                  <TextInput
                    class="w-full"
                    v-model="websites[index].title"
                    :placeholder="t('media.videos.placeholders.title')"
                  />
                </FlexCell>
                <FlexCell class="mt-2">
                  <label class="font-semibold block text-sm leading-6 text-gray-900">
                    {{ t('media.videos.labels.description') }}
                  </label>
                  <TextInput
                    class="w-full"
                    v-model="websites[index].description"
                    :placeholder="t('media.videos.placeholders.description')"
                  />
                </FlexCell>
              </Flex>
            </div>
          </div>

        </div>
        <button v-if="!singleUpload" class="btn bg-primary text-white mt-2" @click="addWebsiteInput">
          <Icon name="circle-plus"/>
        </button>
        <ApolloMutation
          :mutation="createVideosMutation"
          :variables="{
            data: websites
              .filter((entry) => entry.videoUrl.trim().length > 0)
              .map((entry) => ({
                videoUrl: entry.videoUrl.trim(),
                title: entry.title.trim() || null,
                description: entry.description.trim() || null,
              }))
          }"
                        @done="onVideosCreated" @error="onError">
          <template v-slot="{ mutate, loading, error }">
            <div class="flex justify-end gap-4 mt-4">
              <Button class="btn btn-outline-dark" @click="closeModal">{{ t('shared.button.cancel') }}</Button>
              <Button class="btn btn-primary" :disabled="loading || !websites.every((entry) => entry.videoUrl.trim().length > 0)"
                      @click="mutate">{{ t('shared.button.submit') }}
              </Button>
            </div>
          </template>
        </ApolloMutation>
      </Card>
    </Modal>
  </div>
</template>
