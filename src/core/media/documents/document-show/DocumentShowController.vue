<script lang="ts" setup>

import { ref } from "vue";
import { useI18n } from "vue-i18n";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import FilesSideBar from "../../files/containers/FilesSideBar.vue";
import MediaCards from "../../files/containers/MediaCards.vue";
import IconPencilPaper from "../../../../shared/components/atoms/icons/icon-pencil-paper.vue";
import IconX from "../../../../shared/components/atoms/icons/icon-x.vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import { Card } from "../../../../shared/components/atoms/card";
import { Button } from "../../../../shared/components/atoms/button";
import { getFileQuery } from "../../../../shared/api/queries/media.js";
import { ApolloAlertMutation } from "../../../../shared/components/molecules/apollo-alert-mutation";
import { deleteFileMutation } from "../../../../shared/api/mutations/media.js";
import IconTrash from "../../../../shared/components/atoms/icons/icon-trash.vue";
import { TYPE_DOCUMENT } from "../../files/media";
import { DocumentEditView } from "./containers/document-edit-view";
import { DocumentShowView } from "./containers/document-show-view";
import { Tabs } from "../../../../shared/components/molecules/tabs";
import { ProductsTabView } from "../../images/image-show/containers/products-tab-view";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

type DocumentData = {
  id: string;
  fileUrl: string;
  imageWebUrl?: string | null;
  isDocumentImage?: boolean | null;
  documentImageThumbnailUrl?: string | null;
  title?: string | null;
  description?: string | null;
  documentLanguage?: string | null;
  documentType?: { id: string; name: string; code?: string | null } | null;
  file?: { size?: number | string | null; name?: string | null; url?: string | null } | null;
};

type DocumentQueryResult = {
  file: DocumentData;
}

const editView = ref(route.query.editView === '1');
const selectedTab = ref('general');
const tabItems = ref([
  { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info' },
  { name: 'products', label: t('products.title'), icon: 'box' }
]);
const activeTab = TYPE_DOCUMENT;
const id = ref(String(route.params.id));

const toggleEditView = () => {
  editView.value = !editView.value;
};

const handleShowView = () => {
  editView.value = false;
};

const handleDeleteSuccess = () => {
  router.push({ name: 'media.documents.list' });
};

const getDocument = (result: DocumentQueryResult) => {
  return result.file;
};

const onTabChanged = (newValue) => {
  selectedTab.value = newValue;
  if (newValue !== 'general') {
    editView.value = false;
  }
};

const handleShowViewAndRefresh = (query: { refetch?: () => void }) => {
  handleShowView();
  query?.refetch?.();
};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[
        { path: { name: 'media.documents.list' }, name: t('media.documents.title') },
        { path: { name: 'media.documents.show', params: { id: id } }, name: t('media.documents.show.title') }
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
                            <h5 class="font-semibold text-lg dark:text-white-light">{{ t('media.documents.show.title') }}</h5>
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
                                <ApolloAlertMutation :mutation="deleteFileMutation" :mutation-variables="{id: id}" @done="handleDeleteSuccess">
                                  <template v-slot="{ confirmAndMutate }">
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
                            <ApolloQuery :query="getFileQuery" fetch-policy="cache-and-network" :variables="{ id }">
                              <template v-slot="{ result: { data }, query, isLoading, error }">
                                <div v-if="data?.file">
                                  <DocumentEditView v-if="editView" :document="getDocument(data)" @show-view="handleShowViewAndRefresh(query)" />
                                  <DocumentShowView v-else :document="getDocument(data)" />
                                </div>
                                <div v-else-if="isLoading">
                                  <span class="animate-spin border-2 border-black dark:border-white !border-l-transparent rounded-full w-5 h-5 inline-flex"></span>
                                </div>
                                <div v-else-if="error" class="text-red-500 text-sm">
                                  {{ error.message }}
                                </div>
                              </template>
                            </ApolloQuery>
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
