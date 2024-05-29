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
import {Card} from "../../../../shared/components/atoms/card";
import {Button} from "../../../../shared/components/atoms/button";

const route = useRoute();
const { t } = useI18n();

const editView = ref(route.query.editView === '1')
const activeTab = 'documents';

const toggleEditView = () => {
  editView.value = !editView.value;
};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[
        { path: { name: 'media.documents.list' }, name: t('media.documents.title') },
        { path: { name: 'media.documents.show', params: { id: route.params.id } }, name: t('media.documents.show.title') }
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
                              <FlexCell>
                                <Button :customClass="'ltr:ml-auto rtl:mr-auto btn btn-primary p-2 rounded-full'" @click="toggleEditView">
                                  <IconPencilPaper v-if="!editView"/>
                                  <IconX v-else/>
                                </Button>
                              </FlexCell>
                            </Flex>
                          </FlexCell>
                        </Flex>

                        <div v-if="editView">EDIT</div>
                        <div v-else>SHOW</div>
                      </Card>
                  </div>
              </div>
          </div>
        </div>
      </main>
   </template>

</GeneralTemplate>
</template>