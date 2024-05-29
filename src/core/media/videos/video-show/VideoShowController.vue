<script lang="ts" setup>

import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useRouter } from 'vue-router';
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import FilesSideBar from "../../files/containers/FilesSideBar.vue";
import MediaCards from "../../files/containers/MediaCards.vue";
import IconPencilPaper from "../../../../shared/components/atoms/icons/icon-pencil-paper.vue";
import IconX from "../../../../shared/components/atoms/icons/icon-x.vue";
import { Card } from "../../../../shared/components/atoms/card";
import { Button } from "../../../../shared/components/atoms/button";
import { videoSubscription } from "../../../../shared/api/subscriptions/media.js";
import { VideoEditView } from "./containers/video-edit-view";
import { VideoShowView } from "./containers/video-show-view";
import { ApolloSubscription } from "../../../../shared/components/molecules/apollo-subscription";
import { deleteVideoMutation } from "../../../../shared/api/mutations/media.js";
import { ApolloAlertMutation } from "../../../../shared/components/molecules/apollo-alert-mutation";
import IconTrash from "../../../../shared/components/atoms/icons/icon-trash.vue";
import { TYPE_VIDEO } from "../../files/media";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

type Video = {
  id: string;
  videoUrl: string;
};

type VideoSubscriptionResult = {
  video: Video
}

const editView = ref(route.query.editView === '1')
const activeTab = TYPE_VIDEO;
const id = route.params.id;
const toggleEditView = () => {
  editView.value = !editView.value;
};

const handleShowView = () => {
  editView.value = false;
};

const handleDeleteSuccess = () => {
  router.push({name: 'media.videos.list',});
};

const getVideo = (result: VideoSubscriptionResult) => {
  return result.video;
};

</script>

<template>
  <GeneralTemplate>

      <template v-slot:breadcrumbs>
        <Breadcrumbs :links="[
          { path: { name: 'media.videos.list' }, name: t('media.videos.title') },
          { path: { name: 'media.videos.show', params: { id: id } }, name: t('media.videos.show.title') }
        ]" />
      </template>

     <template v-slot:content>
       <main class="flex-grow mt-2">
          <div class="flex">
            <FilesSideBar :active-tab="activeTab" />

            <div class="w-full">
                <div class="grid 2xl:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-6">
                    <MediaCards />

                    <div class="2xl:col-span-4 sm:col-span-2">
                        <Card class="card">
                          <Flex between class="mb-5">
                            <FlexCell>
                              <h5 class="font-semibold text-lg dark:text-white-light">{{ t('media.videos.show.title') }}</h5>
                            </FlexCell>
                            <FlexCell>
                              <Flex center>
                                <FlexCell class="mr-2">
                                  <Button :customClass="'ltr:ml-auto rtl:mr-auto btn btn-primary p-2 rounded-full'" @click="toggleEditView">
                                    <IconPencilPaper v-if="!editView"/>
                                    <IconX v-else/>
                                  </Button>
                                </FlexCell>
                                <FlexCell>
                                  <ApolloAlertMutation :mutation="deleteVideoMutation" :mutation-variables="{id: id}" @done="handleDeleteSuccess">
                                    <template v-slot="{ loading, confirmAndMutate }">
                                      <Button :customClass="'ltr:ml-auto rtl:mr-auto btn btn-danger p-2 rounded-full'" @click="confirmAndMutate">
                                        <IconTrash />
                                      </Button>
                                    </template>
                                  </ApolloAlertMutation>

                                </FlexCell>
                              </Flex>
                            </FlexCell>
                          </Flex>

                        <ApolloSubscription :subscription="videoSubscription" :variables="{pk: id}" >
                          <template v-slot:default="{ loading, error, result }">
                              <div v-if="result">
                                <VideoEditView v-if="editView" :video="getVideo(result)" @show-view="handleShowView" />
                                <VideoShowView v-else :video="getVideo(result)" />
                              </div>
                              <div v-else>
                                <span class="animate-spin border-2 border-black dark:border-white !border-l-transparent rounded-full w-5 h-5 inline-flex"></span>
                              </div>
                            </template>
                          </ApolloSubscription>
                        </Card>
                    </div>
                </div>
            </div>
          </div>
        </main>
     </template>

  </GeneralTemplate>
</template>