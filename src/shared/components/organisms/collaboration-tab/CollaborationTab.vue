<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import apolloClient from '../../../../../apollo-client';
import { Button } from '../../atoms/button';
import { Loader } from '../../atoms/loader';
import { Selector } from '../../atoms/selector';
import { createCollaborationEntryMutation } from '../../../api/mutations/collaboration.js';
import { myMultiTenantCompanyQuery } from '../../../api/queries/me.js';
import { collaborationThreadByTargetQuery } from '../../../api/queries/collaboration.js';
import { injectAuth } from '../../../modules/auth';
import { processGraphQLErrors } from '../../../utils';

type MentionableUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarResizedFullUrl?: string | null;
  isActive?: boolean;
  invitationAccepted?: boolean;
};

type CollaborationEntry = {
  id: string;
  type: string;
  comment: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  createdByMultiTenantUser: MentionableUser;
  mentions: Array<{
    id: string;
    user: MentionableUser;
  }>;
};

type MentionSuggestion =
  | {
      id: string;
      kind: 'all';
      label: string;
      description: string;
    }
  | {
      id: string;
      kind: 'user';
      user: MentionableUser;
    };

const TYPE_COMMENT = 'COMMENT';
const TYPE_ASK_APPROVAL = 'ASK_APPROVAL';
const TYPE_APPROVED = 'APPROVED';
const TYPE_REJECTED = 'REJECTED';
const ALL_MENTIONS_ID = '__all__';

const props = defineProps<{
  targetId: string;
  targetUrl?: string | null;
}>();

const { t } = useI18n();
const route = useRoute();
const auth = injectAuth();

const loadingThread = ref(true);
const submitting = ref(false);
const loadingMembers = ref(true);
const membersError = ref(false);
const threadEntries = ref<CollaborationEntry[]>([]);
const selectedType = ref(TYPE_COMMENT);
const comment = ref('');
const selectedMentionIds = ref<string[]>([]);
const mentionableUsers = ref<MentionableUser[]>([]);
const mentionQuery = ref('');
const mentionAnchorIndex = ref<number | null>(null);
const mutationErrors = ref<Record<string, any>>({});
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const currentUserId = computed(() => auth.user.id || null);

const entryTypeOptions = computed(() => [
  { id: TYPE_COMMENT, name: t('collaboration.actions.comment') },
  { id: TYPE_ASK_APPROVAL, name: t('collaboration.actions.askApproval') },
  { id: TYPE_APPROVED, name: t('collaboration.actions.approved') },
  { id: TYPE_REJECTED, name: t('collaboration.actions.rejected') },
]);

const selectedMentions = computed(() =>
  mentionableUsers.value.filter((user) => selectedMentionIds.value.includes(user.id) && user.id !== currentUserId.value),
);
const sanitizedMentionIds = computed(() =>
  selectedMentionIds.value.filter((id) => id !== currentUserId.value),
);

const filteredMentionableUsers = computed(() => {
  const query = mentionQuery.value.trim().toLocaleLowerCase();

  return mentionableUsers.value.filter((user) => {
    if (user.id === currentUserId.value) {
      return false;
    }

    const haystack = [formatUserName(user), user.email || '']
      .join(' ')
      .toLocaleLowerCase();

    if (!query) {
      return true;
    }

    return haystack.includes(query);
  });
});

const mentionSuggestions = computed<MentionSuggestion[]>(() => {
  const query = mentionQuery.value.trim().toLocaleLowerCase();
  const suggestions: MentionSuggestion[] = [];

  if (
    mentionableUsers.value.length > 0 &&
    (!query || 'all'.includes(query))
  ) {
    suggestions.push({
      id: ALL_MENTIONS_ID,
      kind: 'all',
      label: t('collaboration.labels.allMembers'),
      description: t('collaboration.hints.allMention'),
    });
  }

  filteredMentionableUsers.value.forEach((user) => {
    suggestions.push({
      id: user.id,
      kind: 'user',
      user,
    });
  });

  return suggestions;
});

const showMentionSuggestions = computed(() =>
  mentionAnchorIndex.value !== null && mentionSuggestions.value.length > 0,
);

const canSubmit = computed(() => {
  if (submitting.value || !props.targetId) {
    return false;
  }

  if (selectedType.value === TYPE_COMMENT) {
    return Boolean(comment.value.trim());
  }

  if (selectedType.value === TYPE_ASK_APPROVAL) {
    return sanitizedMentionIds.value.length > 0;
  }

  return true;
});

const formatUserName = (user?: MentionableUser | null) => {
  if (!user) {
    return t('collaboration.labels.unknownUser');
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.email || t('collaboration.labels.unknownUser');
};

const getInitials = (user?: MentionableUser | null) => {
  const name = formatUserName(user);
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const getEntryTypeLabel = (type: string) => {
  switch (type) {
    case TYPE_ASK_APPROVAL:
      return t('collaboration.actions.askApproval');
    case TYPE_APPROVED:
      return t('collaboration.actions.approved');
    case TYPE_REJECTED:
      return t('collaboration.actions.rejected');
    default:
      return t('collaboration.actions.comment');
  }
};

const getEntryDotClasses = (type: string) => {
  switch (type) {
    case TYPE_ASK_APPROVAL:
      return 'bg-amber-500';
    case TYPE_APPROVED:
      return 'bg-emerald-500';
    case TYPE_REJECTED:
      return 'bg-rose-500';
    default:
      return 'bg-slate-400';
  }
};

const getEntryTypeTextClasses = (type: string) => {
  switch (type) {
    case TYPE_ASK_APPROVAL:
      return 'text-amber-700';
    case TYPE_APPROVED:
      return 'text-emerald-700';
    case TYPE_REJECTED:
      return 'text-rose-700';
    default:
      return 'text-slate-500';
  }
};

const getEntryCardClasses = (type: string) => {
  switch (type) {
    case TYPE_ASK_APPROVAL:
      return 'border-amber-200 bg-amber-50/40';
    case TYPE_APPROVED:
      return 'border-emerald-200 bg-emerald-50/40';
    case TYPE_REJECTED:
      return 'border-rose-200 bg-rose-50/40';
    default:
      return 'border-slate-200 bg-white';
  }
};

const shouldShowMentions = (entry: CollaborationEntry) => Boolean(entry.mentions?.length);

const getEntrySummary = (entry: CollaborationEntry) => {
  const user = formatUserName(entry.createdByMultiTenantUser);

  if (entry.type === TYPE_COMMENT) {
    return t('collaboration.timeline.comment', { user, name: user });
  }

  if (entry.type === TYPE_ASK_APPROVAL) {
    return t('collaboration.timeline.askApproval', { user, name: user });
  }

  if (entry.type === TYPE_APPROVED) {
    return t('collaboration.timeline.approved', { user, name: user });
  }

  if (entry.type === TYPE_REJECTED) {
    return t('collaboration.timeline.rejected', { user, name: user });
  }

  return `${user} ${entry.type}`;
};

const syncMentionState = () => {
  const textarea = textareaRef.value;
  if (!textarea) {
    mentionQuery.value = '';
    mentionAnchorIndex.value = null;
    return;
  }

  const cursorPosition = textarea.selectionStart ?? comment.value.length;
  const beforeCursor = comment.value.slice(0, cursorPosition);
  const match = beforeCursor.match(/(^|\s)@([^\s@]*)$/);

  if (!match) {
    mentionQuery.value = '';
    mentionAnchorIndex.value = null;
    return;
  }

  mentionQuery.value = match[2] || '';
  mentionAnchorIndex.value = cursorPosition - mentionQuery.value.length - 1;
};

const handleCommentInput = (event: Event) => {
  comment.value = (event.target as HTMLTextAreaElement).value;
  mutationErrors.value = {};
  syncMentionState();
};

const handleTextareaInteraction = () => {
  syncMentionState();
};

const addMention = async (user: MentionableUser) => {
  const textarea = textareaRef.value;
  if (!textarea || mentionAnchorIndex.value === null || user.id === currentUserId.value) {
    return;
  }

  const cursorPosition = textarea.selectionStart ?? comment.value.length;
  const mentionLabel = `@${formatUserName(user)} `;

  comment.value = `${comment.value.slice(0, mentionAnchorIndex.value)}${mentionLabel}${comment.value.slice(cursorPosition)}`;

  if (!selectedMentionIds.value.includes(user.id)) {
    selectedMentionIds.value = [...selectedMentionIds.value, user.id];
  }

  const nextCursorPosition = mentionAnchorIndex.value + mentionLabel.length;
  mentionQuery.value = '';
  mentionAnchorIndex.value = null;

  await nextTick();
  textarea.focus();
  textarea.setSelectionRange(nextCursorPosition, nextCursorPosition);
};

const addAllMentions = async () => {
  const textarea = textareaRef.value;
  if (!textarea || mentionAnchorIndex.value === null) {
    return;
  }

  const cursorPosition = textarea.selectionStart ?? comment.value.length;
  const mentionLabel = `@all `;
  const allMentionIds = mentionableUsers.value
    .map((user) => user.id)
    .filter((id) => id !== currentUserId.value);

  comment.value = `${comment.value.slice(0, mentionAnchorIndex.value)}${mentionLabel}${comment.value.slice(cursorPosition)}`;
  selectedMentionIds.value = Array.from(new Set([...selectedMentionIds.value, ...allMentionIds]));

  const nextCursorPosition = mentionAnchorIndex.value + mentionLabel.length;
  mentionQuery.value = '';
  mentionAnchorIndex.value = null;

  await nextTick();
  textarea.focus();
  textarea.setSelectionRange(nextCursorPosition, nextCursorPosition);
};

const selectMentionSuggestion = async (suggestion: MentionSuggestion) => {
  if (suggestion.kind === 'all') {
    await addAllMentions();
    return;
  }

  await addMention(suggestion.user);
};

const removeMention = (id: string) => {
  selectedMentionIds.value = selectedMentionIds.value.filter((currentId) => currentId !== id);
};

const loadThread = async () => {
  if (!props.targetId) {
    threadEntries.value = [];
    return;
  }

  loadingThread.value = true;

  try {
    const { data } = await apolloClient.query({
      query: collaborationThreadByTargetQuery,
      variables: { targetId: props.targetId },
      fetchPolicy: 'network-only',
    });

    threadEntries.value = data?.collaborationThreadByTarget?.entries || [];
  } finally {
    loadingThread.value = false;
  }
};

const loadMembers = async () => {
  loadingMembers.value = true;
  membersError.value = false;

  try {
    const { data } = await apolloClient.query({
      query: myMultiTenantCompanyQuery,
      fetchPolicy: 'cache-first',
    });

    mentionableUsers.value = (data?.myMultiTenantCompany?.multitenantuserSet || []).filter(
      (user: MentionableUser) => user.isActive && user.invitationAccepted && user.id !== currentUserId.value,
    );
  } catch (error) {
    console.error('Failed to load collaboration members', error);
    membersError.value = true;
  } finally {
    loadingMembers.value = false;
  }
};

const resetComposer = () => {
  selectedType.value = TYPE_COMMENT;
  comment.value = '';
  selectedMentionIds.value = [];
  mentionQuery.value = '';
  mentionAnchorIndex.value = null;
  mutationErrors.value = {};
};

const submitEntry = async () => {
  mutationErrors.value = {};

  if (selectedType.value === TYPE_COMMENT && !comment.value.trim()) {
    mutationErrors.value.comment = t('collaboration.validation.commentRequired');
    return;
  }

  if (selectedType.value === TYPE_ASK_APPROVAL && sanitizedMentionIds.value.length === 0) {
    mutationErrors.value.mentionedUserIds = t('collaboration.validation.askApprovalMentionRequired');
    return;
  }

  submitting.value = true;

  try {
    await apolloClient.mutate({
      mutation: createCollaborationEntryMutation,
      variables: {
        targetId: props.targetId,
        type: selectedType.value,
        comment: comment.value.trim() || null,
        url: props.targetUrl || route.fullPath,
        metadata: null,
        mentionedUserIds: sanitizedMentionIds.value.length ? sanitizedMentionIds.value : null,
      },
      fetchPolicy: 'network-only',
    });

    resetComposer();
    await loadThread();
  } catch (error) {
    mutationErrors.value = processGraphQLErrors(error, t);
    if (!mutationErrors.value.__all__) {
      mutationErrors.value.__all__ = t('collaboration.messages.createFailed');
    }
  } finally {
    submitting.value = false;
  }
};

watch(() => props.targetId, loadThread, { immediate: true });

onMounted(loadMembers);
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-200 px-5 py-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="text-base font-semibold text-slate-900">{{ t('collaboration.timeline.title') }}</h3>
            <p class="mt-1 text-sm text-slate-500">{{ t('collaboration.description') }}</p>
          </div>
          <span class="text-xs font-medium uppercase tracking-wide text-slate-400">{{ t('collaboration.timeline.orderHint') }}</span>
        </div>
      </div>

      <div class="px-5 py-6">
        <Loader :loading="loadingThread" />

        <div
          v-if="!loadingThread && threadEntries.length === 0"
          class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center"
        >
          <p class="text-base font-semibold text-slate-800">{{ t('collaboration.empty.title') }}</p>
          <p class="mt-2 text-sm text-slate-500">{{ t('collaboration.empty.description') }}</p>
        </div>

        <ul v-else class="space-y-8">
          <li
            v-for="(entry, index) in threadEntries"
            :key="entry.id"
            class="relative flex gap-x-4"
          >
            <div
              v-if="index !== threadEntries.length - 1"
              class="absolute left-5 top-11 h-[calc(100%-0.75rem)] w-px bg-slate-200"
            ></div>

            <div class="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-semibold text-slate-700 ring-8 ring-white">
              <img
                v-if="entry.createdByMultiTenantUser?.avatarResizedFullUrl"
                :src="entry.createdByMultiTenantUser.avatarResizedFullUrl"
                :alt="formatUserName(entry.createdByMultiTenantUser)"
                class="h-full w-full object-cover"
              />
              <span v-else>{{ getInitials(entry.createdByMultiTenantUser) }}</span>
            </div>

            <div :class="[getEntryCardClasses(entry.type), 'min-w-0 flex-1 rounded-2xl border p-4 shadow-sm']">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span :class="[getEntryTypeTextClasses(entry.type), 'inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]']">
                      <span :class="[getEntryDotClasses(entry.type), 'inline-flex h-2 w-2 rounded-full']"></span>
                      {{ getEntryTypeLabel(entry.type) }}
                    </span>
                  </div>
                  <p class="mt-2 text-sm font-medium leading-6 text-slate-900">
                    {{ getEntrySummary(entry) }}
                  </p>

                  <p v-if="entry.comment" class="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {{ entry.comment }}
                  </p>

                  <div v-if="shouldShowMentions(entry)" class="mt-4 flex flex-wrap gap-2">
                    <span class="w-full text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {{ t('collaboration.labels.mentions') }}
                    </span>
                    <span
                      v-for="mention in entry.mentions"
                      :key="mention.id"
                      class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
                    >
                      <span class="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
                        <img
                          v-if="mention.user.avatarResizedFullUrl"
                          :src="mention.user.avatarResizedFullUrl"
                          :alt="formatUserName(mention.user)"
                          class="h-full w-full object-cover"
                        />
                        <span v-else>{{ getInitials(mention.user) }}</span>
                      </span>
                      {{ formatUserName(mention.user) }}
                    </span>
                  </div>
                </div>

                <time class="shrink-0 text-xs text-slate-400">{{ formatDate(entry.createdAt) }}</time>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="h-fit rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-6">
      <div class="border-b border-slate-200 px-5 py-5">
        <h3 class="text-base font-semibold text-slate-900">{{ t('collaboration.composer.title') }}</h3>
        <p class="mt-1 text-sm text-slate-500">{{ t('collaboration.composer.subtitle') }}</p>
      </div>

      <div class="space-y-5 px-5 py-6">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p class="text-sm font-medium text-slate-800">{{ t('collaboration.description') }}</p>
          <p class="mt-1 text-xs text-slate-500">{{ t('collaboration.hints.allMention') }}</p>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">{{ t('collaboration.labels.entryType') }}</label>
          <Selector
            :options="entryTypeOptions"
            :model-value="selectedType"
            label-by="name"
            value-by="id"
            :placeholder="t('collaboration.placeholders.entryType')"
            @update:modelValue="selectedType = String($event)"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">{{ t('collaboration.labels.comment') }}</label>
          <div class="relative">
            <textarea
              ref="textareaRef"
              rows="6"
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              :placeholder="t('collaboration.placeholders.comment')"
              :value="comment"
              @input="handleCommentInput"
              @click="handleTextareaInteraction"
              @keyup="handleTextareaInteraction"
            ></textarea>

            <div
              v-if="showMentionSuggestions"
              class="absolute inset-x-0 top-full z-20 mt-2 max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
            >
              <button
                v-for="suggestion in mentionSuggestions"
                :key="suggestion.id"
                type="button"
                class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-slate-50"
                @click="selectMentionSuggestion(suggestion)"
              >
                <div v-if="suggestion.kind === 'all'" class="flex min-w-0 items-center gap-3">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                    @
                  </div>
                  <div class="min-w-0">
                    <span class="block truncate text-sm font-medium text-slate-700">{{ suggestion.label }}</span>
                    <span class="block truncate text-xs text-slate-400">{{ suggestion.description }}</span>
                  </div>
                </div>
                <div v-else class="flex min-w-0 items-center gap-3">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                    <img
                      v-if="suggestion.user.avatarResizedFullUrl"
                      :src="suggestion.user.avatarResizedFullUrl"
                      :alt="formatUserName(suggestion.user)"
                      class="h-full w-full object-cover"
                    />
                    <span v-else>{{ getInitials(suggestion.user) }}</span>
                  </div>
                  <div class="min-w-0">
                    <span class="block truncate text-sm font-medium text-slate-700">{{ formatUserName(suggestion.user) }}</span>
                    <span class="block truncate text-xs text-slate-400">{{ suggestion.user.email }}</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <p class="mt-2 text-xs text-slate-500">{{ t('collaboration.hints.mentions') }}</p>
          <p v-if="mutationErrors.comment" class="mt-2 text-xs font-medium text-rose-600">{{ mutationErrors.comment }}</p>
        </div>

        <div>
          <div class="mb-2 flex items-center justify-between">
            <label class="block text-sm font-medium text-slate-700">{{ t('collaboration.labels.selectedMentions') }}</label>
            <button
              v-if="membersError"
              type="button"
              class="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              @click="loadMembers"
            >
              {{ t('shared.button.retry') }}
            </button>
          </div>

          <div v-if="loadingMembers" class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
            {{ t('collaboration.members.loading') }}
          </div>
          <div v-else-if="membersError" class="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-4 text-sm text-rose-600">
            {{ t('collaboration.members.error') }}
          </div>
          <div v-else-if="selectedMentions.length" class="flex flex-wrap gap-2">
            <button
              v-for="user in selectedMentions"
              :key="user.id"
              type="button"
              class="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-2 py-1.5 text-sm font-medium text-indigo-700"
              @click="removeMention(user.id)"
            >
              <div class="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[10px] font-semibold text-indigo-700">
                <img
                  v-if="user.avatarResizedFullUrl"
                  :src="user.avatarResizedFullUrl"
                  :alt="formatUserName(user)"
                  class="h-full w-full object-cover"
                />
                <span v-else>{{ getInitials(user) }}</span>
              </div>
              <span>{{ formatUserName(user) }}</span>
              <span class="text-xs text-indigo-400">×</span>
            </button>
          </div>
          <div v-else class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
            {{ t('collaboration.members.empty') }}
          </div>

          <p v-if="mutationErrors.mentionedUserIds" class="mt-2 text-xs font-medium text-rose-600">{{ mutationErrors.mentionedUserIds }}</p>
        </div>

        <div
          v-if="mutationErrors.__all__"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-600"
        >
          {{ mutationErrors.__all__ }}
        </div>

        <div class="flex justify-end">
          <Button
            class="btn btn-primary min-w-36"
            :disabled="!canSubmit"
            :loading="submitting"
            @click="submitEntry"
          >
            {{ t('collaboration.actions.submit') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
