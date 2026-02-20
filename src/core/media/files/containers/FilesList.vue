<script lang="ts" setup>

import { computed, onMounted, ref, watch } from 'vue';
import { Card } from '../../../../shared/components/atoms/card';
import { Icon } from '../../../../shared/components/atoms/icon';
import { Image } from "../../../../shared/components/atoms/image";
import { Link } from "../../../../shared/components/atoms/link";
import { Button } from "../../../../shared/components/atoms/button";
import { Selector } from "../../../../shared/components/atoms/selector";
import { FilterManager } from "../../../../shared/components/molecules/filter-manager";
import { Pagination } from "../../../../shared/components/molecules/pagination";
import { SearchInput } from "../../../../shared/components/molecules/search-input";
import { defaultSearchConfigVals } from "../../../../shared/components/organisms/general-search/searchConfig";
import { useI18n } from "vue-i18n";
import ActionsDropdown from "./ActionsDropdown.vue";
import { formatDate, getFileName, getFileSize, getId, getPath, IMAGE_TYPE_COLOR, IMAGE_TYPE_MOOD, IMAGE_TYPE_PACK, TYPE_DOCUMENT, TYPE_IMAGE, TYPE_VIDEO } from "../media";
import { VideoListingPreview } from "../../videos/videos-list/containers/video-listing-preview";
import Swal from "sweetalert2";
import { SweetAlertOptions } from 'sweetalert2';
import apolloClient from "../../../../../apollo-client";
import { Toast } from "../../../../shared/modules/toast";
import { Checkbox } from "../../../../shared/components/atoms/checkbox";
import { documentTypesQuerySelector } from "../../../../shared/api/queries/documentTypes.js";
import { companyLanguagesQuery } from "../../../../shared/api/queries/languages.js";
import PreviewDocument from "./PreviewDocument.vue";

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
  fixedMediaType?: string | null;
  fixedFilter?: Record<string, any> | null;
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


const limit = props.searchConfig.limitPerPage ?? defaultSearchConfigVals.limitPerPage;
const localSearch = ref('');
const ALL_MEDIA_TYPES = 'ALL';
const localMediaType = ref<string>(props.fixedMediaType || ALL_MEDIA_TYPES);
const localImageType = ref<string | null>(null);
const localDocumentType = ref<string | null>(null);
const localDocumentLanguage = ref<string | null>(null);
const ALL_DOCUMENT_IMAGE_FILTER = 'ALL';
const localDocumentImageFilter = ref<string>(ALL_DOCUMENT_IMAGE_FILTER);
const localCreatedAtSort = ref<'ASC' | 'DESC' | null>(null);
const documentTypeOptions = ref<{ label: string; value: string }[]>([]);
const documentLanguageOptions = ref<{ label: string; value: string }[]>([]);
const previewModalVisible = ref(false);
const previewDocumentUrl = ref<string | null>(null);
const previewDocumentName = ref<string>('');
const firstLocal = ref(limit);
const lastLocal = ref<number | null>(null);
const beforeLocal = ref<string | null>(null);
const afterLocal = ref<string | null>(null);
const isMediaTypeLocked = computed(() => Boolean(props.fixedMediaType));
const resolvedMediaTypeFilter = computed(() => {
  if (props.fixedMediaType) {
    return props.fixedMediaType;
  }
  return localMediaType.value === ALL_MEDIA_TYPES ? null : localMediaType.value;
});
const showImageTypeFilter = computed(() => resolvedMediaTypeFilter.value === TYPE_IMAGE);
const showDocumentFilters = computed(() => resolvedMediaTypeFilter.value === TYPE_DOCUMENT);
const mediaTypeOptions = computed(() => {
  const allOptions = [
    { label: t('products.products.variations.media.filters.all'), value: ALL_MEDIA_TYPES },
    { label: t('media.images.title'), value: TYPE_IMAGE },
    { label: t('media.documents.title'), value: TYPE_DOCUMENT },
    { label: t('media.videos.title'), value: TYPE_VIDEO },
  ];
  if (!isMediaTypeLocked.value) {
    return allOptions;
  }
  return allOptions.filter((option) => option.value === props.fixedMediaType);
});
const createdAtSortOptions = computed(() => ([
  { label: t('shared.sort.newest'), value: 'DESC' as const },
  { label: t('shared.sort.oldest'), value: 'ASC' as const },
]));
const documentImageFilterOptions = computed(() => ([
  { label: t('products.products.variations.media.filters.all'), value: ALL_DOCUMENT_IMAGE_FILTER },
  { label: t('media.documents.filters.imageDocuments'), value: 'true' },
  { label: t('media.documents.filters.fileDocuments'), value: 'false' },
]));

const handleLocalPagination = (nQ) => {
  if (!props.assignImages) return;
  const query = nQ.query;
  if (query.before) {
    firstLocal.value = null;
    lastLocal.value = limit;
    beforeLocal.value = query.before as string;
    afterLocal.value = null;
  } else if (query.after) {
    firstLocal.value = limit;
    lastLocal.value = null;
    beforeLocal.value = null;
    afterLocal.value = query.after as string;
  } else if (query.last === 'true') {
    firstLocal.value = null;
    lastLocal.value = limit;
    beforeLocal.value = null;
    afterLocal.value = null;
  } else if (query.first === 'true') {
    firstLocal.value = limit;
    lastLocal.value = null;
    beforeLocal.value = null;
    afterLocal.value = null;
  }
};

const resetLocalPagination = () => {
  firstLocal.value = limit;
  lastLocal.value = null;
  beforeLocal.value = null;
  afterLocal.value = null;
};

watch(localSearch, () => {
  resetLocalPagination();
});

watch(localImageType, () => {
  resetLocalPagination();
});

watch(localDocumentType, () => {
  resetLocalPagination();
});

watch(localDocumentLanguage, () => {
  resetLocalPagination();
});

watch(localDocumentImageFilter, () => {
  resetLocalPagination();
});

watch(localCreatedAtSort, () => {
  resetLocalPagination();
});

watch(() => props.fixedMediaType, (newValue) => {
  localMediaType.value = newValue || ALL_MEDIA_TYPES;
});

watch(localMediaType, (newValue) => {
  if (newValue !== TYPE_IMAGE) {
    localImageType.value = null;
  }
  if (newValue !== TYPE_DOCUMENT) {
    localDocumentType.value = null;
    localDocumentLanguage.value = null;
    localDocumentImageFilter.value = ALL_DOCUMENT_IMAGE_FILTER;
  }
  resetLocalPagination();
});

const imageTypeOptions = [
  { label: t('media.images.labels.packShot'), value: IMAGE_TYPE_PACK },
  { label: t('media.images.labels.moodShot'), value: IMAGE_TYPE_MOOD },
  { label: t('media.images.labels.colorShot'), value: IMAGE_TYPE_COLOR }
];

const loadDocumentTypeOptions = async () => {
  if (!props.assignImages) {
    return;
  }
  try {
    const { data } = await apolloClient.query({
      query: documentTypesQuerySelector,
      variables: { first: 100 },
      fetchPolicy: 'cache-first',
    });
    documentTypeOptions.value =
      data?.documentTypes?.edges?.map((edge: any) => ({
        label: edge.node.name,
        value: edge.node.id
      })) || [];
  } catch (error) {
    documentTypeOptions.value = [];
  }
};

const loadDocumentLanguageOptions = async () => {
  if (!props.assignImages) {
    return;
  }
  try {
    const { data } = await apolloClient.query({
      query: companyLanguagesQuery,
      fetchPolicy: 'cache-first',
    });
    documentLanguageOptions.value =
      data?.companyLanguages?.map((language: any) => ({
        label: language.name,
        value: language.code
      })) || [];
  } catch (error) {
    documentLanguageOptions.value = [];
  }
};

onMounted(() => {
  if (!props.assignImages) {
    return;
  }
  loadDocumentTypeOptions();
  loadDocumentLanguageOptions();
});

const buildAssignFilter = (filterVariables: Record<string, any> | null) => ({
  ...(props.fixedFilter || {}),
  ...(filterVariables || {}),
  ...(resolvedMediaTypeFilter.value ? { type: { exact: resolvedMediaTypeFilter.value } } : {}),
  ...(localSearch.value ? { search: localSearch.value } : {}),
  ...(showImageTypeFilter.value && localImageType.value ? { imageType: { exact: localImageType.value } } : {}),
  ...(showDocumentFilters.value && localDocumentType.value
    ? { documentType: { id: { exact: localDocumentType.value } } }
    : {}),
  ...(showDocumentFilters.value && localDocumentLanguage.value
    ? { documentLanguage: { exact: localDocumentLanguage.value } }
    : {}),
  ...(showDocumentFilters.value && localDocumentImageFilter.value !== ALL_DOCUMENT_IMAGE_FILTER
    ? { isDocumentImage: { exact: localDocumentImageFilter.value === 'true' } }
    : {}),
  ...(props.ids && props.ids.length > 0 ? { NOT: { id: { inList: props.ids } } } : {})
});

const buildListingFilter = (filterVariables: Record<string, any> | null) => ({
  ...(props.fixedFilter || {}),
  ...(filterVariables || {}),
  ...(props.ids && props.ids.length > 0 ? { NOT: { id: { inList: props.ids } } } : {})
});

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

const removeQueryAndHash = (value: string) => value.split('#')[0].split('?')[0];

const isPdfPath = (value?: string | null) => {
  if (!value) {
    return false;
  }
  return removeQueryAndHash(value).toLowerCase().endsWith('.pdf');
};

const isPdfDocument = (media: any) => {
  if (media?.type !== TYPE_DOCUMENT) {
    return false;
  }
  return isPdfPath(media?.file?.name) || isPdfPath(media?.fileUrl) || isPdfPath(media?.file?.url);
};

const openDocumentPreview = (media: any) => {
  if (!isPdfDocument(media)) {
    return;
  }
  const url = media?.fileUrl || media?.file?.url || null;
  if (!url) {
    return;
  }
  previewDocumentUrl.value = url;
  previewDocumentName.value = media?.file?.name || getFileName(media);
  previewModalVisible.value = true;
};

const getDocumentThumbnailSource = (media: any): string | null => {
  return media?.documentImageThumbnailUrl || null;
};

const getDocumentTypeLabel = (media: any): string | null => {
  if (media?.type !== TYPE_DOCUMENT) {
    return null;
  }
  return media?.documentType?.name || media?.documentType?.code || null;
};

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

    <div v-if="assignImages" class="px-4 mb-2">
      <div class="flex flex-wrap items-end gap-3">
        <div class="min-w-[220px] flex-1">
          <SearchInput v-model="localSearch" :updateRoute="false" />
        </div>
        <div v-if="!isMediaTypeLocked" class="min-w-[180px] self-center">
          <Selector
            v-model="localMediaType"
            class="h-11"
            :options="mediaTypeOptions"
            label-by="label"
            value-by="value"
            :placeholder="t('shared.labels.type')"
            :filterable="!isMediaTypeLocked"
            :removable="false"
          />
        </div>
        <div v-if="showImageTypeFilter" class="min-w-[200px] self-center">
          <Selector
            v-model="localImageType"
            class="h-11"
            :options="imageTypeOptions"
            label-by="label"
            value-by="value"
            :placeholder="t('media.images.placeholders.imageType')"
            :removable="true"
          />
        </div>
        <div v-if="showDocumentFilters" class="min-w-[220px] self-center">
          <Selector
            v-model="localDocumentType"
            class="h-11"
            :options="documentTypeOptions"
            label-by="label"
            value-by="value"
            :placeholder="t('media.documents.filters.documentType')"
            :filterable="true"
            :removable="true"
          />
        </div>
        <div v-if="showDocumentFilters" class="min-w-[220px] self-center">
          <Selector
            v-model="localDocumentLanguage"
            class="h-11"
            :options="documentLanguageOptions"
            label-by="label"
            value-by="value"
            :placeholder="t('shared.labels.language')"
            :filterable="true"
            :removable="true"
          />
        </div>
        <div v-if="showDocumentFilters" class="min-w-[220px] self-center">
          <Selector
            v-model="localDocumentImageFilter"
            class="h-11"
            :options="documentImageFilterOptions"
            label-by="label"
            value-by="value"
            :placeholder="t('media.documents.filters.documentKind')"
            :filterable="false"
            :removable="false"
          />
        </div>
        <div class="min-w-[180px] self-center">
          <Selector
            v-model="localCreatedAtSort"
            class="h-11"
            :options="createdAtSortOptions"
            label-by="label"
            value-by="value"
            :placeholder="t('media.media.labels.sortByCreatedAt')"
            :filterable="false"
            :removable="true"
          />
        </div>
      </div>
    </div>

    <hr />

    <div class="flex flex-col mt-2">
      <FilterManager :searchConfig="searchConfig">
        <template v-slot:variables="{ filterVariables, orderVariables, pagination }">
          <ApolloQuery :query="listQuery" fetch-policy="cache-and-network"
                       :variables="assignImages ? {
                         filter: buildAssignFilter(filterVariables),
                         order: localCreatedAtSort ? { createdAt: localCreatedAtSort } : orderVariables,
                         first: firstLocal,
                         last: lastLocal,
                         before: beforeLocal,
                         after: afterLocal
                       } : {
                         filter: buildListingFilter(filterVariables),
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
                                <Link :path="getPath(item.node)">
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
                                               :can-preview="!assignImages && isPdfDocument(item.node)"
                                               @preview="openDocumentPreview"
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
                    <div
                      v-if="item.node.type === TYPE_DOCUMENT && getDocumentTypeLabel(item.node)"
                      :class="[
                        'absolute left-2 z-10 max-w-[70%] truncate rounded-full bg-black/70 px-2 py-1 text-xs text-white',
                        haveBulkDelete ? 'top-10' : 'top-2'
                      ]"
                    >
                      {{ getDocumentTypeLabel(item.node) }}
                    </div>
                    <Button
                      v-if="!assignImages && isPdfDocument(item.node)"
                      class="absolute top-2 right-2 z-10 rounded-md border border-gray-300 bg-gray-100 p-2 shadow-sm hover:bg-gray-200"
                      @click.stop="openDocumentPreview(item.node)"
                    >
                      <Icon name="arrows-up-down-left-right" class="h-4 w-4 text-blue-900" />
                    </Button>

                    <template v-if="item.node.type === TYPE_IMAGE">
                      <Button v-if="assignImages" @click="assignMedia(item.node)">
                        <div class="w-56 h-48 rounded-md overflow-hidden flex items-center justify-center">
                          <Image :source="item.node.imageWebUrl" :alt="t('media.media.labels.fileThumbnail')" class="w-full h-full object-contain" />
                        </div>
                      </Button>
                      <Link v-else :path="getPath(item.node)">
                        <div class="w-56 h-48 rounded-md overflow-hidden flex items-center justify-center">
                          <Image :source="item.node.imageWebUrl" :alt="t('media.media.labels.fileThumbnail')" class="w-full h-full object-contain" />
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
                        <div class="w-56 h-48 rounded-md overflow-hidden flex items-center justify-center bg-gray-200">
                          <Image
                            v-if="getDocumentThumbnailSource(item.node)"
                            :source="getDocumentThumbnailSource(item.node)"
                            :alt="t('media.media.labels.fileThumbnail')"
                            class="w-full h-full object-contain"
                          />
                          <Icon v-else name="file-text" size="2xl" class="text-gray-600" />
                        </div>
                      </Button>
                      <Link v-else :path="getPath(item.node)">
                        <div class="w-56 h-48 rounded-md overflow-hidden flex items-center justify-center bg-gray-200">
                          <Image
                            v-if="getDocumentThumbnailSource(item.node)"
                            :source="getDocumentThumbnailSource(item.node)"
                            :alt="t('media.media.labels.fileThumbnail')"
                            class="w-full h-full object-contain"
                          />
                          <Icon v-else name="file-text" size="2xl" class="text-gray-600" />
                        </div>
                      </Link>
                    </template>

                    <div class="overlay-info absolute bottom-0 left-0 right-0 bg-gray-700 bg-opacity-50 text-white p-2 text-md font-medium hidden">
                      <Flex>
                        <FlexCell grow center>
                          {{ getFileName(item.node) }} {{ getFileSize(item.node) }}
                        </FlexCell>
                        <FlexCell center>
                          <ActionsDropdown :id="getId(item.node)" :type="item.node.type" :dark="true"
                                           :item="item.node"
                                           :can-preview="!assignImages && isPdfDocument(item.node)"
                                           @preview="openDocumentPreview"
                                           @trigger-refetch="refetchIfNecessary(query, data, true)" />
                        </FlexCell>
                      </Flex>
                    </div>
                  </div>
                </div>

                <div class="mt-4">
                  <hr />
                  <div class="mt-2">
                    <Pagination :page-info="data[queryKey].pageInfo" :change-query-params="!assignImages" @query-changed="handleLocalPagination" />
                  </div>
                </div>
              </div>
            </template>
          </ApolloQuery>
        </template>
      </FilterManager>
    </div>
  </Card>
  <PreviewDocument
    v-model="previewModalVisible"
    :document-url="previewDocumentUrl"
    :document-name="previewDocumentName"
  />
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
