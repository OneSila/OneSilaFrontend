<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Selector } from '../../atoms/selector';
import { translationLanguagesQuery } from '../../../api/queries/languages.js';

const props = withDefaults(defineProps<{
  modelValue?: string | null;
  placeholder?: string;
  selectorClass?: string;
  mandatory?: boolean;
  filterable?: boolean;
  removable?: boolean;
}>(), {
  modelValue: null,
  selectorClass: 'w-full min-w-[12rem] sm:min-w-[14rem]',
  mandatory: true,
  filterable: true,
  removable: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void;
  (e: 'loaded', value: { languages: { code: string; name: string }[]; defaultLanguage: { code: string; name: string } | null }): void;
}>();

const { t } = useI18n();

const normalizeTranslationLanguages = (rawData: any) => {
  const normalized = {
    languages: rawData?.languages || [],
    defaultLanguage: rawData?.defaultLanguage || null,
  };

  emit('loaded', normalized);
  return normalized.languages;
};

const resolvedPlaceholder = computed(() => props.placeholder || t('products.translation.placeholders.language'));
</script>

<template>
  <ApolloQuery :query="translationLanguagesQuery" fetch-policy="cache-and-network">
    <template v-slot="{ result: { data } }">
      <Selector
        v-if="data?.translationLanguages"
        :model-value="modelValue"
        :options="normalizeTranslationLanguages(data.translationLanguages)"
        :removable="removable"
        :placeholder="resolvedPlaceholder"
        :class="selectorClass"
        labelBy="name"
        valueBy="code"
        :mandatory="mandatory"
        :filterable="filterable"
        @update:modelValue="(value) => emit('update:modelValue', value)"
      />
    </template>
  </ApolloQuery>
</template>
