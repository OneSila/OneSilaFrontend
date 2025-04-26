<script setup lang="ts">

import { onMounted, ref, computed, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from "../../atoms/icon"
import { injectAuth } from "../../../modules/auth"
import apolloClient from "../../../../../apollo-client"
import { companyLanguagesQuery } from "../../../api/queries/languages.js"
import { Label } from "../../atoms/label"
import { Selector } from "../../atoms/selector"
import { Toast } from "../../../modules/toast";
import { processGraphQLErrors } from "../../../utils";
import { bulkTranslateAiContentMutation } from "../../../api/mutations/llm.js"
import {Checkbox} from "../../atoms/checkbox";

const props = defineProps<{
  type: 'products' | 'properties' | 'values'
  selectedEntities: string[]
}>()

const emit = defineEmits<{
  (e: 'started'): void
}>()

const { t } = useI18n()
const auth = injectAuth()

const showTranslate = ref(false)
const panelRef = ref<HTMLElement | null>(null);
const overrideTranslation = ref(false);

onMounted(() => {
  document.addEventListener('click', handleGlobalClick, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick, true)
})

const handleGlobalClick = (event: MouseEvent) => {
  const clickedEl = event.target as HTMLElement;

  const clickedInsidePanel = panelRef.value?.contains(clickedEl);
  const clickedInsideSelectorDropdown = !!clickedEl.closest('.vs__dropdown-menu');

  if (!clickedInsidePanel && !clickedInsideSelectorDropdown) {
    showTranslate.value = false;
  }
}


const languages = ref<{ label: string; value: string }[]>([])
const sourceLanguage = ref<string | null>(null)
const targetLanguages = ref<string[]>([])

const fetchLanguages = async () => {
  const { data } = await apolloClient.query({ query: companyLanguagesQuery })

  if (data?.companyLanguages) {
    languages.value = data.companyLanguages.map(lang => ({
      label: lang.name,
      value: lang.code
    }))

    const company = auth?.user?.company as { language?: string } | null;
    const defaultLang = data.companyLanguages.find(
      lang => lang.code === company?.language
    );

    if (defaultLang) {
      sourceLanguage.value = defaultLang.code
    }
  }
}

// Exclude the source language from target options
const targetLanguageOptions = computed(() =>
  languages.value.filter(lang => lang.value !== sourceLanguage.value)
)

watch(sourceLanguage, (newSource) => {
  if (!newSource) return

  targetLanguages.value = targetLanguages.value.filter(lang => lang !== newSource)
})

onMounted(fetchLanguages)


const onCompleted = (data: any) => {
  const response = data?.data?.['bulkTranslateAiContent'];

  if (!response || response.success === false) {
    Toast.error(t('shared.components.organisms.aiBulkTranslator.error.general'));
    return;
  }

  Toast.success(t('shared.components.organisms.aiBulkTranslator.startedToast'));

  showTranslate.value = false;
  sourceLanguage.value = null;
  targetLanguages.value = [];

  emit('started');
};


const onError = (error: any) => {
  const validationErrors = processGraphQLErrors(error, t);

  if (Object.keys(validationErrors).length > 0) {
    for (const key in validationErrors) {
      if (validationErrors.hasOwnProperty(key)) {
        Toast.error(validationErrors[key]);
      }
    }
  } else {
    Toast.error(t('shared.components.organisms.aiBulkTranslator.error.general'));
  }
};

const startTranslation = (mutate: () => void) => {
  if (!sourceLanguage.value || targetLanguages.value.length === 0) {
    Toast.error(t('shared.components.organisms.aiBulkTranslator.error.missingLanguages'));
    return;
  }

  mutate();
};

const getVariables = () => {
  const data: any = {
    fromLanguageCode: sourceLanguage.value,
    toLanguageCodes: targetLanguages.value,
    overrideTranslation: overrideTranslation.value,
  };

  data[props.type] = props.selectedEntities.map(id => ({ id }));

  return { data };
};


</script>


<template>
  <div class="relative inline-block text-right">
    <button
      type="button"
      @click="showTranslate = !showTranslate"
      class="inline-flex items-center rounded bg-purple-50 px-4 py-1 text-sm font-semibold text-purple-800 shadow-sm ring-1 ring-inset ring-purple-300 hover:bg-purple-100"
    >
      <Icon name="gem" size="sm" class="text-purple-600 mr-2" />
      {{ t('shared.components.organisms.aiBulkTranslator.button') }}
    </button>

    <div ref="panelRef"  v-if="showTranslate" class="absolute z-[10] mt-2 left-0 rounded-xl bg-white shadow-lg border border-gray-200 p-4">
    <div class="flex justify-between items-start mb-4 border-b border-gray-200 pb-4">
      <h3 class="text-sm font-semibold text-gray-800 flex items-center">
        <Icon name="globe" size="sm" class="text-purple-600 mr-2" />
        {{ t('shared.components.organisms.aiBulkTranslator.title', {
          count: props.selectedEntities.length,
          type: t(`shared.components.organisms.aiBulkTranslator.types.${props.type}`)
        }) }}
      </h3>
      <button
        class="text-gray-400 hover:text-gray-600 ml-auto"
        @click="showTranslate = false"
      >
        <Icon name="x" size="sm" />
      </button>
    </div>


      <div class="text-xs text-gray-600 leading-snug w-full">

        <Flex class="mb-4">
          <Checkbox
              v-model="overrideTranslation"
              name="overrideTranslation"
              class="text-sm text-black"
          >
            {{ t('shared.components.organisms.aiBulkTranslator.overrideCheckbox') }}
          </Checkbox>
        </Flex>


        <Flex gap="4">
          <FlexCell>
            <Flex vertical>
              <Label class="block font-semibold text-sm text-gray-700 mb-1 text-left">
                {{ t('shared.components.organisms.aiBulkTranslator.sourceLanguage') }}
              </Label>

              <FlexCell>
                <Selector
                  ref="selector1Ref"
                  v-model="sourceLanguage"
                  :options="languages"
                  label-by="label"
                  value-by="value"
                />
              </FlexCell>
            </Flex>
          </FlexCell>

          <FlexCell center>
            <div class="rounded-full w-8 h-8 flex items-center justify-center bg-gray-100 border border-gray-300 mt-4">
              <Icon name="angles-right" size="sm" class="text-gray-700" />
            </div>
          </FlexCell>

          <FlexCell class="w-40">
            <div class="w-full">
              <Label class="block font-semibold text-sm text-gray-700 mb-1 text-left w-full">
                {{ t('shared.components.organisms.aiBulkTranslator.targetLanguages') }}
              </Label>
              <Selector
                ref="selector2Ref"
                v-model="targetLanguages"
                :options="targetLanguageOptions"
                label-by="label"
                value-by="value"
                multiple
                class="w-full"
              />
            </div>
          </FlexCell>

        </Flex>

      </div>

      <div class="mt-4 pt-4 border-t border-gray-200">
        <ApolloMutation
            :mutation="bulkTranslateAiContentMutation"
            :variables="getVariables()"
            @done="onCompleted"
            @error="onError">

          <template v-slot="{ mutate, loading, error }">
            <button
                class="w-full text-center bg-purple-600 text-white py-1.5 rounded hover:bg-purple-700 text-sm font-medium"
                @click="startTranslation(mutate)"
            >
              {{ t('shared.components.organisms.aiBulkTranslator.startButton') }}
            </button>
          </template>
        </ApolloMutation>
      </div>

    </div>
  </div>
</template>
