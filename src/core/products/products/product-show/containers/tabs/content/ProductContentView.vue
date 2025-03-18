<script setup lang="ts">

import {useI18n} from 'vue-i18n';
import {Product} from "../../../../configs";
import {Button} from "../../../../../../../shared/components/atoms/button";
import apolloClient from "../../../../../../../../apollo-client";
import {getProductTranslationByLanguageQuery} from "../../../../../../../shared/api/queries/products.js";
import {
  updateProductTranslationMutation,
  createProductTranslationMutation,
  generateProductAiContentMutation
} from "../../../../../../../shared/api/mutations/products.js";
import {Selector} from "../../../../../../../shared/components/atoms/selector";
import {TextInput} from "../../../../../../../shared/components/atoms/input-text";
import {TextEditor} from "../../../../../../../shared/components/atoms/input-text-editor";
import {TextHtmlEditor} from "../../../../../../../shared/components/atoms/input-text-html-editor";
import {reactive, watch, ref} from "vue";
import {translationLanguagesQuery} from '../../../../../../../shared/api/queries/languages.js';
import {Label} from "../../../../../../../shared/components/atoms/label";
import {Toast} from "../../../../../../../shared/modules/toast";
import {Icon} from "../../../../../../../shared/components/atoms/icon";
import {createMediaProductThroughMutation, createVideosMutation} from "../../../../../../../shared/api/mutations/media";
import {processGraphQLErrors} from "../../../../../../../shared/utils";
import {AiContentGenerator} from "../../../../../../../shared/components/organisms/ai-content-generator";
import {AiContentTranslator} from "../../../../../../../shared/components/organisms/ai-content-translator";

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
const mutation = ref(null);
const translationId = ref(null);
const oldLang = ref(currentLanguage.value);
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

const setFormAndMutation = async (language) => {
  try {
    const {data} = await apolloClient.query({
      query: getProductTranslationByLanguageQuery,
      variables: {languageCode: language, productId: props.product.id},
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
    } else {
      form.name = '';
      form.shortDescription = '<p><br></p>';
      form.description = '<p><br></p>';
      form.urlKey = '';
      translationId.value = null;
      mutation.value = createProductTranslationMutation;
    }
    initialForm.value = {...form};
  } catch (error) {
    console.error("Error fetching translation:", error);
  }
};

watch(currentLanguage, async (newLanguage, oldLanguage) => {
  if (oldLanguage === null) {
    await setFormAndMutation(newLanguage);
    oldLang.value = newLanguage;
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
  await setFormAndMutation(newLanguage);
};


const getVariables = () => {
  const variables = {
    ...form,
    product: {id: props.product.id},
    language: currentLanguage.value
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
  ['bold'],
  [{ list: 'bullet' }],
  ['clean']
];

</script>

<template>
  <Flex between>
    <FlexCell class="w-3/4">
      <Flex vertical>
        <FlexCell>
          <Flex  class="gap-4">
            <FlexCell center>
              <Label semi-bold>{{ t('shared.labels.name') }}</Label>
            </FlexCell>
            <FlexCell v-if="currentLanguage !== null && currentLanguage !== 'en'" center>
              <AiContentTranslator
                :product="{ id: product.id }"
                productContentType="NAME"
                toTranslate=""
                fromLanguageCode="en"
                :toLanguageCode="currentLanguage"
                @translated="translatedText => form.name = translatedText"
              />
            </FlexCell>
            <FlexCell v-if="currentLanguage !== null && currentLanguage !== 'en'" center>
              <Icon name="gem" size="xl" class="text-purple-600"/>
            </FlexCell>
          </Flex>

          <TextInput v-model="form.name" :placeholder="t('products.translation.placeholders.name')"
                     class="mt-2 mb-4 w-full"/>
          <div class="mb-1 text-sm leading-6">
            <p class="text-red-500" v-if="fieldErrors['name']">{{ fieldErrors['name'] }}</p>
          </div>
        </FlexCell>

        <FlexCell>
          <Flex class="gap-4">
            <FlexCell center>
              <Label semi-bold>{{ t('shared.labels.shortDescription') }}</Label>
            </FlexCell>
            <FlexCell center>
                <AiContentGenerator
                  :productId="product.id"
                  :languageCode="currentLanguage"
                  contentAiGenerateType="SHORT_DESCRIPTION"
                  @generated="handleGeneratedShortDescriptionContent"
                />
            </FlexCell>
            <FlexCell v-if="currentLanguage !== null && currentLanguage !== 'en'" center>
              <AiContentTranslator
                :product="{ id: product.id }"
                productContentType="SHORT_DESCRIPTION"
                toTranslate=""
                fromLanguageCode="en"
                :toLanguageCode="currentLanguage"
                @translated="handleGeneratedShortDescriptionContent"
              />
            </FlexCell>
            <FlexCell center>
              <Icon name="gem" size="xl" class="text-purple-600"/>
            </FlexCell>
          </Flex>
          <div class="mt-4 mb-4">
            <TextHtmlEditor v-model="form.shortDescription" :toolbar-options="shortDescriptionToolbarOptions"
                            :placeholder="t('products.translation.placeholders.shortDescription')"
                            class="w-full" />
          </div>
          <div class="mb-1 text-sm leading-6">
            <p class="text-red-500" v-if="fieldErrors['shortDescription']">{{ fieldErrors['shortDescription'] }}</p>
          </div>
        </FlexCell>

        <FlexCell>
          <Flex class="gap-4">
            <FlexCell center>
              <Label semi-bold>{{ t('products.translation.labels.description') }}</Label>
            </FlexCell>
            <FlexCell center>
                <AiContentGenerator
                  :productId="product.id"
                  :languageCode="currentLanguage"
                  contentAiGenerateType="DESCRIPTION"
                  @generated="handleGeneratedDescriptionContent"
                />
            </FlexCell>
            <FlexCell v-if="currentLanguage !== null && currentLanguage !== 'en'" center>
              <AiContentTranslator
                :product="{ id: product.id }"
                productContentType="DESCRIPTION"
                toTranslate=""
                fromLanguageCode="en"
                :toLanguageCode="currentLanguage"
                @translated="handleGeneratedDescriptionContent"
              />
            </FlexCell>
            <FlexCell center>
              <Icon name="gem" size="xl" class="text-purple-600"/>
            </FlexCell>
          </Flex>
          <div class="mt-4 mb-4">
            <TextHtmlEditor v-model="form.description"
                            :placeholder="t('products.translation.placeholders.description')"
                            class="w-full" />
          </div>
          <div class="mb-1 text-sm leading-6">
            <p class="text-red-500" v-if="fieldErrors['description']">{{ fieldErrors['description'] }}</p>
          </div>
        </FlexCell>
        <FlexCell>
          <Label semi-bold>{{ t('products.translation.labels.urlKey') }}</Label>
          <TextInput v-model="form.urlKey" :placeholder="t('products.translation.placeholders.urlKey')" class="mt-2 w-full"/>
          <div class="mb-1 text-sm leading-6">
            <p class="text-red-500" v-if="fieldErrors['urlKey']">{{ fieldErrors['urlKey'] }}</p>
          </div>
        </FlexCell>
      </Flex>
    </FlexCell>

    <FlexCell>
      <Flex>
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
    </FlexCell>
  </Flex>
</template>