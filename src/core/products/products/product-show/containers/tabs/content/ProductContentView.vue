<script setup lang="ts">

import {useI18n} from 'vue-i18n';
import Swal from 'sweetalert2';
import {Product} from "../../../../configs";
import {Button} from "../../../../../../../shared/components/atoms/button";
import apolloClient from "../../../../../../../../apollo-client";
import { getProductContentByLanguageAndChannelQuery, getProductContentByLanguageAndDefaultQuery } from "../../../../../../../shared/api/queries/products.js";
import {
  cleanProductTranslationFieldMutation,
  createProductTranslationMutation,
  updateProductTranslationMutation,
} from "../../../../../../../shared/api/mutations/products.js";
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

type ProductContentFormState = {
  name: string;
  subtitle: string;
  shortDescription: string;
  description: string;
  urlKey: string;
};
type ContentField = 'DESCRIPTION' | 'SHORT_DESCRIPTION' | 'SUBTITLE' | 'BULLET_POINTS' | 'URL_KEY';

const emptyHtml = '<p><br></p>';

const createEmptyFormState = (): ProductContentFormState => ({
  name: '',
  subtitle: '',
  shortDescription: emptyHtml,
  description: emptyHtml,
  urlKey: ''
});

const initialForm = ref(createEmptyFormState());
const form = reactive(createEmptyFormState());
const currentLanguage = ref(null);
const currentSalesChannel = ref<'default' | string>('default');
const mutation = ref(null);
const translationId = ref(null);
const salesChannels = ref<any[]>([]);
const fieldErrors = ref<Record<string, string>>({});
const bulletPointsRef = ref<any>(null);
const defaultLanguageCode = ref('en');
const formRenderKey = ref(0);
const cleaningField = ref<ContentField | null>(null);
let latestFormRequestId = 0;

const currentChannelType = computed(() => {
  if (currentSalesChannel.value === 'default') return 'default';
  const ch = salesChannels.value.find((c: any) => c.id === currentSalesChannel.value);
  return ch?.type || 'default';
});

const fieldRules = computed(() => getContentFieldRules(currentChannelType.value));
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    popup: 'sweet-alerts',
    confirmButton: 'btn btn-danger',
    cancelButton: 'btn btn-outline-primary ltr:mr-3 rtl:ml-3',
  },
  buttonsStyling: false,
});

const applyFormState = (nextState: ProductContentFormState) => {
  form.name = nextState.name;
  form.subtitle = nextState.subtitle;
  form.shortDescription = nextState.shortDescription;
  form.description = nextState.description;
  form.urlKey = nextState.urlKey;
};

const resetFormState = () => {
  applyFormState(createEmptyFormState());
  fieldErrors.value = {};
  translationId.value = null;
  mutation.value = createProductTranslationMutation;
  bulletPointsRef.value = null;
  formRenderKey.value += 1;
};

const mapTranslationToFormState = (translation: Partial<ProductContentFormState> | null | undefined): ProductContentFormState => ({
  name: translation?.name || '',
  subtitle: translation?.subtitle || '',
  shortDescription: translation?.shortDescription || emptyHtml,
  description: translation?.description || emptyHtml,
  urlKey: translation?.urlKey || '',
});


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
  if (!language) {
    return;
  }

  const requestId = ++latestFormRequestId;
  resetFormState();

  try {
    if (channel === 'default') {
      // Query where salesChannel is null (Default)
      const { data } = await apolloClient.query({
        query: getProductContentByLanguageAndDefaultQuery,
        variables: { languageCode: language, productId: props.product.id },
        fetchPolicy: 'network-only'
      });

      if (requestId !== latestFormRequestId) {
        return;
      }

      if (data && data.productTranslations.edges.length === 1) {
        const translation = data.productTranslations.edges[0].node;
        applyFormState(mapTranslationToFormState(translation));
        translationId.value = translation.id;
        mutation.value = updateProductTranslationMutation;
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

      if (requestId !== latestFormRequestId) {
        return;
      }

      if (data && data.productTranslations.edges.length === 1) {
        const translation = data.productTranslations.edges[0].node;
        applyFormState(mapTranslationToFormState(translation));
        translationId.value = translation.id;
        mutation.value = updateProductTranslationMutation;
      }
    }
  } catch (error) {
    if (requestId !== latestFormRequestId) {
      return;
    }

    console.error("Error fetching translation:", error);
  }

  if (requestId !== latestFormRequestId) {
    return;
  }

  await nextTick();
  initialForm.value = { ...form };
};


watch(currentLanguage, async (newLanguage, oldLanguage) => {
  if (oldLanguage === null) {
    await setFormAndMutation(newLanguage, currentSalesChannel.value);
  }
});

const handleLanguageSelection = async (newLanguage) => {
  if (newLanguage === currentLanguage.value) {
    return;
  }

  if (JSON.stringify(form) !== JSON.stringify(initialForm.value)) {
    const confirmChange = confirm(t('products.translation.confirmLanguageChange'));
    if (!confirmChange) {
      return;
    }
  }

  currentLanguage.value = newLanguage;
  await setFormAndMutation(newLanguage, currentSalesChannel.value);
};

const handleSalesChannelSelection = async (newChannel) => {
  if (newChannel === currentSalesChannel.value) {
    return;
  }

  if (JSON.stringify(form) !== JSON.stringify(initialForm.value)) {
    const confirmChange = confirm(t('products.products.messages.unsavedChanges'));
    if (!confirmChange) {
      return;
    }
  }

  currentSalesChannel.value = newChannel;
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

const cleanFieldMap: Record<Exclude<ContentField, 'BULLET_POINTS'>, keyof ProductContentFormState> = {
  DESCRIPTION: 'description',
  SHORT_DESCRIPTION: 'shortDescription',
  SUBTITLE: 'subtitle',
  URL_KEY: 'urlKey',
};

const handleCleanField = async (field: ContentField) => {
  if (!translationId.value || cleaningField.value) {
    return;
  }

  const result = await swalWithBootstrapButtons.fire({
    icon: 'warning',
    text: t('products.translation.cleanField.confirm'),
    showCancelButton: true,
    reverseButtons: true,
  });
  if (!result.isConfirmed) {
    return;
  }

  cleaningField.value = field;

  try {
    const { data } = await apolloClient.mutate({
      mutation: cleanProductTranslationFieldMutation,
      variables: {
        translation: { id: translationId.value },
        field,
      },
    });

    const cleanedTranslation = data?.cleanTranslationField;
    if (cleanedTranslation) {
      applyFormState(mapTranslationToFormState(cleanedTranslation));
    } else if (field !== 'BULLET_POINTS') {
      const mappedField = cleanFieldMap[field as Exclude<ContentField, 'BULLET_POINTS'>];
      if (mappedField) {
        const htmlFields: Array<keyof ProductContentFormState> = ['description', 'shortDescription'];
        form[mappedField] = htmlFields.includes(mappedField) ? emptyHtml : '';
      }
    }

    if (field === 'BULLET_POINTS') {
      await bulletPointsRef.value?.fetchPoints?.();
    }

    initialForm.value = { ...form };
    fieldErrors.value = {};
    Toast.success(t('products.translation.cleanField.success'));
  } catch (e) {
    handleError(e);
    Toast.error(t('products.translation.cleanField.error'));
  } finally {
    cleaningField.value = null;
  }
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

  <div class="flex flex-wrap items-center justify-end gap-2">
    <ProductPreviewTrigger
      :product="product"
      :sales-channel-id="currentSalesChannel"
      :sales-channels="salesChannels"
      :language-code="currentLanguage"
    />
    <AdvancedContentGenerator
      :product-ids="[product.id]"
      :initial-sales-channel-ids="currentSalesChannel !== 'default' ? [currentSalesChannel] : []"
      :small="false"
    />
    <ProductContentImportModal
      :product-ids="[product.id]"
      :current-language="currentLanguage"
      :current-sales-channel="currentSalesChannel"
      :sales-channels="salesChannels"
      btn-class="btn-outline-primary"
      @imported="handleImportCompleted"
    />
    <ApolloMutation v-if="mutation" :mutation="mutation" :variables="getVariables()">
      <template v-slot="{ mutate, loading }">
        <Button :customClass="'btn btn-primary'" :disabled="loading" @click="handleSave(mutate)">
          {{ t('shared.button.save') }}
        </Button>
      </template>
    </ApolloMutation>
    <div class="shrink-0">
      <LanguageSelector
        :model-value="currentLanguage"
        selector-class="w-full min-w-[12rem] sm:min-w-[14rem]"
        @loaded="handleLanguageOptionsLoaded"
        @update:modelValue="handleLanguageSelection"
      />
    </div>
  </div>

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
      lg:grid-cols-[200px_minmax(0,1fr)]
      xl:grid-cols-[280px_minmax(0,1fr)]
      2xl:grid-cols-[340px_minmax(0,1fr)]
    "
  >
    <div>
      <SalesChannelTabs
        :model-value="currentSalesChannel"
        :channels="salesChannels"
        @update:modelValue="handleSalesChannelSelection"
      />
    </div>

    <!-- Product Content Form -->
    <div
      class="
        col-span-1
      "
    >
      <div class="p-2 bg-white">
        <ProductContentForm
          :key="formRenderKey"
          :form="form"
          :field-errors="fieldErrors"
          :translation-id="translationId"
          :cleaning-field="cleaningField"
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
          @clean-field="handleCleanField"
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
              :cleaning="cleaningField === 'BULLET_POINTS'"
              @clean-field="handleCleanField('BULLET_POINTS')"
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
