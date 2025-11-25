<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { dashboardSectionsWithCardsQuery } from '../../../../../../../shared/api/queries/dashboardCards.js';
import apolloClient from '../../../../../../../../apollo-client';
import { DocumentNode, parse } from 'graphql';
import DashboardUserSectionsShowView from './DashboardUserSectionsShowView.vue';
import DashboardUserSectionsEditView from './DashboardUserSectionsEditView.vue';
import type { DashboardCardState, EditableDashboardSection } from './types';

const { t } = useI18n();

type DashboardUserSectionsEditViewExpose = {
  saveSections: () => Promise<void>;
  isSaving: { value: boolean };
  canSave: { value: boolean };
  resetSections?: () => void;
  hasChanges?: { value: boolean };
};

const sections = ref<EditableDashboardSection[]>([]);
const showCompleted = reactive<Record<string, boolean>>({});
const cardsRefreshing = ref(false);
const editView = ref(false);
const editViewRef = ref<DashboardUserSectionsEditViewExpose | null>(null);
const savingSections = ref(false);
const canSaveSections = ref(false);

const hasSections = computed(() => sections.value.length > 0);
const handleShowCompletedUpdate = (payload: { sectionId: string; value: boolean }) => {
  showCompleted[payload.sectionId] = payload.value;
};
const discardSectionsSwalOptions = computed<SweetAlertOptions>(() => ({
  title: t('dashboard.cards.userSections.edit.unsavedTitle'),
  text: t('dashboard.cards.userSections.edit.unsavedText'),
  confirmButtonText: t('dashboard.cards.userSections.edit.unsavedConfirm'),
  cancelButtonText: t('dashboard.cards.userSections.edit.unsavedCancel'),
  icon: 'warning',
  showCancelButton: true,
  reverseButtons: true,
  padding: '2em'
}));

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    popup: 'sweet-alerts',
    confirmButton: 'btn btn-danger',
    cancelButton: 'btn btn-outline-primary ltr:mr-3 rtl:ml-3'
  },
  buttonsStyling: false
});

const toggleEditView = async () => {
  if (
    editView.value &&
    (editViewRef.value?.hasChanges ?? false)
  ) {
    const result = await swalWithBootstrapButtons.fire(discardSectionsSwalOptions.value);
    if (!result.isConfirmed) {
      return;
    }
  }
  editView.value = !editView.value;
  if (!editView.value) {
    await fetchSections();
  }
};

const handleSaveClick = async () => {
  if (!editView.value || !editViewRef.value || savingSections.value || !canSaveSections.value) {
    return;
  }
  await editViewRef.value.saveSections();
};

const handleEditSaved = async () => {
  await fetchSections();
  editView.value = false;
};

watch(
  () => editViewRef.value?.isSaving.value,
  (value) => {
    savingSections.value = Boolean(value);
  },
  { immediate: true }
);

watch(
  () => editViewRef.value?.canSave,
  (value) => {
    canSaveSections.value = Boolean(value);
  },
  { immediate: true }
);

watch(editView, (value) => {
  if (!value) {
    return;
  }
  nextTick(() => {
    if (editViewRef.value?.resetSections) {
      editViewRef.value.resetSections();
    }
  });
});

const normalizeColor = (color: string | null): 'red' | 'orange' | 'yellow' => {
  const normalized = (color || '').toUpperCase();
  if (normalized === 'ORANGE') return 'orange';
  if (normalized === 'RED') return 'red';
  return 'yellow';
};

const colorIcons: Record<'red' | 'orange' | 'yellow', string> = {
  red: 'exclamation-triangle',
  orange: 'exclamation-circle',
  yellow: 'info-circle'
};

const parseVariables = (value: Record<string, any> | string | null | undefined) => {
  if (!value) {
    return {};
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn('Failed to parse dashboard card variables', error);
      return {};
    }
  }
  return value;
};

const parseDocument = (queryText: string): DocumentNode | null => {
  if (!queryText) {
    return null;
  }
  try {
    return parse(queryText);
  } catch (error) {
    console.error('Failed to parse dashboard card query', error);
    return null;
  }
};

const resolveCardLink = (rawUrl?: string | null) => {
  if (!rawUrl) {
    return { path: null as string | null, external: false };
  }
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin && rawUrl.startsWith(origin)) {
      return { path: rawUrl.slice(origin.length) || '/', external: false };
    }
  }
  const external = /^https?:\/\//i.test(rawUrl);
  return { path: rawUrl, external };
};

const resolveCardCount = async (card: DashboardCardState) => {
  const documentNode = parseDocument(card.query);
  if (!documentNode || !card.queryKey) {
    card.loading = false;
    card.error = true;
    card.count = 0;
    return;
  }

  const variables = parseVariables(card.variables);
  card.loading = true;
  card.error = false;

  try {
    const { data } = await apolloClient.query({
      query: documentNode,
      variables,
      fetchPolicy: 'network-only'
    });
    const target = data?.[card.queryKey];
    const totalCount = typeof target?.totalCount === 'number'
      ? target.totalCount
      : typeof target?.count === 'number'
        ? target.count
        : 0;
    card.count = totalCount ?? 0;
  } catch (error) {
    console.error('Failed to resolve dashboard card', error);
    card.error = true;
    card.count = 0;
  } finally {
    card.loading = false;
  }
};

const loadCardCounts = async () => {
  cardsRefreshing.value = true;
  const tasks: Promise<void>[] = [];
  sections.value.forEach((section) => {
    section.cards.forEach((card) => {
      tasks.push(resolveCardCount(card));
    });
  });
  await Promise.all(tasks);
  cardsRefreshing.value = false;
};

const fetchSections = async () => {
  try {
    const { data } = await apolloClient.query({
      query: dashboardSectionsWithCardsQuery,
      fetchPolicy: 'network-only'
    });

    const sectionEdges = data?.dashboardSections?.edges ?? [];
    sections.value = sectionEdges.map((edge: any, index: number) => {
      const node = edge?.node ?? {};
      const cards = (node.cards ?? []).map((cardNode: any, cardIndex: number) => {
        const normalizedColor = normalizeColor(cardNode.color);
        return {
          id: cardNode.id,
          title: cardNode.title,
          description: cardNode.description,
          color: normalizedColor,
          icon: colorIcons[normalizedColor],
          query: cardNode.query,
          variables: cardNode.variables,
          queryKey: cardNode.queryKey,
          url: cardNode.url,
          loading: true,
          count: 0,
          error: false,
          sortOrder: typeof cardNode.sortOrder === 'number' ? cardNode.sortOrder : cardIndex,
          clientId: cardNode.id,
          persistedId: cardNode.id
        } as EditableDashboardSection['cards'][number];
      });
      return {
        id: node.id,
        title: node.title,
        description: node.description,
        sortOrder: typeof node.sortOrder === 'number' ? node.sortOrder : index,
        cards,
      } as EditableDashboardSection;
    });

    sections.value.forEach((section) => {
      if (!(section.id in showCompleted)) {
        showCompleted[section.id] = false;
      }
    });

    if (sections.value.length > 0) {
      await loadCardCounts();
    }
  } catch (error) {
    console.error('Failed to load dashboard sections', error);
    sections.value = [];
  }
};

onMounted(fetchSections);
</script>

<template>
  <div class="card bg-white rounded-xl shadow-lg mt-6 w-full py-6">
    <div class="flex flex-wrap items-center justify-between gap-4 pb-4 px-4">
      <div>
        <h3 class="text-2xl font-semibold text-gray-900">{{ t('dashboard.cards.userSections.title') }}</h3>
        <p class="text-sm text-gray-500">{{ t('dashboard.cards.userSections.subtitle') }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <div v-if="cardsRefreshing" class="flex items-center space-x-2 text-sm text-gray-500">
          <span>{{ t('dashboard.cards.userSections.refreshing') }}</span>
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"></span>
        </div>
        <Button
          :aria-pressed="editView"
          :customClass="'btn btn-outline-primary p-2 h-10 w-10 flex items-center justify-center'"
          @click="toggleEditView"
        >
          <span class="sr-only">
            {{
              editView
                ? t('dashboard.cards.userSections.actions.closeEditor')
                : t('dashboard.cards.userSections.actions.openEditor')
            }}
          </span>
          <Icon :name="editView ? 'arrow-left' : 'cog'" class="h-4 w-4" />
        </Button>
        <Button
          v-if="editView"
          :disabled="!canSaveSections || savingSections"
          :customClass="'btn btn-primary flex items-center gap-2 px-4 py-2'"
          @click="handleSaveClick"
        >
          <Icon name="floppy-disk" class="h-4 w-4" />
          <span>{{ t('dashboard.cards.userSections.edit.saveButton') }}</span>
        </Button>
      </div>
    </div>

    <DashboardUserSectionsEditView
      v-if="editView"
      :sections="sections"
      ref="editViewRef"
      @saved="handleEditSaved"
    />
    <DashboardUserSectionsShowView
      v-else
      :sections="sections"
      :show-completed="showCompleted"
      :has-sections="hasSections"
      :resolve-card-link="resolveCardLink"
      @update-show-completed="handleShowCompletedUpdate"
    />
  </div>
</template>
