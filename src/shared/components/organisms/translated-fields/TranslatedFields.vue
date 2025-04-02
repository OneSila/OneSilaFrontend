<script setup lang="ts">
import { Icon } from "../../atoms/icon";
import {computed, onMounted, Ref, ref} from 'vue';
import apolloClient from "../../../../../apollo-client";
import {translationLanguagesQuery} from "../../../api/queries/languages.js";
import {TextInput} from "../../atoms/input-text";
import {CancelButton} from "../../atoms/button-cancel";
import {SecondaryButton} from "../../atoms/button-secondary";
import {PrimaryButton} from "../../atoms/button-primary";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import { processGraphQLErrors } from "../../../utils";
import { flagMapping } from "../../../utils/constants";

import {
  useEnterKeyboardListener,
  useShiftBackspaceKeyboardListener,
  useShiftDeleteKeyboardListener,
  useShiftEnterKeyboardListener,
} from "../../../modules/keyboard";
import {Toast} from "../../../modules/toast";
import {Url} from "../../../utils/constants";
import {AiContentTranslator} from "../ai-content-translator";

const router = useRouter();
const { t } = useI18n();
interface TranslatableField {
  id?: string;
  value: string;
  label: string;
  placeholder: string;
  fieldName: string;
  language: string;
  flag: string;
  error?: string | null;
  isCreate: boolean;
  isTranslatedField?: boolean;
}

const props = defineProps<{
  fieldName: string | string[];
  label: string | string[];
  placeholder: string | string[];
  query: any;
  queryKey: string;
  variables: any;
  createMutation: any;
  createMutationKey: string;
  editMutation: any;
  editMutationKey: string;
  backUrl: Url;
  relatedName: string;
  relatedId: string;
}>();
const translatableFields: Ref<TranslatableField[]> = ref([]);

const sourceTranslationField = computed(() => {
  return translatableFields.value.find(field => field.value && field.value.trim() !== '');
});


const createFields = (languages, fieldNames, labels, placeholders) => {
  const fields: TranslatableField[] = [];
  languages.forEach(language => {
    fieldNames.forEach((fieldName, index) => {
      fields.push({
        id: undefined,
        value: '',
        label: `${labels[index]} ${language.name}`,
        language: language.code,
        fieldName,
        flag: flagMapping[language.code] || '',
        isCreate: true,
        error: null,
        placeholder: placeholders[index] || '',
      });
    });
  });
  return fields;
};

const setValues = async () => {

  const { data } = await apolloClient.query({
    query: translationLanguagesQuery,
    fetchPolicy: 'network-only'
  });

  if (data && data.translationLanguages && data.translationLanguages.languages.length > 0) {
   const languages = data.translationLanguages.languages;

    const fieldNames = Array.isArray(props.fieldName) ? props.fieldName : [props.fieldName];
    const labels = Array.isArray(props.label) ? props.label : [props.label];
    const placeholders = Array.isArray(props.placeholder) ? props.placeholder : [props.placeholder];

    translatableFields.value = createFields(languages, fieldNames, labels, placeholders);
  }

   // Fetch translations
  const { data: translationData } = await apolloClient.query({
    query: props.query,
    variables: props.variables,
    fetchPolicy: 'network-only'
  });

  if (translationData && translationData[props.queryKey]) {
    translationData[props.queryKey].edges.forEach(edge => {
      const translation = edge.node;
      const field = translatableFields.value.find(f => f.language === translation.language);
      if (field) {
        field.value = translation[field.fieldName];
        field.isCreate = false;
        field.id = translation.id;
      }
    });
  }
}

const saveMutations = async (continueEditing = false) => {
  const errors: string[] = [];
  for (const field of translatableFields.value) {

    if (field.value == null || field.value == '') {
      continue;
    }


    const mutation = field.isCreate ? props.createMutation : props.editMutation;
    const mutationKey = field.isCreate ? props.createMutationKey : props.editMutationKey;
    let variables = {};

    if (field.isCreate) {
      variables = {
        data: {
            [props.relatedName]: { id: props.relatedId },
            [field.fieldName]: field.value,
            language: field.language
          }
        }
    } else {
      variables = {
        data: {
            id: field.id,
            [field.fieldName]: field.value,
          }
        }
    }

    try {
      const { data } = await apolloClient.mutate({ mutation, variables });
      const responseData = data[mutationKey];
      if (!responseData) {
        field.error = t('shared.alert.toast.unexpectedResult');
        errors.push(field.error);
        continue;
      }

      field.id = responseData.id;
      field.isCreate = false;
      field.error = null;
    } catch (error) {
      const validationErrors = processGraphQLErrors(error, t);
      field.error = validationErrors[field.fieldName] || validationErrors['__all__'];
      if (field.error) {
        errors.push(field.error);
      }
    }
  }

  if (errors.length === 0) {
    Toast.success(t('shared.alert.toast.submitSuccessUpdate'));
    if (!continueEditing) {
      router.push(props.backUrl);
    }
  }
};

onMounted(setValues);

const updateValue = (index: number, newValue: string) => {
  translatableFields.value[index].value = newValue;
};

const handleSave = () => saveMutations(false);
const handleSaveAndContinue = () => saveMutations(true);

useShiftDeleteKeyboardListener(() => {});
useShiftEnterKeyboardListener(handleSaveAndContinue);
useEnterKeyboardListener(handleSave);
useShiftBackspaceKeyboardListener(() => router.push(props.backUrl));

</script>

<template>
  <div class="space-y-10 divide-y divide-gray-900/10 mt-4">
    <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div class="px-4 py-6 sm:p-8">
          <div class="grid max-w grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
              <div class="col-span-full" v-for="(field, index) in translatableFields" :key="field.language">
          <Flex>
            <FlexCell center>
              <Flex gap="4">
                <FlexCell center>
                  <label class="font-semibold block text-sm leading-6 text-gray-900 mb-0">{{ field.label }}</label>
                </FlexCell>
                <FlexCell v-if="sourceTranslationField && field.language !== sourceTranslationField.language && field.value == ''" center>
                  <AiContentTranslator
                    :toTranslate="sourceTranslationField.value"
                    :fromLanguageCode="sourceTranslationField.language"
                    :toLanguageCode="field.language"
                    @translated="(translatedText) => field.value = translatedText"
                  />
                </FlexCell>
              </Flex>

            </FlexCell>
            <FlexCell center>
              <div v-if="field.error" class="text-danger text-small blink-animation ml-1 mb-1">
                <Icon size="sm" name="exclamation-circle" />
                <span class="ml-1">{{ field.error }}</span>
              </div>
            </FlexCell>
          </Flex>
          <div class="mt-2" >
            <TextInput
              class="w-full"
              @update:model-value="updateValue(index, $event)"
              :model-value="field.value"
              :prepend="field.flag"
              :placeholder="field.placeholder"
            />
          </div>

        </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <CancelButton @click="() => router.push(props.backUrl)">
            {{ t('shared.button.cancel') }}
          </CancelButton>
          <SecondaryButton @click="handleSaveAndContinue">
            {{ t('shared.button.saveAndContinue') }}
          </SecondaryButton>
          <PrimaryButton @click="handleSave">
            {{ t('shared.button.save') }}
          </PrimaryButton>
        </div>
      </div>
    </div>
  </div>
</template>
