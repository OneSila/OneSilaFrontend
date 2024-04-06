<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import {Product} from "../../../../configs";
import {Button} from "../../../../../../../shared/components/atoms/button";
import TabContentTemplate from "../TabContentTemplate.vue";
import apolloClient from "../../../../../../../../apollo-client";
import {getProductTranslationByLanguageQuery} from "../../../../../../../shared/api/queries/products.js";
import {updateProductTranslationMutation, createProductTranslationMutation} from "../../../../../../../shared/api/mutations/products.js";
import {Selector} from "../../../../../../../shared/components/atoms/selector";
import {TextInput} from "../../../../../../../shared/components/atoms/input-text";
import {TextEditor} from "../../../../../../../shared/components/atoms/input-text-editor";
import {reactive, watch, ref} from "vue";
import { translationLanguagesQuery } from '../../../../../../../shared/api/queries/languages.js';
import { Label } from "../../../../../../../shared/components/atoms/label";
import { Toast } from "../../../../../../../shared/modules/toast";
import {FormConfig} from "../../../../../../../shared/components/organisms/general-form/formConfig";

const { t } = useI18n();
const props = defineProps<{ product: Product }>();

const initialForm = ref({
  name: '',
  shortDescription: '',
  description: '',
  urlKey: ''
});

const form = reactive({ ...initialForm.value });
const currentLanguage = ref(null);
const mutation = ref(null);
const translationId = ref(null);
const oldLang = ref(currentLanguage.value);
const cleanedData = (rawData) => {
  if (rawData && rawData.length > 0) {

    if (currentLanguage.value === null) {
      currentLanguage.value = rawData[0].code;
    }
    return rawData;
  }
  return [];
};

const setFormAndMutation = async (language) => {
  try {
    const { data } = await apolloClient.query({
      query: getProductTranslationByLanguageQuery,
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
    } else {
      form.name = '';
      form.shortDescription = '';
      form.description = '';
      form.urlKey = '';
      translationId.value = null;
      mutation.value = createProductTranslationMutation;
    }
    initialForm.value = { ...form };
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
    product: { id: props.product.id },
    language: currentLanguage.value
  };

  if (translationId.value) {
    variables['id'] = translationId.value;
  }

  return {data: variables};
};

const onMutationCompleted = () => {
  Toast.success(t('products.translation.successfullyUpdated'));
  initialForm.value = { ...form };
};

</script>

<template>
  <Flex between>
  <FlexCell class=" w-3/4">
    <Flex vertical>
      <FlexCell>
        <Label semi-bold>{{ t('shared.labels.name') }}</Label>
        <TextInput v-model="form.name" :placeholder="t('products.translation.placeholders.name')" class="mt-2 mb-2 w-full" />
      </FlexCell>
      <FlexCell>
        <Label semi-bold>{{ t('shared.labels.shortDescription') }}</Label>
        <TextEditor v-model="form.shortDescription" :placeholder="t('products.translation.placeholders.shortDescription')" scroll class="mt-2 mb-2 h-32 w-full" />
      </FlexCell>
      <FlexCell>
        <Label semi-bold>{{ t('products.translation.labels.description') }}</Label>
        <TextEditor v-model="form.description" :placeholder="t('products.translation.placeholders.description')" scroll class="mt-2 mb-2 h-32 w-full" />
      </FlexCell>
      <FlexCell>
        <Label semi-bold>{{ t('products.translation.labels.urlKey') }}</Label>
        <TextInput v-model="form.urlKey" :placeholder="t('products.translation.placeholders.urlKey')" class="mt-2 w-full" />
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
        <p v-if="error">{{ error.message }}</p>
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
                  class="min-w-[100px]"
                  labelBy="name"
                  valueBy="code"
                  mandatory
                  filterable />
      </template>
    </ApolloQuery>
      </FlexCell>
    </Flex>


  </FlexCell>
</Flex>

</template>