<script setup lang="ts">

import {useI18n} from 'vue-i18n';
import {Product} from "../../../../configs";
import {Button} from "../../../../../../../shared/components/atoms/button";
import apolloClient from "../../../../../../../../apollo-client";
import { getProductContentByLanguageAndChannelQuery, getProductContentByLanguageAndDefaultQuery } from "../../../../../../../shared/api/queries/products.js";
import { createProductTranslationMutation, updateProductTranslationMutation } from "../../../../../../../shared/api/mutations/products.js";
import { integrationsQuery } from "../../../../../../../shared/api/queries/integrations.js";
import { Selector} from "../../../../../../../shared/components/atoms/selector";
import { reactive, watch, ref, onMounted, computed } from "vue";
import { translationLanguagesQuery } from '../../../../../../../shared/api/queries/languages.js';
import { Toast } from "../../../../../../../shared/modules/toast";
import { processGraphQLErrors } from "../../../../../../../shared/utils";
import { IntegrationTypes } from "../../../../../../integrations/integrations/integrations";
import { getContentFieldRules } from './contentFieldRules';
import SalesChannelTabs from "./SalesChannelTabs.vue";
import ProductContentPreview from "./ProductContentPreview.vue";
import ProductContentForm from "./ProductContentForm.vue";
import ProductTranslationBulletPoints from "./ProductTranslationBulletPoints.vue";

const {t} = useI18n();
const props = defineProps<{ product: Product }>();

const initialForm = ref({
  name: '',
  shortDescription: '',
  description: '',
  urlKey: ''
});

const form = reactive({...initialForm.value});
const currentLanguage = ref(null);
const currentSalesChannel = ref<'default' | string>('default');
const mutation = ref(null);
const translationId = ref(null);
const oldLang = ref(currentLanguage.value);
const oldChannel = ref(currentSalesChannel.value);
const salesChannels = ref<any[]>([]);
const previewContent = ref<any | null>(null);
const defaultPreviewContent = ref<any | null>(null);
const fieldErrors = ref<Record<string, string>>({});
const bulletPointsRef = ref<any>(null);
const previewBulletPoints = ref<any[]>([]);

const currentChannelType = computed(() => {
  if (currentSalesChannel.value === 'default') return 'default';
  const ch = salesChannels.value.find((c: any) => c.id === currentSalesChannel.value);
  return ch?.type || 'default';
});

const fieldRules = computed(() => getContentFieldRules(currentChannelType.value));


const cleanedData = (rawData) => {
  if (rawData && rawData.languages.length > 0) {

    if (currentLanguage.value === null) {
      currentLanguage.value = rawData.defaultLanguage.code;
    }
    return rawData.languages;
  }
  return [];
};


const loadSalesChannels = async () => {
  try {
    const { data } = await apolloClient.query({ query: integrationsQuery, fetchPolicy: 'network-only' });
    salesChannels.value = data?.integrations.edges.map((e: any) => e.node) || [];
  } catch (e) {
    console.error('Failed to load sales channels', e);
  }
};

onMounted(async () => {
  await loadSalesChannels();
  if (currentLanguage.value !== null) {
    await setFormAndMutation(currentLanguage.value, currentSalesChannel.value);
  }
});

const setFormAndMutation = async (language, channel) => {
  try {
    if (channel === 'default') {
      // Query where salesChannel is null (Default)
      const { data } = await apolloClient.query({
        query: getProductContentByLanguageAndDefaultQuery,
        variables: { languageCode: language, productId: props.product.id },
        fetchPolicy: 'network-only'
      });

      if (data && data.productTranslations.edges.length === 1) {
        const translation = data.productTranslations.edges[0].node;
        form.name = translation.name;
        form.shortDescription = translation.shortDescription;
        form.description = translation.description;
        form.urlKey = translation.urlKey;
        translationId.value = translation.id;
        mutation.value = updateProductTranslationMutation;
        previewContent.value = translation;
      } else {
        form.name = '';
        form.shortDescription = '<p><br></p>';
        form.description = '<p><br></p>';
        form.urlKey = '';
        translationId.value = null;
        mutation.value = createProductTranslationMutation;
        previewContent.value = null;
      }
      initialForm.value = { ...form };
      defaultPreviewContent.value = null;

    } else {
      // Query with specific salesChannelId
      const { data } = await apolloClient.query({
        query: getProductContentByLanguageAndChannelQuery,
        variables: {
          languageCode: language,
          productId: props.product.id,
          salesChannelId: channel
        },
        fetchPolicy: 'network-only'
      });

      if (data && data.productTranslations.edges.length === 1) {
        const translation = data.productTranslations.edges[0].node;
        form.name = translation.name;
        form.shortDescription = translation.shortDescription;
        form.description = translation.description;
        form.urlKey = translation.urlKey;
        translationId.value = translation.id;
        mutation.value = updateProductTranslationMutation;
        previewContent.value = translation;
      } else {
        form.name = '';
        form.shortDescription = '<p><br></p>';
        form.description = '<p><br></p>';
        form.urlKey = '';
        translationId.value = null;
        mutation.value = createProductTranslationMutation;
        previewContent.value = null;
      }
      initialForm.value = { ...form };

      // Fetch default translation for preview/fallback
      const { data: def } = await apolloClient.query({
        query: getProductContentByLanguageAndDefaultQuery,
        variables: { languageCode: language, productId: props.product.id },
        fetchPolicy: 'network-only'
      });
      defaultPreviewContent.value = def?.productTranslations.edges[0]?.node || null;
    }
  } catch (error) {
    console.error("Error fetching translation:", error);
  }
};


watch(currentLanguage, async (newLanguage, oldLanguage) => {
  if (oldLanguage === null) {
    await setFormAndMutation(newLanguage, currentSalesChannel.value);
    oldLang.value = newLanguage;
  }
});

watch(currentSalesChannel, async (newChannel, oldChannelVal) => {
  if (oldChannelVal === null) {
    await setFormAndMutation(currentLanguage.value, newChannel);
    oldChannel.value = newChannel;
  }
});

watch(currentChannelType, (newType) => {
  if (!getContentFieldRules(newType).bulletPoints) {
    previewBulletPoints.value = [];
  }
});

const handleLanguageSelection = async (newLanguage) => {

  if (JSON.stringify(form) !== JSON.stringify(initialForm.value)) {
    const confirmChange = confirm(t('products.translation.confirmLanguageChange'));
    if (!confirmChange) {
      currentLanguage.value = oldLang.value;
      return;
    }
  }

  oldLang.value = newLanguage;
  await setFormAndMutation(newLanguage, currentSalesChannel.value);
};

const handleSalesChannelSelection = async (newChannel) => {

  if (JSON.stringify(form) !== JSON.stringify(initialForm.value)) {
    const confirmChange = confirm(t('products.translation.confirmLanguageChange'));
    if (!confirmChange) {
      currentSalesChannel.value = oldChannel.value;
      return;
    }
  }

  oldChannel.value = newChannel;
  await setFormAndMutation(currentLanguage.value, newChannel);
};


const getVariables = () => {
  const variables = {
    ...form,
    product: {id: props.product.id},
    language: currentLanguage.value,
    salesChannel: currentSalesChannel.value === 'default' ? null : { id: currentSalesChannel.value }
  };

  if (translationId.value) {
    variables['id'] = translationId.value;
  }

  return {data: variables};
};

const onMutationCompleted = async (response) => {
  const data = response?.data?.updateProductTranslation || response?.data?.createProductTranslation;
  if (data && !translationId.value) {
    translationId.value = data.id;
    mutation.value = updateProductTranslationMutation;
  }
  let latestBulletPoints = [];
  try {
    latestBulletPoints = await bulletPointsRef.value?.save(translationId.value) || [];
  } catch (e) { /* errors handled in component */ }
  previewBulletPoints.value = latestBulletPoints;
  Toast.success(t('products.translation.successfullyUpdated'));
  initialForm.value = {...form};
  fieldErrors.value = {};
  previewContent.value = {...form};
};

const handleGeneratedDescriptionContent =  (newVal) => {
  form.description = newVal;
};

const handleGeneratedShortDescriptionContent =  (newVal) => {
  form.shortDescription = newVal;
};

const handleSave = async (mutate) => {
  try {
    const response = await mutate();
    await onMutationCompleted(response);
  } catch (e) {
    handleError(e);
  }
};

const handleError = (errors) => {
  const validationErrors = processGraphQLErrors(errors, t);
  fieldErrors.value = validationErrors;
  if (validationErrors['__all__']) {
    Toast.error(validationErrors['__all__']);
  }
}

const shortDescriptionToolbarOptions = [
  ['bold', 'underline'],
  [{ list: 'bullet' }],
  ['clean']
];

</script>

<template>

  <Flex end>
    <FlexCell>
      <ApolloMutation v-if="mutation" :mutation="mutation" :variables="getVariables()">
        <template v-slot="{ mutate, loading }">
          <Button :customClass="'btn btn-primary mr-2'" :disabled="loading" @click="handleSave(mutate)">
            {{ t('shared.button.save') }}
          </Button>
        </template>
      </ApolloMutation>
    </FlexCell>
    <FlexCell>
      <ApolloQuery :query="translationLanguagesQuery">
        <template v-slot="{ result: { data } }">
          <Selector v-if="data"
                    v-model="currentLanguage"
                    :options="cleanedData(data.translationLanguages)"
                    :removable="false"
                    :placeholder="t('products.translation.placeholders.language')"
                    @update:modelValue="handleLanguageSelection"
                    class="w-40"
                    labelBy="name"
                    valueBy="code"
                    mandatory
                    filterable/>
        </template>
      </ApolloQuery>
    </FlexCell>
  </Flex>

  <hr class="mt-4">

  <div
    class="
      mt-4
      grid gap-4
      grid-cols-1
      lg:grid-cols-12
      xl:grid-cols-10
      2xl:grid-cols-10
    "
  >
    <!-- Sales Channel Tabs -->
    <div
      class="
        col-span-1
        lg:col-span-12
        xl:col-span-2
        2xl:col-span-2
      "
    >
      <SalesChannelTabs
        v-model="currentSalesChannel"
        :channels="salesChannels"
        @update:modelValue="handleSalesChannelSelection"
      />
    </div>

    <!-- Product Content Form -->
    <div
      class="
        col-span-1
        lg:col-span-7
        xl:col-span-4
        2xl:col-span-4
      "
    >
      <div class="p-2 bg-white">
        <ProductContentForm
          :form="form"
          :field-errors="fieldErrors"
          :product-id="product.id"
          :current-language="currentLanguage"
          :short-description-toolbar-options="shortDescriptionToolbarOptions"
          :show-short-description="fieldRules.shortDescription"
          :show-url-key="fieldRules.urlKey"
          @description="handleGeneratedDescriptionContent"
          @shortDescription="handleGeneratedShortDescriptionContent"
        />
        <ProductTranslationBulletPoints
          v-if="fieldRules.bulletPoints"
          ref="bulletPointsRef"
          :translation-id="translationId"
          @initial-bullet-points="previewBulletPoints = [...$event]"
        />
      </div>
    </div>

    <!-- Product Content Preview -->
    <div
      class="
        col-span-1
        lg:col-span-5
        xl:col-span-4
        2xl:col-span-4
      "
    >
      <ProductContentPreview
        :content="previewContent"
        :default-content="defaultPreviewContent"
        :current-channel="currentSalesChannel"
        :channels="salesChannels"
        :bullet-points="fieldRules.bulletPoints ? previewBulletPoints : []"
      />
    </div>
  </div>

</template>
