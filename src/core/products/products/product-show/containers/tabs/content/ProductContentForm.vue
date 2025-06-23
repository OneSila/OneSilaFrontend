<script setup lang="ts">
import { Label } from '../../../../../../../shared/components/atoms/label';
import { TextInput } from '../../../../../../../shared/components/atoms/input-text';
import { TextHtmlEditor } from '../../../../../../../shared/components/atoms/input-text-html-editor';
import { AiContentTranslator } from '../../../../../../../shared/components/organisms/ai-content-translator';
import { AiContentGenerator } from '../../../../../../../shared/components/organisms/ai-content-generator';
import { PropType } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  form: {
    type: Object as PropType<{ name: string; shortDescription: string; description: string; urlKey: string }>,
    required: true,
  },
  fieldErrors: {
    type: Object as PropType<Record<string, string>>,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  currentLanguage: {
    type: String as PropType<string | null>,
    required: true,
  },
  shortDescriptionToolbarOptions: {
    type: Array as PropType<any[]>,
    required: true,
  },
  showShortDescription: {
    type: Boolean,
    default: true,
  },
  showUrlKey: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits<{
  (e: 'description', val: string): void;
  (e: 'shortDescription', val: string): void;
}>();
</script>

<template>
  <Flex vertical>
    <FlexCell v-if="showShortDescription">
      <Flex  class="gap-4">
        <FlexCell center>
          <Label semi-bold>{{ t('shared.labels.name') }}</Label>
        </FlexCell>
        <FlexCell v-if="currentLanguage !== null && currentLanguage !== 'en'" center>
          <AiContentTranslator
            :product="{ id: productId }"
            productContentType="NAME"
            toTranslate=""
            fromLanguageCode="en"
            :toLanguageCode="currentLanguage"
            @translated="val => form.name = val"
          />
        </FlexCell>
      </Flex>
      <TextInput v-model="form.name" :placeholder="t('products.translation.placeholders.name')"
                 class="mt-2 mb-4 w-full"/>
      <div class="mb-1 text-sm leading-6">
        <p class="text-red-500" v-if="fieldErrors['name']">{{ fieldErrors['name'] }}</p>
      </div>
    </FlexCell>

    <FlexCell v-if="showShortDescription">
      <Flex class="gap-4">
        <FlexCell center>
          <Label semi-bold>{{ t('shared.labels.shortDescription') }}</Label>
        </FlexCell>
        <FlexCell center>
            <AiContentGenerator
              :productId="productId"
              :languageCode="currentLanguage"
              contentAiGenerateType="SHORT_DESCRIPTION"
              @generated="val => emit('shortDescription', val)"
            />
        </FlexCell>
        <FlexCell v-if="currentLanguage !== null && currentLanguage !== 'en'" center>
          <AiContentTranslator
            :product="{ id: productId }"
            productContentType="SHORT_DESCRIPTION"
            toTranslate=""
            fromLanguageCode="en"
            :toLanguageCode="currentLanguage"
            @translated="val => emit('shortDescription', val)"
          />
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
              :productId="productId"
              :languageCode="currentLanguage"
              contentAiGenerateType="DESCRIPTION"
              @generated="val => emit('description', val)"
            />
        </FlexCell>
        <FlexCell v-if="currentLanguage !== null && currentLanguage !== 'en'" center>
          <AiContentTranslator
            :product="{ id: productId }"
            productContentType="DESCRIPTION"
            toTranslate=""
            fromLanguageCode="en"
            :toLanguageCode="currentLanguage"
            @translated="val => emit('description', val)"
          />
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
    <FlexCell v-if="showUrlKey">
      <Label semi-bold>{{ t('products.translation.labels.urlKey') }}</Label>
      <TextInput v-model="form.urlKey" :placeholder="t('products.translation.placeholders.urlKey')" class="mt-2 w-full"/>
      <div class="mb-1 text-sm leading-6">
        <p class="text-red-500" v-if="fieldErrors['urlKey']">{{ fieldErrors['urlKey'] }}</p>
      </div>
    </FlexCell>
  </Flex>
</template>
