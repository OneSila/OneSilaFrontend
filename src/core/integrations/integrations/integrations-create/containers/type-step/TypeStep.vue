<script setup lang="ts">
import { computed, defineEmits, defineProps, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { IntegrationTypes } from '../../../integrations';
import magentoType from '../../../../../../assets/images/integration-types/magento.png';
import shopifyType from '../../../../../../assets/images/integration-types/shopify.png';
import woocommerceType from '../../../../../../assets/images/integration-types/woo-commerce.jpg';
import amazonType from '../../../../../../assets/images/integration-types/amazon.png';
import abbType from '../../../../../../assets/images/integration-types/abb.png';
import webhooksType from '../../../../../../assets/images/integration-types/webhooks.webp';
import ebayType from '../../../../../../assets/images/integration-types/ebay.jpg';
import sheinType from '../../../../../../assets/images/integration-types/shein.png';
import miraklType from '../../../../../../assets/images/integration-types/mirakl.png';
import noImageType from '../../../../../../assets/images/integration-types/no_image.jpg';
import magentoIcon from '../../../../../../assets/images/integration-types/icons/magento.svg';
import shopifyIcon from '../../../../../../assets/images/integration-types/icons/shopify.svg';
import woocommerceIcon from '../../../../../../assets/images/integration-types/icons/woocommerce.svg';
import amazonIcon from '../../../../../../assets/images/integration-types/icons/amazon.svg';
import abbIcon from '../../../../../../assets/images/integration-types/icons/abb.svg';
import ebayIcon from '../../../../../../assets/images/integration-types/icons/ebay.svg';
import sheinIcon from '../../../../../../assets/images/integration-types/icons/shein.svg';
import miraklIcon from '../../../../../../assets/images/integration-types/icons/mirakl.svg';
import noImageIcon from '../../../../../../assets/images/integration-types/icons/no_image.svg';
import openAiIcon from '../../../../../../assets/images/integration-types/icons/openai.png';
import { Badge } from '../../../../../../shared/components/atoms/badge';
import { Button } from '../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../shared/components/atoms/icon';
import { Image } from '../../../../../../shared/components/atoms/image';
import { Modal } from '../../../../../../shared/components/atoms/modal';
import { PrimaryButton } from '../../../../../../shared/components/atoms/button-primary';
import { Toggle } from '../../../../../../shared/components/atoms/toggle';
import { SearchInput } from '../../../../../../shared/components/molecules/search-input';
import apolloClient from '../../../../../../../apollo-client';
import { publicIntegrationTypesQuery } from '../../../../../../shared/api/queries/publicIntegrationTypes.js';
import { MagentoInfoCard, MiraklInfoCard, ShopifyInfoCard, WebhookInfoCard, WoocommerceInfoCard } from './info-cards';

type IntegrationCategory = 'storefronts' | 'marketplaces' | 'webhooks';
type BackendIntegrationCategory = 'storefront' | 'marketplace' | 'webhooks';
type FilterType = 'all' | IntegrationCategory;
type InfoVariant = 'magento' | 'shopify' | 'woocommerce' | 'webhook' | 'mirakl';

interface TypeCard {
  value: string;
  key: string;
  baseType: IntegrationTypes;
  subtype: string | null;
  category: IntegrationCategory;
  title: string;
  description: string;
  image: string;
  icon: string;
  iconClass?: string;
  beta?: boolean;
  supportsOpenAiFeed?: boolean;
  infoVariant?: InfoVariant;
}

interface PublicIntegrationTypeNode {
  id: string;
  key: string;
  type: string;
  subtype: string | null;
  category: BackendIntegrationCategory;
  active: boolean;
  isBeta: boolean;
  supportsOpenAiProductFeed: boolean;
  sortOrder: number;
  name: string;
  description: string;
  iconSvgUrl: string | null;
  logoPngUrl: string | null;
  basedTo?: {
    id: string;
    key: string;
    type: string;
    subtype: string | null;
    name: string;
  } | null;
}

interface SelectedIntegrationDefinition {
  key: string;
  type: string;
  subtype: string | null;
  name: string;
}

const props = defineProps<{ type: string }>();
const emit = defineEmits<{
  (e: 'update:type', value: string): void;
  (e: 'update:selection', value: SelectedIntegrationDefinition | null): void;
  (e: 'go-next'): void;
}>();

const { t } = useI18n();

const selectedType = ref(props.type);
const searchTerm = ref('');
const activeFilter = ref<FilterType>('all');
const showBeta = ref(true);
const showInfoModal = ref(false);
const selectedInfoCard = ref<TypeCard | null>(null);
const showStickySelection = ref(true);
const integrationCards = ref<TypeCard[]>([]);
const loadingCards = ref(false);
const cardLoadError = ref(false);
const selectedCardCache = ref<TypeCard | null>(null);
let wizardActionsObserver: IntersectionObserver | null = null;

const getCardFilter = (category: IntegrationCategory) => {
  return t(`integrations.create.wizard.step1.filters.${category}`);
};

const getCardAccentClass = (category: IntegrationCategory) => {
  if (category === 'storefronts') {
    return 'from-emerald-50 via-green-50 to-green-50';
  }

  if (category === 'marketplaces') {
    return 'from-sky-100 via-sky-50 to-sky-50';
  }

  return 'from-slate-200 via-slate-100 to-slate-100';
};

const getCardAccentSurfaceClass = (category: IntegrationCategory) => {
  if (category === 'storefronts') {
    return 'border-emerald-100 bg-white';
  }

  if (category === 'marketplaces') {
    return 'border-sky-200 bg-white';
  }

  return 'border-slate-200 bg-white';
};

const categories = computed(() => [
  {
    key: 'storefronts' as const,
    title: t('integrations.create.wizard.step1.categories.storefronts.title'),
    description: t('integrations.create.wizard.step1.categories.storefronts.description'),
  },
  {
    key: 'marketplaces' as const,
    title: t('integrations.create.wizard.step1.categories.marketplaces.title'),
    description: t('integrations.create.wizard.step1.categories.marketplaces.description'),
  },
  {
    key: 'webhooks' as const,
    title: t('integrations.create.wizard.step1.categories.webhooks.title'),
    description: t('integrations.create.wizard.step1.categories.webhooks.description'),
  },
]);

const infoComponent = computed(() => {
  if (!selectedInfoCard.value) {
    return null;
  }

  switch (selectedInfoCard.value.infoVariant) {
    case 'magento':
      return MagentoInfoCard;
    case 'mirakl':
      return MiraklInfoCard;
    case 'shopify':
      return ShopifyInfoCard;
    case 'woocommerce':
      return WoocommerceInfoCard;
    case 'webhook':
      return WebhookInfoCard;
    default:
      return null;
  }
});

const infoComponentProps = computed(() => {
  if (!selectedInfoCard.value || selectedInfoCard.value.infoVariant !== 'mirakl') {
    return {};
  }

  return {
    marketplace: selectedInfoCard.value.title,
    icon: selectedInfoCard.value.icon,
    isDefaultMirakl: !selectedInfoCard.value.subtype || selectedInfoCard.value.subtype === IntegrationTypes.Mirakl,
  };
});

const BACKEND_CATEGORY_BY_FILTER: Record<IntegrationCategory, BackendIntegrationCategory> = {
  storefronts: 'storefront',
  marketplaces: 'marketplace',
  webhooks: 'webhooks',
};

const UI_CATEGORY_BY_BACKEND: Record<BackendIntegrationCategory, IntegrationCategory> = {
  storefront: 'storefronts',
  marketplace: 'marketplaces',
  webhooks: 'webhooks',
};

const CARD_IMAGE_BY_KEY: Record<string, string> = {
  magento: magentoType,
  shopify: shopifyType,
  woocommerce: woocommerceType,
  amazon: amazonType,
  abb: abbType,
  ebay: ebayType,
  shein: sheinType,
  mirakl: miraklType,
  webhook: webhooksType,
};

const CARD_ICON_BY_KEY: Record<string, string> = {
  magento: magentoIcon,
  shopify: shopifyIcon,
  woocommerce: woocommerceIcon,
  amazon: amazonIcon,
  abb: abbIcon,
  ebay: ebayIcon,
  shein: sheinIcon,
  mirakl: miraklIcon,
  webhook: webhooksType,
};

const CARD_ICON_CLASS_BY_KEY: Record<string, string> = {
  woocommerce: 'scale-125',
};

const resolveCardValue = (node: PublicIntegrationTypeNode) => node.subtype || node.type || node.key;

const resolveCardImage = (node: PublicIntegrationTypeNode) => {
  if (node.logoPngUrl) {
    return node.logoPngUrl;
  }

  const directFallback = CARD_IMAGE_BY_KEY[node.key] || CARD_IMAGE_BY_KEY[node.subtype || ''];
  if (directFallback) {
    return directFallback;
  }

  if (node.subtype) {
    return noImageType;
  }

  return CARD_IMAGE_BY_KEY[node.type] || noImageType;
};

const resolveCardIcon = (node: PublicIntegrationTypeNode) => {
  if (node.iconSvgUrl) {
    return node.iconSvgUrl;
  }

  const directFallback = CARD_ICON_BY_KEY[node.key] || CARD_ICON_BY_KEY[node.subtype || ''];
  if (directFallback) {
    return directFallback;
  }

  if (node.subtype) {
    return noImageIcon;
  }

  return CARD_ICON_BY_KEY[node.type] || noImageIcon;
};

const resolveInfoVariant = (node: PublicIntegrationTypeNode): InfoVariant | undefined => {
  if (node.type === IntegrationTypes.Magento) {
    return 'magento';
  }
  if (node.type === IntegrationTypes.Shopify) {
    return 'shopify';
  }
  if (node.type === IntegrationTypes.Woocommerce) {
    return 'woocommerce';
  }
  if (node.type === IntegrationTypes.Webhook) {
    return 'webhook';
  }
  if (node.type === IntegrationTypes.Mirakl) {
    return 'mirakl';
  }
  return undefined;
};

const buildCardFromNode = (node: PublicIntegrationTypeNode): TypeCard => ({
  value: resolveCardValue(node),
  key: node.key,
  baseType: node.type as IntegrationTypes,
  subtype: node.subtype,
  category: UI_CATEGORY_BY_BACKEND[node.category],
  title: node.name,
  description: node.description,
  image: resolveCardImage(node),
  icon: resolveCardIcon(node),
  iconClass: CARD_ICON_CLASS_BY_KEY[node.key] || CARD_ICON_CLASS_BY_KEY[node.type],
  beta: node.isBeta,
  supportsOpenAiFeed: node.supportsOpenAiProductFeed,
  infoVariant: resolveInfoVariant(node),
});

const fetchIntegrationCards = async () => {
  loadingCards.value = true;
  cardLoadError.value = false;

  try {
    const filter: Record<string, any> = {
      active: { exact: true },
    };

    const trimmedSearch = searchTerm.value.trim();
    if (activeFilter.value !== 'all') {
      filter.category = { exact: BACKEND_CATEGORY_BY_FILTER[activeFilter.value] };
    }
    if (!showBeta.value) {
      filter.isBeta = { exact: false };
    }
    if (trimmedSearch) {
      filter.search = trimmedSearch;
    }

    const edges: Array<{ node: PublicIntegrationTypeNode }> = [];
    let after: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const { data } = await apolloClient.query({
        query: publicIntegrationTypesQuery,
        variables: {
          first: 100,
          after,
          filter,
        },
        fetchPolicy: 'network-only',
      });

      const connection = data?.publicIntegrationTypes;
      const currentEdges = connection?.edges || [];

      edges.push(...currentEdges);
      hasNextPage = Boolean(connection?.pageInfo?.hasNextPage);
      after = connection?.pageInfo?.endCursor || null;
    }

    integrationCards.value = edges.map((edge) => buildCardFromNode(edge.node));
  } catch (error) {
    integrationCards.value = [];
    cardLoadError.value = true;
    console.error('Failed to load public integration types', error);
  } finally {
    loadingCards.value = false;
  }
};

let fetchDebounce: ReturnType<typeof setTimeout> | null = null;

const scheduleCardFetch = () => {
  if (fetchDebounce) {
    clearTimeout(fetchDebounce);
  }

  fetchDebounce = setTimeout(() => {
    fetchIntegrationCards();
  }, 250);
};

const visibleCards = computed(() => integrationCards.value);
const filteredCount = computed(() => visibleCards.value.length);
const selectedCard = computed(() => {
  const currentCard = integrationCards.value.find((card) => card.value === selectedType.value) || null;
  if (currentCard) {
    return currentCard;
  }

  if (selectedCardCache.value?.value === selectedType.value) {
    return selectedCardCache.value;
  }

  return null;
});

const visibleSections = computed(() => {
  return categories.value
    .filter((category) => activeFilter.value === 'all' || category.key === activeFilter.value)
    .map((category) => ({
      ...category,
      cards: visibleCards.value.filter((card) => card.category === category.key),
    }))
    .filter((category) => category.cards.length > 0);
});

const openInfoModal = (card: TypeCard) => {
  selectedInfoCard.value = card;
  showInfoModal.value = true;
};

const closeInfoModal = () => {
  showInfoModal.value = false;
  selectedInfoCard.value = null;
};

const setFilter = (filter: FilterType) => {
  activeFilter.value = activeFilter.value === filter ? 'all' : filter;
};

const isCategoryActive = (category: IntegrationCategory) => activeFilter.value === category;

const selectCard = (card: TypeCard) => {
  if (selectedType.value === card.value) {
    selectedType.value = IntegrationTypes.None;
    selectedCardCache.value = null;
    return;
  }

  selectedType.value = card.value;
  selectedCardCache.value = card;
};

watch(selectedType, (newValue) => {
  emit('update:type', newValue);
});

watch(selectedCard, (card) => {
  emit('update:selection', card
    ? {
        key: card.key,
        type: card.baseType,
        subtype: card.subtype,
        name: card.title,
      }
    : null);
}, { immediate: true });

watch(
  () => props.type,
  (newValue) => {
    selectedType.value = newValue;
    if (newValue === IntegrationTypes.None) {
      selectedCardCache.value = null;
    }
  }
);

watch([searchTerm, activeFilter, showBeta], () => {
  scheduleCardFetch();
}, { immediate: true });

watch(integrationCards, (cards) => {
  const matchingCard = cards.find((card) => card.value === selectedType.value) || null;
  if (matchingCard) {
    selectedCardCache.value = matchingCard;
  }
});

onMounted(() => {
  const wizardActions = document.querySelector('.wizard-actions');
  if (!wizardActions) {
    return;
  }

  wizardActionsObserver = new IntersectionObserver(
    ([entry]) => {
      showStickySelection.value = !entry.isIntersecting;
    },
    {
      threshold: 0.15,
    }
  );

  wizardActionsObserver.observe(wizardActions);
});

onBeforeUnmount(() => {
  if (fetchDebounce) {
    clearTimeout(fetchDebounce);
  }
  wizardActionsObserver?.disconnect();
});
</script>

<template>
  <div class="mx-auto max-w-[1600px]">
    <div class="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-8 shadow-sm lg:px-10">
      <div class="flex flex-col gap-8">
        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-3xl">
              <p class="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                {{ t('integrations.create.wizard.step1.title') }}
              </p>
              <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 lg:text-4xl">
                {{ t('integrations.create.wizard.step1.heroTitle') }}
              </h1>
              <p class="mt-3 text-base leading-7 text-slate-600">
                {{ t('integrations.create.wizard.step1.heroDescription') }}
              </p>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm lg:min-w-[16rem]">
              <p class="text-sm font-medium text-slate-500">
                {{ t('integrations.create.wizard.step1.resultsLabel') }}
              </p>
              <p class="mt-1 text-3xl font-semibold text-slate-900">
                {{ filteredCount }}
              </p>
            </div>
          </div>

          <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <SearchInput
              v-model="searchTerm"
              :placeholder="t('integrations.create.wizard.step1.searchPlaceholder')"
            />

            <div class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm sm:flex-row sm:items-center">
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded-full border px-4 py-2 text-sm font-medium transition"
                  :class="activeFilter === 'all'
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'"
                  @click="activeFilter = 'all'"
                >
                  {{ t('integrations.create.wizard.step1.filters.all') }}
                </button>
                <button
                  v-for="category in categories"
                  :key="category.key"
                  type="button"
                  class="rounded-full border px-4 py-2 text-sm font-medium transition"
                  :class="isCategoryActive(category.key)
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'"
                  @click="setFilter(category.key)"
                >
                  {{ getCardFilter(category.key) }}
                </button>
              </div>

              <div class="h-px w-full bg-slate-200 sm:h-8 sm:w-px" />

              <div class="flex items-center justify-between gap-3">
                <span class="text-sm font-medium text-slate-700">
                  {{ t('integrations.create.wizard.step1.filters.showBeta') }}
                </span>
                <Toggle v-model="showBeta" />
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-8 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <aside class="space-y-4">
            <button
              v-for="category in categories"
              :key="category.key"
              type="button"
              class="group flex w-full gap-4 rounded-[1.75rem] border border-transparent bg-white/75 p-5 text-left transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
              @click="setFilter(category.key)"
            >
              <div
                class="w-1 rounded-full transition-colors"
                :class="isCategoryActive(category.key) ? 'bg-primary' : 'bg-slate-200'"
              />
              <div class="space-y-2">
                <p
                  class="text-lg font-semibold transition-colors"
                  :class="isCategoryActive(category.key) ? 'text-primary' : 'text-slate-800'"
                >
                  {{ category.title }}
                </p>
                <p class="text-sm leading-6 text-slate-500">
                  {{ category.description }}
                </p>
              </div>
            </button>
          </aside>

          <div class="min-h-[40rem]">
            <div
              v-if="visibleCards.length === 0"
              class="flex min-h-[28rem] flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white/70 px-6 text-center"
            >
              <p class="text-2xl font-semibold text-slate-900">
                {{ loadingCards ? t('shared.labels.loading') : t('integrations.create.wizard.step1.empty.title') }}
              </p>
              <p class="mt-3 max-w-xl text-base leading-7 text-slate-500">
                {{ loadingCards
                  ? t('integrations.create.wizard.step1.heroDescription')
                  : cardLoadError
                    ? t('shared.labels.error')
                    : t('integrations.create.wizard.step1.empty.description') }}
              </p>
            </div>

            <div v-else class="space-y-10">
              <section
                v-for="section in visibleSections"
                :key="section.key"
                class="space-y-5"
              >
                <div class="border-b border-slate-200 pb-4">
                  <p class="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                    {{ getCardFilter(section.key) }}
                  </p>
                  <h2 class="mt-2 text-2xl font-semibold text-slate-900">
                    {{ section.title }}
                  </h2>
                  <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    {{ section.description }}
                  </p>
                </div>

                <div class="grid gap-5 md:grid-cols-2 2xl:grid-cols-3 min-[1900px]:grid-cols-4">
                  <button
                    v-for="card in section.cards"
                    :key="card.value"
                    type="button"
                    class="group relative flex h-full min-h-[24rem] flex-col overflow-hidden rounded-[2rem] border bg-white text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                    :class="selectedType === card.value
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-slate-200 hover:border-slate-300'"
                    @click="selectCard(card)"
                  >
                    <div
                      class="absolute inset-x-0 top-0 h-24 bg-gradient-to-r"
                      :class="getCardAccentClass(card.category)"
                    />

                    <div class="relative flex h-full flex-col px-5 pb-5 pt-5">
                      <div class="flex items-center justify-between gap-3">
                        <div class="flex min-w-0 items-center gap-3">
                          <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <Image
                              :source="card.icon"
                              :alt="card.title"
                              class="h-8 w-8 object-contain"
                              :class="card.iconClass"
                            />
                          </div>
                        </div>

                        <div class="flex items-center gap-2">
                          <div
                            v-if="card.supportsOpenAiFeed"
                            class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-primary"
                            :title="t('integrations.create.wizard.step1.openAiFeedSupport')"
                          >
                            <Image
                              :source="openAiIcon"
                              :alt="t('integrations.create.wizard.step1.openAiFeedSupport')"
                              class="h-9 w-9 object-contain"
                            />
                          </div>

                          <button
                            v-if="card.infoVariant"
                            type="button"
                            class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-primary hover:text-primary"
                            @click.stop="openInfoModal(card)"
                          >
                            <span class="text-base font-semibold">?</span>
                          </button>

                          <div
                            class="flex h-9 w-9 items-center justify-center rounded-full border transition"
                            :class="selectedType === card.value
                              ? 'border-primary bg-primary text-white'
                              : 'border-slate-200 bg-white text-slate-300 group-hover:border-slate-300 group-hover:text-slate-500'"
                          >
                            <Icon name="check" size="sm" />
                          </div>
                        </div>
                      </div>

                      <div
                        class="relative mt-6 overflow-hidden rounded-b-[1.5rem] rounded-t-none border border-t-0 p-4"
                        :class="getCardAccentSurfaceClass(card.category)"
                      >
                        <div
                          v-if="card.beta"
                          class="absolute right-0 top-0 rounded-bl-2xl bg-amber-400 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-900"
                        >
                          {{ t('shared.labels.beta') }}
                        </div>
                        <Image
                          :source="card.image"
                          :alt="card.title"
                          class="h-32 w-full object-contain"
                        />
                      </div>

                      <div class="mt-6 flex flex-1 flex-col">
                        <h3 class="text-xl font-semibold text-slate-900">
                          {{ card.title }}
                        </h3>
                        <p class="mt-3 text-sm leading-6 text-slate-500">
                          {{ card.description }}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </section>
            </div>

            <div
              v-if="selectedCard && showStickySelection"
              class="sticky bottom-4 z-20 mt-8 rounded-[1.75rem] border border-primary/20 bg-white/95 p-5 shadow-xl backdrop-blur"
            >
              <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div class="flex items-start gap-4">
                  <div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <Image
                      :source="selectedCard.icon"
                      :alt="selectedCard.title"
                      class="h-8 w-8 object-contain"
                      :class="selectedCard.iconClass"
                    />
                  </div>

                  <div class="min-w-0">
                    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                      {{ t('integrations.create.wizard.step1.selection.title') }}
                    </p>
                    <div class="mt-1 flex flex-wrap items-center gap-2">
                      <h3 class="text-xl font-semibold text-slate-900">
                        {{ selectedCard.title }}
                      </h3>
                      <Badge
                        :text="getCardFilter(selectedCard.category)"
                        :color="selectedCard.category === 'storefronts' ? 'green' : selectedCard.category === 'marketplaces' ? 'blue' : 'gray'"
                      />
                      <Badge
                        v-if="selectedCard.beta"
                        :text="t('shared.labels.beta')"
                        color="yellow"
                      />
                    </div>
                    <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                      {{ t('integrations.create.wizard.step1.selection.description', { integration: selectedCard.title }) }}
                    </p>
                  </div>
                </div>

                <div class="flex flex-col gap-3 sm:flex-row">
                  <Button class="btn btn-outline-dark whitespace-nowrap" @click="selectedType = IntegrationTypes.None">
                    {{ t('integrations.create.wizard.step1.selection.clear') }}
                  </Button>
                  <PrimaryButton class="whitespace-nowrap" @click="emit('go-next')">
                    {{ t('shared.button.next') }}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Modal v-if="showInfoModal" v-model="showInfoModal" @closed="closeInfoModal">
      <component
        v-if="infoComponent"
        :is="infoComponent"
        v-bind="infoComponentProps"
        @close="closeInfoModal"
      />
    </Modal>
  </div>
</template>
