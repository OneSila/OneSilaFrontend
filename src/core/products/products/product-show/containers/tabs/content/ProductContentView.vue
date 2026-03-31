<script setup lang="ts">

import {useI18n} from 'vue-i18n';
import {Product} from "../../../../configs";
import {Button} from "../../../../../../../shared/components/atoms/button";
import apolloClient from "../../../../../../../../apollo-client";
import { getProductContentByLanguageAndChannelQuery, getProductContentByLanguageAndDefaultQuery } from "../../../../../../../shared/api/queries/products.js";
import { createProductTranslationMutation, updateProductTranslationMutation } from "../../../../../../../shared/api/mutations/products.js";
import { integrationsQuery } from "../../../../../../../shared/api/queries/integrations.js";
import { reactive, watch, ref, onMounted, computed, nextTick } from "vue";
import { Toast } from "../../../../../../../shared/modules/toast";
import { processGraphQLErrors } from "../../../../../../../shared/utils";
import { IntegrationTypes } from "../../../../../../integrations/integrations/integrations";
import { getContentFieldRules } from './contentFieldRules';
import { SalesChannelTabs } from "../../../../../../../shared/components/molecules/sales-channel-tabs";
import LanguageSelector from "../../../../../../../shared/components/molecules/language-selector/LanguageSelector.vue";
import ProductContentForm from "./ProductContentForm.vue";
import ProductTranslationBulletPoints from "./ProductTranslationBulletPoints.vue";
import { AdvancedContentGenerator } from "../../../../../../../shared/components/organisms/advanced-content-generator";
import ProductContentImportModal from "../../../../../../../shared/components/organisms/import-content/ProductContentImportModal.vue";
import ProductPreviewTrigger from "../shared/ProductPreviewTrigger.vue";

const {t} = useI18n();
const props = defineProps<{ product: Product }>();

const initialForm = ref({
  name: '',
  subtitle: '',
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
const fieldErrors = ref<Record<string, string>>({});
const bulletPointsRef = ref<any>(null);
const defaultLanguageCode = ref('en');

const currentChannelType = computed(() => {
  if (currentSalesChannel.value === 'default') return 'default';
  const ch = salesChannels.value.find((c: any) => c.id === currentSalesChannel.value);
  return ch?.type || 'default';
});

const fieldRules = computed(() => getContentFieldRules(currentChannelType.value));


const handleLanguageOptionsLoaded = (rawData) => {
  if (!rawData?.languages?.length) {
    return;
  }

  if (currentLanguage.value === null && rawData.defaultLanguage?.code) {
    currentLanguage.value = rawData.defaultLanguage.code;
  }

  defaultLanguageCode.value = rawData.defaultLanguage?.code || 'en';
};


const loadSalesChannels = async () => {
  try {
    const { data } = await apolloClient.query({ query: integrationsQuery, fetchPolicy: 'cache-first' });
    salesChannels.value = data?.integrations.edges
      .map((e: any) => e.node)
      .filter((c: any) => c.type !== IntegrationTypes.Webhook) || [];
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
        form.subtitle = translation.subtitle;
        form.shortDescription = translation.shortDescription;
        form.description = translation.description;
        form.urlKey = translation.urlKey;
        translationId.value = translation.id;
        mutation.value = updateProductTranslationMutation;
      } else {
        form.name = '';
        form.subtitle = '';
        form.shortDescription = '<p><br></p>';
        form.description = '<p><br></p>';
        form.urlKey = '';
        translationId.value = null;
        mutation.value = createProductTranslationMutation;
      }

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
        form.subtitle = translation.subtitle;
        form.shortDescription = translation.shortDescription;
        form.description = translation.description;
        form.urlKey = translation.urlKey;
        translationId.value = translation.id;
        mutation.value = updateProductTranslationMutation;
      } else {
        form.name = '';
        form.subtitle = '';
        form.shortDescription = '<p><br></p>';
        form.description = '<p><br></p>';
        form.urlKey = '';
        translationId.value = null;
        mutation.value = createProductTranslationMutation;
      }
    }
  } catch (error) {
    console.error("Error fetching translation:", error);
  }

  await nextTick();
  initialForm.value = { ...form };
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
    return;
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
    const confirmChange = confirm(t('products.products.messages.unsavedChanges'));
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
  try {
    await bulletPointsRef.value?.save(translationId.value);
  } catch (e) { /* errors handled in component */ }
  Toast.success(t('products.translation.successfullyUpdated'));
  initialForm.value = {...form};
  fieldErrors.value = {};
};

const handleGeneratedDescriptionContent =  (newVal) => {
  form.description = newVal;
};

const handleGeneratedShortDescriptionContent =  (newVal) => {
  form.shortDescription = newVal;
};

const handleImportCompleted = async () => {
  if (!currentLanguage.value) return;
  await setFormAndMutation(currentLanguage.value, currentSalesChannel.value);
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

const hasUnsavedChanges = computed(() => {
  const formChanged = JSON.stringify(form) !== JSON.stringify(initialForm.value);
  const bulletsChanged = bulletPointsRef.value?.hasChanges;
  return formChanged || bulletsChanged;
});

defineExpose({ hasUnsavedChanges });

const shortDescriptionToolbarOptions = [
  ['bold', 'underline'],
  [{ list: 'bullet' }],
  ['clean']
];

</script>

<template>

  <Flex end class="gap-2 flex-wrap">
    <FlexCell>
      <ProductPreviewTrigger
        :product="product"
        :sales-channel-id="currentSalesChannel"
        :sales-channels="salesChannels"
        :language-code="currentLanguage"
      />
    </FlexCell>
    <FlexCell>
      <AdvancedContentGenerator
        :product-ids="[product.id]"
        :initial-sales-channel-ids="currentSalesChannel !== 'default' ? [currentSalesChannel] : []"
        :small="false"
      />
    </FlexCell>
    <FlexCell>
      <ProductContentImportModal
        :product-ids="[product.id]"
        :current-language="currentLanguage"
        :current-sales-channel="currentSalesChannel"
        :sales-channels="salesChannels"
        @imported="handleImportCompleted"
      />
    </FlexCell>
    <FlexCell>
      <ApolloMutation v-if="mutation" :mutation="mutation" :variables="getVariables()">
        <template v-slot="{ mutate, loading }">
          <Button :customClass="'btn btn-primary'" :disabled="loading" @click="handleSave(mutate)">
            {{ t('shared.button.save') }}
          </Button>
        </template>
      </ApolloMutation>
    </FlexCell>
    <FlexCell>
      <LanguageSelector
        v-model="currentLanguage"
        selector-class="w-full min-w-[12rem] sm:min-w-[14rem]"
        @loaded="handleLanguageOptionsLoaded"
        @update:modelValue="handleLanguageSelection"
      />
    </FlexCell>
  </Flex>

  <Flex v-if="currentSalesChannel !== 'default'" class=" mt-2 block lg:hidden">
    <FlexCell>
      <div class="text-xs text-orange-700">
        {{ t('products.translation.warning.inheritFromDefault') }}
      </div>
    </FlexCell>
  </Flex>


  <hr class="mt-4">

  <div
    class="
      mt-4
      grid gap-4
      grid-cols-1
      lg:grid-cols-[220px_minmax(0,1fr)]
      xl:grid-cols-[360px_minmax(0,1fr)]
      2xl:grid-cols-[420px_minmax(0,1fr)]
    "
  >
    <div>
      <SalesChannelTabs v-model="currentSalesChannel" :channels="salesChannels" @update:modelValue="handleSalesChannelSelection" />
    </div>

    <!-- Product Content Form -->
    <div
      class="
        col-span-1
      "
    >
      <div class="p-2 bg-white">
        <ProductContentForm
          :form="form"
          :field-errors="fieldErrors"
          :product-id="product.id"
          :current-language="currentLanguage"
          :default-language-code="defaultLanguageCode"
          :short-description-toolbar-options="shortDescriptionToolbarOptions"
          :field-limits="fieldRules.limits"
          :show-subtitle="fieldRules.subtitle"
          :show-short-description="fieldRules.shortDescription"
          :show-url-key="fieldRules.urlKey"
          :sales-channel-type="currentChannelType"
          :sales-channel-id="currentSalesChannel !== 'default' ? currentSalesChannel : undefined"
          @description="handleGeneratedDescriptionContent"
          @shortDescription="handleGeneratedShortDescriptionContent"
        >
          <template #bullet-points>
            <ProductTranslationBulletPoints
              v-if="fieldRules.bulletPoints"
              ref="bulletPointsRef"
              :translation-id="translationId"
              :product-id="product.id"
              :language-code="currentLanguage"
              :default-language-code="defaultLanguageCode"
              :sales-channel-id="currentSalesChannel !== 'default' ? currentSalesChannel : undefined"
              :bullet-point-limit="fieldRules.limits.bulletPoints"
            />
          </template>
        </ProductContentForm>
      </div>
    </div>
  </div>

  <Flex v-if="currentSalesChannel !== 'default'" class="mt-2 hidden lg:block">
    <FlexCell>
      <div class="text-xs text-orange-700">
        {{ t('products.translation.warning.inheritFromDefault') }}
      </div>
    </FlexCell>
  </Flex>
</template>
