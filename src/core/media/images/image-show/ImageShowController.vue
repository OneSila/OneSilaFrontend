<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from 'vue-router';
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import FilesSideBar from "../../files/containers/FilesSideBar.vue";
import MediaCards from "../../files/containers/MediaCards.vue";
import { Card } from "../../../../shared/components/atoms/card";
import { Button } from "../../../../shared/components/atoms/button";
import IconPencilPaper from "../../../../shared/components/atoms/icons/icon-pencil-paper.vue";
import IconX from "../../../../shared/components/atoms/icons/icon-x.vue";
import IconTrash from "../../../../shared/components/atoms/icons/icon-trash.vue";
import { ImageShowView } from "./containers/image-show-view";
import { ImageEditView } from "./containers/image-edit-view";
import { imageSubscription } from "../../../../shared/api/subscriptions/media.js";
import { deleteImageMutation } from "../../../../shared/api/mutations/media.js";
import {ApolloSubscription} from "../../../../shared/components/molecules/apollo-subscription";
import {ApolloAlertMutation} from "../../../../shared/components/molecules/apollo-alert-mutation";
import { Tabs } from "../../../../shared/components/molecules/tabs";
import {ProductsTabView} from "./containers/products-tab-view";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const editView = ref(route.query.editView === '1');
const tabItems = ref();
const selectedTab = ref('general');

const activeTab = 'images';
const id = route.params.id;

tabItems.value = [
    { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info' },
    { name: 'products', label: t('products.title'), icon: 'box' },
  ];
const toggleEditView = () => {
  editView.value = !editView.value;
};

const handleShowView = () => {
  editView.value = false;
};

const handleDeleteSuccess = () => {
  router.push({ name: 'media.images.list' });
};

const onTabChanged = (newValue) => {
  selectedTab.value = newValue;
};

</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[
        { path: { name: 'media.images.list' }, name: t('media.images.title') },
        { path: { name: 'media.images.show', params: { id: id } }, name: t('media.images.show.title') }
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
                      <h5 class="font-semibold text-lg dark:text-white-light">{{ t('media.images.show.title') }}</h5>
                    </FlexCell>
                    <FlexCell>
                      <Flex center>
                        <FlexCell class="mr-2">
                          <Button :customClass="'ltr:ml-auto rtl:mr-auto btn btn-primary p-2 rounded-full'" @click="toggleEditView" :disabled="selectedTab !== 'general'">
                            <IconPencilPaper v-if="!editView"/>
                            <IconX v-else/>
                          </Button>
                        </FlexCell>
                        <FlexCell>
                          <ApolloAlertMutation :mutation="deleteImageMutation" :mutation-variables="{ id: id }" @done="handleDeleteSuccess">
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

                  <Tabs :tabs="tabItems" @tab-changed="onTabChanged">
                    <template v-slot:general>
                      <ApolloSubscription :subscription="imageSubscription" :variables="{ pk: id }">
                        <template v-slot:default="{ result }">
                          <div v-if="result">
                            <ImageEditView v-if="editView" :image="result.image" @show-view="handleShowView" />
                            <ImageShowView v-else :image="result.image" />
                          </div>
                          <div v-else>
                            <span class="animate-spin border-2 border-black dark:border-white !border-l-transparent rounded-full w-5 h-5 inline-flex"></span>
                          </div>
                        </template>
                      </ApolloSubscription>
                    </template>
                    <template v-slot:products>
                      <ProductsTabView :id="id" />
                    </template>
                  </Tabs>

                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </GeneralTemplate>
</template>
