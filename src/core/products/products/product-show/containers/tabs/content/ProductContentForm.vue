<script setup lang="ts">
import { Label } from '../../../../../../../shared/components/atoms/label';
import { TextInput } from '../../../../../../../shared/components/atoms/input-text';
import { TextHtmlEditor } from '../../../../../../../shared/components/atoms/input-text-html-editor';
import { AiContentTranslator } from '../../../../../../../shared/components/organisms/ai-content-translator';
import { AiContentGenerator } from '../../../../../../../shared/components/organisms/ai-content-generator';
import { PropType, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ContentFieldLimitConfig } from './contentFieldRules';

const { t } = useI18n();

type CountedField = 'name' | 'subtitle' | 'shortDescription' | 'description';

const props = defineProps({
  form: {
    type: Object as PropType<{ name: string; subtitle: string; shortDescription: string; description: string; urlKey: string }>,
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
    type: [String, null] as unknown as PropType<string | null>,
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
  showSubtitle: {
    type: Boolean,
    default: false,
  },
  showUrlKey: {
    type: Boolean,
    default: true,
  },
  salesChannelType: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  salesChannelId: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  defaultLanguageCode: {
    type: String,
    default: 'en',
  },
  fieldLimits: {
    type: Object as PropType<ContentFieldLimitConfig>,
    default: () => ({}),
  },
});

const emit = defineEmits<{
  (e: 'description', val: string): void;
  (e: 'shortDescription', val: string): void;
}>();

const defaultLanguage = computed(() => props.defaultLanguageCode || 'en');

const stripHtmlTags = (value?: string | null) => {
  if (!value) return '';
  return value.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ');
};

const fieldCharacterCounts = computed<Record<CountedField, number>>(() => ({
  name: props.form?.name?.length || 0,
  subtitle: props.form?.subtitle?.length || 0,
  shortDescription: stripHtmlTags(props.form?.shortDescription || '').trim().length,
  description: stripHtmlTags(props.form?.description || '').trim().length,
}));

const getFieldLimit = (field: CountedField) => props.fieldLimits?.[field];
const hasFieldLimit = (field: CountedField) => typeof getFieldLimit(field) === 'number';
const getFieldCharacterCount = (field: CountedField) => fieldCharacterCounts.value[field] || 0;
const isFieldLimitExceeded = (field: CountedField) => {
  const limit = getFieldLimit(field);
  if (!limit) return false;
  return getFieldCharacterCount(field) > limit;
};
const getFieldCounterClass = (field: CountedField) =>
  isFieldLimitExceeded(field) ? 'text-red-500' : 'text-gray-400';
</script>

<template>
  <Flex vertical>
    <FlexCell>
      <Flex between class="gap-4">
        <FlexCell grow>
          <Flex class="gap-4">
            <FlexCell center>
              <Label semi-bold>{{ t('shared.labels.name') }}</Label>
            </FlexCell>
            <FlexCell v-if="currentLanguage !== null && currentLanguage !== defaultLanguage" center>
              <AiContentTranslator
                :product="{ id: productId }"
                productContentType="NAME"
                toTranslate=""
                :fromLanguageCode="defaultLanguage"
                :toLanguageCode="currentLanguage"
                :sales-channel-id="salesChannelId"
                @translated="val => form.name = val"
              />
            </FlexCell>
          </Flex>
        </FlexCell>
        <FlexCell v-if="hasFieldLimit('name')" center class="text-right">
          <span class="text-xs" :class="getFieldCounterClass('name')">
            {{ getFieldCharacterCount('name') }} / {{ getFieldLimit('name') }}
          </span>
        </FlexCell>
      </Flex>
      <TextInput v-model="form.name" :placeholder="t('products.translation.placeholders.name')"
                 class="mt-2 mb-4 w-full"/>
      <div class="mb-1 text-sm leading-6">
        <p class="text-red-500" v-if="fieldErrors['name']">{{ fieldErrors['name'] }}</p>
      </div>
    </FlexCell>

    <FlexCell v-if="showSubtitle">
      <Flex between class="gap-4">
        <FlexCell grow>
          <Flex class="gap-4">
            <FlexCell center>
              <Label semi-bold>{{ t('products.translation.labels.subtitle') }}</Label>
            </FlexCell>
            <FlexCell v-if="currentLanguage !== null && currentLanguage !== defaultLanguage" center>
              <AiContentTranslator
                :product="{ id: productId }"
                productContentType="SUBTITLE"
                toTranslate=""
                :fromLanguageCode="defaultLanguage"
                :toLanguageCode="currentLanguage"
                :sales-channel-id="salesChannelId"
                @translated="val => form.subtitle = val"
              />
            </FlexCell>
          </Flex>
        </FlexCell>
        <FlexCell v-if="hasFieldLimit('subtitle')" center class="text-right">
          <span class="text-xs" :class="getFieldCounterClass('subtitle')">
            {{ getFieldCharacterCount('subtitle') }} / {{ getFieldLimit('subtitle') }}
          </span>
        </FlexCell>
      </Flex>
      <TextInput v-model="form.subtitle" :placeholder="t('products.translation.placeholders.subtitle')"
                 class="mt-2 mb-4 w-full"/>
      <div class="mb-1 text-sm leading-6">
        <p class="text-red-500" v-if="fieldErrors['subtitle']">{{ fieldErrors['subtitle'] }}</p>
      </div>
    </FlexCell>

    <FlexCell v-if="$slots['bullet-points']">
      <slot name="bullet-points"></slot>
    </FlexCell>

    <FlexCell v-if="showShortDescription">
      <Flex between class="gap-4">
        <FlexCell grow>
          <Flex class="gap-4">
            <FlexCell center>
              <Label semi-bold>{{ t('shared.labels.shortDescription') }}</Label>
            </FlexCell>
            <FlexCell center>
              <AiContentGenerator
                :productId="productId"
                :languageCode="currentLanguage"
                contentAiGenerateType="SHORT_DESCRIPTION"
                :sales-channel-type="salesChannelType"
                @generated="val => emit('shortDescription', val)"
              />
            </FlexCell>
            <FlexCell v-if="currentLanguage !== null && currentLanguage !== defaultLanguage" center>
              <AiContentTranslator
                :product="{ id: productId }"
                productContentType="SHORT_DESCRIPTION"
                toTranslate=""
                :fromLanguageCode="defaultLanguage"
                :toLanguageCode="currentLanguage"
                :sales-channel-id="salesChannelId"
                @translated="val => emit('shortDescription', val)"
              />
            </FlexCell>
          </Flex>
        </FlexCell>
        <FlexCell v-if="hasFieldLimit('shortDescription')" center class="text-right">
          <span class="text-xs" :class="getFieldCounterClass('shortDescription')">
            {{ getFieldCharacterCount('shortDescription') }} / {{ getFieldLimit('shortDescription') }}
          </span>
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
      <Flex between class="gap-4">
        <FlexCell grow>
          <Flex class="gap-4">
            <FlexCell center>
              <Label semi-bold>{{ t('products.translation.labels.description') }}</Label>
            </FlexCell>
            <FlexCell center>
              <AiContentGenerator
                :productId="productId"
                :languageCode="currentLanguage"
                contentAiGenerateType="DESCRIPTION"
                :sales-channel-type="salesChannelType"
                @generated="val => emit('description', val)"
              />
            </FlexCell>
            <FlexCell v-if="currentLanguage !== null && currentLanguage !== defaultLanguage" center>
              <AiContentTranslator
                :product="{ id: productId }"
                productContentType="DESCRIPTION"
                toTranslate=""
                :fromLanguageCode="defaultLanguage"
                :toLanguageCode="currentLanguage"
                :sales-channel-id="salesChannelId"
                @translated="val => emit('description', val)"
              />
            </FlexCell>
          </Flex>
        </FlexCell>
        <FlexCell v-if="hasFieldLimit('description')" center class="text-right">
          <span class="text-xs" :class="getFieldCounterClass('description')">
            {{ getFieldCharacterCount('description') }} / {{ getFieldLimit('description') }}
          </span>
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
