<script setup lang="ts">

import {useI18n} from 'vue-i18n';
import {Product} from "../../../../configs";
import {Button} from "../../../../../../../shared/components/atoms/button";
import apolloClient from "../../../../../../../../apollo-client";
import {getProductTranslationByLanguageQuery,
        getProductContentByLanguageAndChannelQuery} from "../../../../../../../shared/api/queries/products.js";
import {
  updateProductTranslationMutation,
  createProductTranslationMutation,
  updateProductContentMutation,
  createProductContentMutation,
} from "../../../../../../../shared/api/mutations/products.js";
import { integrationsQuery } from "../../../../../../../shared/api/queries/integrations.js";
import {Selector} from "../../../../../../../shared/components/atoms/selector";
import {reactive, watch, ref, onMounted, computed} from "vue";
import {translationLanguagesQuery} from '../../../../../../../shared/api/queries/languages.js';
import {Toast} from "../../../../../../../shared/modules/toast";
import {processGraphQLErrors} from "../../../../../../../shared/utils";
import { IntegrationTypes } from "../../../../../../integrations/integrations/integrations";
import SalesChannelTabs from "./SalesChannelTabs.vue";
import ProductContentPreview from "./ProductContentPreview.vue";
import ProductContentForm from "./ProductContentForm.vue";

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


const cleanedData = (rawData) => {
  if (rawData && rawData.languages.length > 0) {

    if (currentLanguage.value === null) {
      currentLanguage.value = rawData.defaultLanguage.code;
    }
    return rawData.languages;
  }
  return [];
};

const cleanHostname = (hostname: string, type: string) => {
  if (!hostname) return '';
  if (type === IntegrationTypes.Amazon) {
    return hostname;
  }
  try {
    const url = new URL(hostname.startsWith('http') ? hostname : `https://${hostname}`);
    const clean = url.hostname.replace(/^www\./i, '');
    return clean.split('.')[0];
  } catch { return hostname; }
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
    const {data} = await apolloClient.query({
      query: getProductContentByLanguageAndChannelQuery,
      variables: {languageCode: language, productId: props.product.id, salesChannelId: channel === 'default' ? null : channel},
      fetchPolicy: 'network-only'
    });

    if (data && data.productContents.edges.length === 1) {
      const translation = data.productContents.edges[0].node;
      form.name = translation.name;
      form.shortDescription = translation.shortDescription;
      form.description = translation.description;
      form.urlKey = translation.urlKey;
      translationId.value = translation.id;
      mutation.value = updateProductContentMutation;
      previewContent.value = translation;
    } else {
      form.name = '';
      form.shortDescription = '<p><br></p>';
      form.description = '<p><br></p>';
      form.urlKey = '';
      translationId.value = null;
      mutation.value = createProductContentMutation;
      previewContent.value = null;
    }
    initialForm.value = {...form};

    if (channel !== 'default') {
      const { data: def } = await apolloClient.query({
        query: getProductContentByLanguageAndChannelQuery,
        variables: { languageCode: language, productId: props.product.id, salesChannelId: null },
        fetchPolicy: 'network-only'
      });
      defaultPreviewContent.value = def?.productContents.edges[0]?.node || null;
    } else {
      defaultPreviewContent.value = null;
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

const onMutationCompleted = () => {
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
      <ApolloMutation v-if="mutation" :mutation="mutation" :variables="getVariables()" @done="onMutationCompleted" @error="handleError">
        <template v-slot="{ mutate, loading, error }">
          <Button :customClass="'btn btn-primary mr-2'" :disabled="loading" @click="mutate">
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

  <Flex between class="mt-4">
    <FlexCell class="w-40">
      <SalesChannelTabs
        v-model="currentSalesChannel"
        :channels="salesChannels"
        @update:modelValue="handleSalesChannelSelection"
      />
    </FlexCell>

    <FlexCell class="w-full xl:w-1/2">
      <ProductContentForm
        :form="form"
        :field-errors="fieldErrors"
        :product-id="product.id"
        :current-language="currentLanguage"
        :short-description-toolbar-options="shortDescriptionToolbarOptions"
        @description="handleGeneratedDescriptionContent"
        @shortDescription="handleGeneratedShortDescriptionContent"
      />
    </FlexCell>

    <FlexCell class="hidden xl:block xl:w-1/3">
      <ProductContentPreview
        :content="previewContent"
        :default-content="defaultPreviewContent"
        :current-channel="currentSalesChannel"
        :channels="salesChannels"
      />
    </FlexCell>

  </Flex>
</template>
