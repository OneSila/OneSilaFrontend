<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import GeneralTemplate from "../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../shared/components/molecules/breadcrumbs";
import { Button } from "../../../shared/components/atoms/button";
import { Card } from "../../../shared/components/atoms/card";
import { Icon } from "../../../shared/components/atoms/icon";
import { Image } from "../../../shared/components/atoms/image";
import { Link } from "../../../shared/components/atoms/link";
import { Loader } from "../../../shared/components/atoms/loader";
import { Modal } from "../../../shared/components/atoms/modal";
import { publicIssueQuery } from "../../../shared/api/queries/publicIssues.js";
import { getPublicIssueIntegrationLabel } from "./configs";

const { t } = useI18n();
const route = useRoute();
const currentImageIndex = ref(0);
const showImageModal = ref(false);

const issueId = computed(() => String(route.params.id));
const publicIssuesListRoute = computed(() => ({
  name: 'integrations.publicIssues.list',
  query: route.query,
}));

const backToProductRoute = computed(() => {
  if (!route.query.productId) {
    return null;
  }

  return {
    name: 'products.products.show',
    params: { id: String(route.query.productId) },
    query: { tab: 'websites' },
  };
});

const getImages = (issue: any) => (issue?.images || [])
  .map((item: any) => item?.imageUrl)
  .filter(Boolean);

const getIntegrationLabel = (issue: any) => {
  const label = getPublicIssueIntegrationLabel(t, issue?.integrationType);
  return label || String(route.query.integrationType || '');
};

const getIssueSections = (issue: any) => [
  {
    key: 'issue',
    label: t('publicIssues.labels.issue'),
    value: issue.issue,
    renderAsHtml: false,
  },
  {
    key: 'cause',
    label: t('publicIssues.labels.cause'),
    value: issue.cause || t('publicIssues.show.emptySection'),
    renderAsHtml: true,
  },
  {
    key: 'recommendedFix',
    label: t('publicIssues.labels.recommendedFix'),
    value: issue.recommendedFix || t('publicIssues.show.emptySection'),
    renderAsHtml: true,
  },
];

const nextImage = (images: string[]) => {
  if (images.length <= 1) {
    return;
  }
  currentImageIndex.value = (currentImageIndex.value + 1) % images.length;
};

const previousImage = (images: string[]) => {
  if (images.length <= 1) {
    return;
  }
  currentImageIndex.value = currentImageIndex.value === 0 ? images.length - 1 : currentImageIndex.value - 1;
};
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.publicIssues.list', query: route.query }, name: t('publicIssues.title') },
          { path: { name: 'integrations.publicIssues.show', params: { id: issueId }, query: route.query }, name: t('publicIssues.show.title') },
        ]"
      />
    </template>

    <template #buttons>
      <div class="flex flex-wrap items-center gap-2">
        <Link v-if="backToProductRoute" :path="backToProductRoute">
          <Button type="button" class="btn btn-outline-dark">
            {{ t('publicIssues.actions.backToProduct') }}
          </Button>
        </Link>
      </div>
    </template>

    <template #content>
      <ApolloQuery :query="publicIssueQuery" :variables="{ id: issueId }" fetch-policy="cache-and-network">
        <template #default="{ result: { loading, data } }">
          <Loader :loading="loading" />
          <template v-if="data?.publicIssue">
            <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_520px]">
              <Card class="overflow-hidden">
                <div class="border-b border-slate-200 bg-white">
                  <div class="p-6">
                    <h1 class="text-xl font-semibold text-slate-950">{{ t('publicIssues.show.title') }}</h1>
                    <div class="mt-4 flex flex-wrap items-center gap-2">
                      <span class="rounded-md bg-slate-900 px-3 py-1.5 font-mono text-sm font-semibold text-white">
                        {{ data.publicIssue.code }}
                      </span>
                      <span
                        v-if="getIntegrationLabel(data.publicIssue)"
                        class="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                      >
                        {{ getIntegrationLabel(data.publicIssue) }}
                      </span>
                      <span
                        v-for="category in data.publicIssue.categories || []"
                        :key="category.id"
                        class="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
                      >
                        {{ category.name || category.code }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="divide-y divide-slate-100">
                  <section
                    v-for="section in getIssueSections(data.publicIssue)"
                    :key="section.key"
                    class="p-6"
                  >
                    <h2 class="text-base font-semibold text-slate-950">{{ section.label }}</h2>
                    <p v-if="!section.renderAsHtml" class="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {{ section.value }}
                    </p>
                    <div
                      v-else
                      class="mt-3 text-sm leading-7 text-slate-700"
                      v-html="section.value"
                    />
                  </section>
                </div>

                <div class="flex items-center justify-end border-t border-gray-900/10 px-6 py-4">
                  <Link :path="publicIssuesListRoute">
                    <Button type="button" class="button rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm btn-dark">
                      {{ t('shared.button.back') }}
                    </Button>
                  </Link>
                </div>
              </Card>

              <Card v-if="getImages(data.publicIssue).length > 0" class="h-fit overflow-hidden">
                <div class="border-b border-slate-200 p-5">
                  <h2 class="text-base font-semibold text-slate-950">{{ t('publicIssues.show.images') }}</h2>
                </div>
                <div class="p-5">
                  <button
                    type="button"
                    class="group relative block w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                    @click="showImageModal = true"
                  >
                    <Image
                      :source="getImages(data.publicIssue)[currentImageIndex]"
                      :alt="data.publicIssue.code"
                      class="h-[32rem] w-full object-contain transition duration-200 group-hover:scale-[1.01]"
                    />
                    <span class="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition group-hover:bg-slate-900/25">
                      <span class="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-slate-700 opacity-0 shadow-sm transition group-hover:opacity-100">
                        <Icon name="search" size="lg" />
                      </span>
                    </span>
                  </button>

                  <div v-if="getImages(data.publicIssue).length > 1" class="mt-4 flex items-center justify-between gap-3">
                    <Button type="button" class="btn btn-outline-dark" @click="previousImage(getImages(data.publicIssue))">
                      <Icon name="chevron-left" class="mr-2" />
                      {{ t('publicIssues.actions.previousImage') }}
                    </Button>
                    <span class="text-sm font-medium text-slate-500">
                      {{ currentImageIndex + 1 }} / {{ getImages(data.publicIssue).length }}
                    </span>
                    <Button type="button" class="btn btn-outline-dark" @click="nextImage(getImages(data.publicIssue))">
                      {{ t('publicIssues.actions.nextImage') }}
                      <Icon name="chevron-right" class="ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <Modal v-model="showImageModal" @closed="showImageModal = false">
              <div class="w-[min(96vw,1400px)] rounded-[1.5rem] bg-white p-4 sm:p-6">
                <div class="mb-3 flex justify-end">
                  <button
                    type="button"
                    class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                    @click="showImageModal = false"
                  >
                    <Icon name="x" size="sm" />
                  </button>
                </div>

                <Image
                  :source="getImages(data.publicIssue)[currentImageIndex]"
                  :alt="data.publicIssue.code"
                  class="max-h-[86vh] w-full rounded-xl border border-slate-200 bg-slate-50 object-contain"
                />
              </div>
            </Modal>
          </template>
        </template>
      </ApolloQuery>
    </template>
  </GeneralTemplate>
</template>
