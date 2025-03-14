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
      form.shortDescription = '';
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
};

const onError = (error) => {
  const validationErrors = processGraphQLErrors(error, t);
  for (const key in validationErrors) {
    if (validationErrors.hasOwnProperty(key)) {
      Toast.error(validationErrors[key]);
    }
  }
};

const onContentGenerated = async (data) => {
  form.description = data.data.generateProductAiContent.content
  Toast.success(
    t('products.translation.successfullyGenerated', { points: data.data.generateProductAiContent.points })
  );};

</script>

<template>
  <Flex between>
    <FlexCell class="w-3/4">
      <Flex vertical>
        <FlexCell>
          <Label semi-bold>{{ t('shared.labels.name') }}</Label>
          <TextInput v-model="form.name" :placeholder="t('products.translation.placeholders.name')"
                     class="mt-2 mb-4 w-full"/>
        </FlexCell>
        <FlexCell>
          <Label semi-bold>{{ t('shared.labels.shortDescription') }}</Label>
          <TextEditor v-model="form.shortDescription"
                      :placeholder="t('products.translation.placeholders.shortDescription')" scroll
                      class="mt-2 mb-4 h-32 w-full"/>
        </FlexCell>
        <FlexCell>
          <ApolloMutation :mutation="generateProductAiContentMutation"
                          :variables="{ data: { id: product.id, language: currentLanguage} }"
                          @done="onContentGenerated" @error="onError">
            <template v-slot="{ mutate, loading, error }">
              <Flex class="gap-4">
                <FlexCell center>
                  <Label semi-bold>{{ t('products.translation.labels.description') }}</Label>
                </FlexCell>
                <FlexCell center>
                  <Button class="btn btn-sm btn-outline-primary" @click="mutate()">
                    <template v-if="loading">
                      <span class="spinner" size="sm"/>
                    </template>
                    <template v-else>
                      {{ t('shared.button.generate') }}
                    </template>
                  </Button>

                </FlexCell>
                <FlexCell center>
                  <Icon name="gem" size="xl" class="text-purple-600"/>
                </FlexCell>
              </Flex>
              <div class="mt-4 mb-4">
                <TextHtmlEditor v-model="form.description"
                                :placeholder="t('products.translation.placeholders.description')"
                                :ai-generating="loading" class="w-full"/>
              </div>
            </template>
          </ApolloMutation>
        </FlexCell>
        <FlexCell>
          <Label semi-bold>{{ t('products.translation.labels.urlKey') }}</Label>
          <TextInput v-model="form.urlKey" :placeholder="t('products.translation.placeholders.urlKey')"
                     class="mt-2 w-full"/>
        </FlexCell>
      </Flex>
    </FlexCell>

    <FlexCell>
      <Flex>
        <FlexCell>
          <ApolloMutation v-if="mutation" :mutation="mutation" :variables="getVariables()" @done="onMutationCompleted">
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


<style scoped>

.spinner {
  width: 15px;
  height: 15px;
  border: 2px solid #1F2937;
  border-top: 2px solid #4343d9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>