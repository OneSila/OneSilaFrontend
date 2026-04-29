<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Breadcrumbs } from "../../../../../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Button } from "../../../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../../../shared/components/atoms/link";
import apolloClient from "../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../shared/modules/toast";
import { CancelButton } from "../../../../../../../../shared/components/atoms/button-cancel";
import { Loader } from "../../../../../../../../shared/components/atoms/loader";
import { processGraphQLErrors } from "../../../../../../../../shared/utils";
import { Icon } from "../../../../../../../../shared/components/atoms/icon";
import { Selector } from "../../../../../../../../shared/components/atoms/selector";
import { miraklProductTypesQuery } from "../../../../../../../../shared/api/queries/salesChannels.js";
import { suggestMiraklCategoryMutation, updateMiraklProductTypeMutation } from "../../../../../../../../shared/api/mutations/salesChannels.js";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const props = defineProps<{
  productType: any | null;
}>();

const productTypeId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId?.toString() || '';
const salesChannelId = route.query.salesChannelId?.toString() || '';
const isWizard = route.query.wizard === '1';

const suggestions = ref<{ code: string; displayName: string; raw: any }[]>([]);
const selectedSuggestion = ref<{ code: string; displayName: string; raw: any } | null>(null);
const selectedCode = ref('');
const selectedName = ref('');
const saving = ref(false);
const loadingSuggestions = ref(false);
const errors = ref<Record<string, string>>({});

const localInstancePath = computed(() => {
  const id = props.productType?.localInstance?.id;
  return id ? { name: 'properties.rule.show', params: { id } } : null;
});

const localInstanceName = computed(() => props.productType?.localInstance?.value || '');
const integrationTitle = computed(() => t(`integrations.show.${type.value}.title`));

watch(
  () => props.productType?.name,
  (value) => {
    selectedName.value = value || '';
  },
  { immediate: true },
);

watch(
  () => props.productType?.remoteId,
  (value) => {
    selectedCode.value = value || '';
  },
  { immediate: true },
);

const selectSuggestion = (suggestion: { code: string; displayName: string; raw: any } | null) => {
  selectedSuggestion.value = suggestion;
  selectedCode.value = suggestion?.code || '';
  selectedName.value = suggestion?.displayName || '';
};

const fetchAllProductTypes = async () => {
  errors.value = {};
  selectSuggestion(null);

  if (!salesChannelId) {
    errors.value.__all__ = t('shared.alert.toast.somethingWentWrong');
    return;
  }

  loadingSuggestions.value = true;
  try {
    const { data } = await apolloClient.mutate({
      mutation: suggestMiraklCategoryMutation,
      variables: { instance: { id: salesChannelId } },
    });

    const result = (data?.suggestMiraklCategory || []).map((entry: any) => ({
      code: entry?.remoteId || '',
      displayName: entry?.name || entry?.remoteId || '',
      raw: entry,
    }));

    suggestions.value = result;

    if (!result.length) {
      errors.value.__all__ = t('integrations.show.productRules.errors.noSuggestions');
    }
  } catch (err) {
    const validationErrors = processGraphQLErrors(err, t);
    if (validationErrors['__all__']) {
      Toast.error(validationErrors['__all__']);
    }
  } finally {
    loadingSuggestions.value = false;
  }
};

watch(
  () => salesChannelId,
  async (value) => {
    if (!value) {
      return;
    }
    await fetchAllProductTypes();
  },
  { immediate: true },
);

const fetchNextUnmapped = async (): Promise<{ nextId: string | null; last: boolean }> => {
  const { data } = await apolloClient.query({
    query: miraklProductTypesQuery,
    variables: {
      first: 2,
      filter: {
        salesChannel: { id: { exact: salesChannelId } },
        mappedLocally: false,
      },
    },
    fetchPolicy: 'network-only',
  });

  const edges = data?.miraklProductTypes?.edges || [];
  let nextId: string | null = null;

  for (const edge of edges) {
    if (edge.node.id !== productTypeId.value) {
      nextId = edge.node.id;
      break;
    }
  }

  const last = edges.length === 1 && edges[0].node.id === productTypeId.value;
  return { nextId, last };
};

const save = async () => {
  if (!selectedCode.value) {
    errors.value.__all__ = t('integrations.show.productRules.errors.noSelection');
    return;
  }

  saving.value = true;
  try {
    const payload: Record<string, any> = {
      id: productTypeId.value,
      remoteId: selectedCode.value,
      name: selectedName.value,
      imported: true,
    };

    const selectedCategoryId = selectedSuggestion.value?.raw?.id;
    if (selectedCategoryId) {
      payload.category = { id: selectedCategoryId };
    }

    await apolloClient.mutate({
      mutation: updateMiraklProductTypeMutation,
      variables: {
        data: payload,
      },
    });

    Toast.success(t('shared.alert.toast.submitSuccessUpdate'));

    if (!isWizard) {
      router.push({
        name: 'integrations.integrations.show',
        params: { type: type.value, id: integrationId },
        query: { tab: 'productRules' },
      });
      return;
    }

    const { nextId, last } = await fetchNextUnmapped();
    if (nextId) {
      router.push({
        name: 'integrations.remoteProductTypes.edit',
        params: { type: type.value, id: nextId },
        query: { integrationId, salesChannelId, wizard: '1' },
      });
    } else if (last) {
      router.push({
        name: 'integrations.integrations.show',
        params: { type: type.value, id: integrationId },
        query: { tab: 'productRules' },
      });
    } else {
      router.push({
        name: 'integrations.integrations.show',
        params: { type: type.value, id: integrationId },
        query: { tab: 'productRules' },
      });
    }
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    if (validationErrors['__all__']) {
      Toast.error(validationErrors['__all__']);
    }
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          {
            path: {
              name: 'integrations.integrations.show',
              params: { id: integrationId, type: type },
              query: { tab: 'productRules' },
            },
            name: integrationTitle,
          },
          { name: t('integrations.show.mapProductType') },
        ]"
      />
    </template>

    <template #content>
      <div class="space-y-10 divide-y divide-gray-900/10 mt-4">
        <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <Loader :loading="loadingSuggestions" />
            <div class="px-4 py-6 sm:p-8 space-y-6">
              <div v-if="localInstanceName">
                <label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.show.productRules.labels.productRule') }}
                </label>
                <Link v-if="localInstancePath" :path="localInstancePath">{{ localInstanceName }}</Link>
                <span v-else>{{ localInstanceName }}</span>
              </div>

              <div v-if="selectedName">
                <label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.show.productRules.labels.selectedProductType') }}
                </label>
                <p class="mt-1 text-sm">{{ selectedName }}</p>
              </div>

              <div class="space-y-4">
                <h3 class="font-semibold text-lg">{{ t('integrations.show.productRules.titles.searchInAll') }}</h3>

                <div v-if="errors.__all__" class="text-danger text-small blink-animation ml-1 mb-1">
                  <Icon size="sm" name="exclamation-circle" />
                  <span class="ml-1">{{ errors.__all__ }}</span>
                </div>

                <Selector
                  class="max-h-10"
                  v-if="suggestions.length"
                  v-model="selectedCode"
                  :options="suggestions"
                  label-by="displayName"
                  value-by="code"
                  filterable
                  @update:model-value="val => selectSuggestion(suggestions.find(p => p.code === val) || null)"
                />
              </div>
            </div>

            <hr />

            <div class="flex items-center justify-end gap-x-3 px-4 py-4 sm:px-8">
              <Link :path="{ name: 'integrations.integrations.show', params: { type: type, id: integrationId }, query: { tab: 'productRules' } }">
                <CancelButton>
                  {{ t('shared.button.back') }}
                </CancelButton>
              </Link>

              <Button type="button" class="btn btn-primary" :loading="saving" :disabled="saving" @click="save">
                {{ t('shared.button.save') }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </GeneralTemplate>
</template>
