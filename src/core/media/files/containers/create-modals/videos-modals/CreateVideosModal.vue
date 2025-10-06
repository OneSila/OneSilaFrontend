<script setup lang="ts">
import {ref, watch} from 'vue';
import {Modal} from '../../../../../../shared/components/atoms/modal';
import {Card} from '../../../../../../shared/components/atoms/card';
import {WebsiteInput} from "../../../../../../shared/components/atoms/input-website";
import {useI18n} from "vue-i18n";
import {Icon} from "../../../../../../shared/components/atoms/icon";
import {Button} from "../../../../../../shared/components/atoms/button";
import {createVideosMutation, createMediaProductThroughMutation} from "../../../../../../shared/api/mutations/media.js"
import {processGraphQLErrors} from "../../../../../../shared/utils";
import {Toast} from "../../../../../../shared/modules/toast";
import {VideoPreview} from "../../../../videos/video-show/containers/video-preview";
import apolloClient from "../../../../../../../apollo-client";

const props = defineProps<{ modelValue: boolean; productId?: string; salesChannelId?: string }>();
const emit = defineEmits(['update:modelValue', 'entries-created']);
const websites = ref(['']);

const localShowModal = ref(props.modelValue);
const {t} = useI18n();


watch(() => props.modelValue, (newVal) => {
  localShowModal.value = newVal;
});

const openModal = () => {
  localShowModal.value = true;
};

const updateWebsite = (index, value) => {
  websites.value[index] = value;
};

const closeModal = () => {
  localShowModal.value = false;
  websites.value = [''];
  emit('update:modelValue', false);
};

const addWebsiteInput = () => {
  if (websites.value[websites.value.length - 1]) {
    websites.value.push('');
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
        console.log('Linking success:', data);
      } catch (error) {
        const validationErrors = processGraphQLErrors(error, t);
        if (validationErrors['__all__']) {
          Toast.error(validationErrors['__all__']);
        }
        console.error('Failed to link video and product:', error);
      }
    }
  }

  emit('entries-created');
  Toast.success(t('media.videos.create.successfullyCreated'));
  closeModal();
};

const removeWebsite = (index: number) => {
  if (websites.value.length > 1) {
    websites.value.splice(index, 1);
  } else {
    websites.value[0] = '';
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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <VideoPreview :videoUrl="website"/>

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
                          v-model:model-value="websites[index]"
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
              </Flex>
            </div>
          </div>

        </div>
        <button class="btn bg-primary text-white mt-2" @click="addWebsiteInput">
          <Icon name="circle-plus"/>
        </button>
        <ApolloMutation :mutation="createVideosMutation" :variables="{ data: websites.map(url => ({ videoUrl: url })) }"
                        @done="onVideosCreated" @error="onError">
          <template v-slot="{ mutate, loading, error }">
            <div class="flex justify-end gap-4 mt-4">
              <Button class="btn btn-outline-dark" @click="closeModal">{{ t('shared.button.cancel') }}</Button>
              <Button class="btn btn-primary" :disabled="loading || !websites.every(url => url.trim().length > 0)"
                      @click="mutate">{{ t('shared.button.submit') }}
              </Button>
            </div>
          </template>
        </ApolloMutation>
      </Card>
    </Modal>
  </div>
</template>
