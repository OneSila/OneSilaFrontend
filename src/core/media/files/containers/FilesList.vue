<script lang="ts" setup>

import {computed, ref} from 'vue';
import { Card } from '../../../../shared/components/atoms/card';
import { Icon } from '../../../../shared/components/atoms/icon';
import { Image } from "../../../../shared/components/atoms/image";
import { Link } from "../../../../shared/components/atoms/link";
import { Button } from "../../../../shared/components/atoms/button";
import { FilterManager } from "../../../../shared/components/molecules/filter-manager";
import { Pagination } from "../../../../shared/components/molecules/pagination";
import {useI18n} from "vue-i18n";
import ActionsDropdown from "./ActionsDropdown.vue";
import { formatDate, getFileName, getFileSize, getId, getPath, TYPE_DOCUMENT, TYPE_IMAGE, TYPE_VIDEO} from "../media";
import {VideoListingPreview} from "../../videos/videos-list/containers/video-listing-preview";
import Swal from "sweetalert2";
import { SweetAlertOptions } from 'sweetalert2';
import apolloClient from "../../../../../apollo-client";
import { Toast } from "../../../../shared/modules/toast";
import { Checkbox } from "../../../../shared/components/atoms/checkbox";

const { t } = useI18n();
const props = defineProps<{
  label: string;
  listQuery: any;
  queryKey: string;
  searchConfig: any;
  defaultViewType?: string;
  refetchNeeded?: boolean;
  assignImages?: boolean;
  ids?: any[]
  bulkDeleteMutation?: any;
  bulkDeleteSuccessAlert?: string;
  bulkDeleteErrorAlert?: string;
}>();


const emit = defineEmits(['refetched', 'assign-media']);
const viewType = ref(props.defaultViewType || 'table');
const selectedEntities = ref<string[]>([]);
const haveBulkDelete = computed(() => !!props.bulkDeleteMutation);
const allSelected = (items: any[]): boolean =>
  items.length > 0 && selectedEntities.value.length === items.length;

const selectCheckbox = (id: string, value: boolean) => {
  if (value) {
    if (!selectedEntities.value.includes(id)) {
      selectedEntities.value.push(id);
    }
  } else {
    selectedEntities.value = selectedEntities.value.filter(v => v !== id);
  }
};

const updateSelectAll = (value: boolean, items: any[]) => {
  if (value) {
    selectedEntities.value = items.map(edge => edge.node.id);
  } else {
    selectedEntities.value = [];
  }
};


const refetchIfNecessary = (query, data, force = false) => {
  if (force || props.refetchNeeded) {
    query.refetch();
    emit('refetched');
  }
  return true;
}

const assignMedia = (media) => {
 emit('assign-media', media)
}

const deleteAll = async (query) => {
  const defaultSwalOptions = {
    title: t('shared.alert.mutationAlert.title'),
    text: t('shared.alert.mutationAlert.text'),
    confirmButtonText: t('shared.alert.mutationAlert.confirmButtonText'),
    cancelButtonText: t('shared.alert.mutationAlert.cancelButtonText'),
    icon: 'warning',
    showCancelButton: true,
    reverseButtons: true,
    padding: '2em'
  };

  const defaultSwalClasses = {
    popup: 'sweet-alerts',
    confirmButton: 'btn btn-secondary',
    cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3'
  }

  const swalWithBootstrapButtons = Swal.mixin({
    customClass: defaultSwalClasses,
    buttonsStyling: false
  });

  const result = await swalWithBootstrapButtons.fire(defaultSwalOptions as SweetAlertOptions);

  if (!result.isConfirmed) return;

  const inputData = selectedEntities.value.map(id => ({ id }));

  try {
    await apolloClient.mutate({
      mutation: props.bulkDeleteMutation,
      variables: { data: inputData }
    });

    Toast.success(
      props.bulkDeleteSuccessAlert || t('shared.alert.toast.bulkDeleteSuccess')
    );
    query.refetch();
  } catch (error) {
    Toast.error(
      props.bulkDeleteErrorAlert || t('shared.alert.toast.bulkDeleteError')
    );
  }

  selectedEntities.value = [];
};


</script>

<template>
  <Card :class="['card', 'overflow-auto', { 'max-h-[50rem]': assignImages }]">
    <div class="card-header flex justify-between items-center py-2 mb-2">
      <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-300">{{ props.label }}</h4>
      <div class="bg-gray-100 px-2 py-1 rounded-lg">
        <button class="mr-2" @click="viewType = 'table'" :class="{'text-blue-500': viewType === 'table'}">
          <Icon size="xl" name="table" />
        </button>
        <button @click="viewType = 'gallery'" :class="{'text-blue-500': viewType === 'gallery'}">
          <Icon size="xl" name="images" />
        </button>
      </div>
    </div>

    <hr />

    <div class="flex flex-col mt-2">
      <FilterManager :searchConfig="searchConfig">
        <template v-slot:variables="{ filterVariables, orderVariables, pagination }">
          <ApolloQuery :query="listQuery" fetch-policy="cache-and-network"
                       :variables="{
                         filter: {
                           ...filterVariables,
                           ...(ids && ids.length > 0 ? { NOT: { id: { inList: ids } } } : {})
                         },
                         order: orderVariables,
                         first: pagination.first,
                         last: pagination.last,
                         before: pagination.before,
                         after: pagination.after }">
            <template v-slot="{ result: { data }, query }">
              <div v-if="data && refetchIfNecessary(query, data)">

                <!-- Bulk Delete Button (Gallery View) -->
                <div v-if="selectedEntities.length > 0 && haveBulkDelete" class="flex justify-end gap-4 mb-2">

                  <span class="text-sm font-semibold text-gray-900 self-center">
                    {{ selectedEntities.length }} {{ t('shared.labels.selected') }}
                  </span>

                  <Button @click="deleteAll(query)" class="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    {{ t('shared.button.deleteAll') }}
                  </Button>
                </div>

                <div v-if="viewType === 'table'" class="overflow-x-auto">
                  <div class="inline-block min-w-full align-middle">
                    <div class="overflow-hidden">
                      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                          <tr class="text-gray-800 dark:text-gray-300">
                            <th v-if="haveBulkDelete" class="w-10 px-2">
                              <Checkbox
                                :modelValue="allSelected(data[queryKey].edges)"
                                @update:model-value="value => updateSelectAll(value, data[queryKey].edges)" />
                            </th>
                            <th class="p-3.5 text-sm text-start font-semibold">{{ t('media.media.labels.fileName') }}</th>
                            <th class="p-3.5 text-sm text-start font-semibold">{{ t('media.media.labels.lastModified') }}</th>
                            <th class="p-3.5 text-sm text-start font-semibold">{{ t('media.media.labels.fileSize') }}</th>
                            <th class="p-3.5 text-sm text-start font-semibold">{{ t('media.media.labels.owner') }}</th>
                            <th class="p-3.5 text-sm text-start font-semibold">{{ t('shared.labels.actions') }}</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                          <tr v-for="item in data[queryKey].edges" :key="item.node.id">
                            <td v-if="haveBulkDelete" class="px-2">
                              <Checkbox
                                :modelValue="selectedEntities.includes(item.node.id)"
                                @update:model-value="value => selectCheckbox(item.node.id, value)" />
                            </td>
                            <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">
                              <template v-if="assignImages">
                                <Button @click="assignMedia(item.node)">
                                  {{ getFileName(item.node) }}
                                </Button>
                              </template>
                              <template v-else>
                                <span v-if="item.node.type === TYPE_DOCUMENT">
                                  {{ getFileName(item.node) }}
                                </span>
                                <Link v-else :path="getPath(item.node)">
                                  {{ getFileName(item.node) }}
                                </Link>
                              </template>
                            </td>
                            <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">{{ formatDate(item.node.updatedAt) }}</td>
                            <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">{{ getFileSize(item.node) }}</td>
                            <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">
                              {{ item.node?.owner?.firstName || item.node?.owner?.lastName
                                  ? `${item.node.owner.firstName || ''} ${item.node.owner.lastName || ''}`.trim()
                                  : '-' }}
                            </td>
                            <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400 flex justify-center items-center">
                              <ActionsDropdown :id="getId(item.node)" :type="item.node.type" :item="item.node"
                                               @trigger-refetch="refetchIfNecessary(query, data, true)" />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div v-else class="gallery grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">


                  <div v-for="item in data[queryKey].edges" :key="item.node.id"
                       :class="['file-entry relative', selectedEntities.includes(item.node.id) ? 'border-2 border-indigo-600 rounded-md' : '']">

                    <Checkbox class="absolute top-2 left-2 z-10" v-if="haveBulkDelete"
                              :modelValue="selectedEntities.includes(item.node.id)"
                              @update:model-value="value => selectCheckbox(item.node.id, value)" />

                    <template v-if="item.node.type === TYPE_IMAGE">
                      <Button v-if="assignImages" @click="assignMedia(item.node)">
                        <div class="w-56 h-48 rounded-md overflow-hidden flex items-center justify-center">
                          <Image :source="item.node.onesilaThumbnailUrl" :alt="t('media.media.labels.fileThumbnail')" class="w-full h-full object-contain" />
                        </div>
                      </Button>
                      <Link v-else :path="getPath(item.node)">
                        <div class="w-56 h-48 rounded-md overflow-hidden flex items-center justify-center">
                          <Image :source="item.node.onesilaThumbnailUrl" :alt="t('media.media.labels.fileThumbnail')" class="w-full h-full object-contain" />
                        </div>
                      </Link>
                    </template>

                    <template v-else-if="item.node.type === TYPE_VIDEO">
                      <Button v-if="assignImages" @click="assignMedia(item.node)">
                        <VideoListingPreview :video-url="item.node.videoUrl" />
                      </Button>
                      <Link v-else :path="getPath(item.node)">
                        <VideoListingPreview :video-url="item.node.videoUrl" />
                      </Link>
                    </template>

                    <template v-else-if="item.node.type === TYPE_DOCUMENT">
                      <Button v-if="assignImages" @click="assignMedia(item.node)">
                        <div class="flex justify-center items-center h-48 bg-gray-200 px-28 rounded-md">
                          <Icon name="file-text" size="2xl" class="text-gray-600" />
                        </div>
                      </Button>
                      <div v-else class="flex justify-center items-center h-48 bg-gray-200 px-28 rounded-md">
                        <Icon name="file-text" size="2xl" class="text-gray-600" />
                      </div>
                    </template>

                    <div class="overlay-info absolute bottom-0 left-0 right-0 bg-gray-700 bg-opacity-50 text-white p-2 text-md font-medium hidden">
                      <Flex>
                        <FlexCell grow center>
                          {{ getFileName(item.node) }} {{ getFileSize(item.node) }}
                        </FlexCell>
                        <FlexCell center>
                          <ActionsDropdown :id="getId(item.node)" :type="item.node.type" :dark="true"
                                           :item="item.node" @trigger-refetch="refetchIfNecessary(query, data, true)" />
                        </FlexCell>
                      </Flex>
                    </div>
                  </div>
                </div>

                <div class="mt-4">
                  <hr />
                  <div class="mt-2">
                    <Pagination :page-info="data[queryKey].pageInfo" />
                  </div>
                </div>
              </div>
            </template>
          </ApolloQuery>
        </template>
      </FilterManager>
    </div>
  </Card>
</template>


<style scoped>
.gallery .file-entry:hover .overlay-info {
    display: block;
}

.gallery {
    display: grid;
    grid-gap: 4px;
    padding: 4px;
}

.file-entry {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>