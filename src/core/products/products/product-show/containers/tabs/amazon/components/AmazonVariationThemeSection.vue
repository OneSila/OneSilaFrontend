<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Selector } from '../../../../../../../../shared/components/atoms/selector';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { LocalLoader } from '../../../../../../../../shared/components/atoms/local-loader';
import apolloClient from '../../../../../../../../../apollo-client';
import { Toast } from '../../../../../../../../shared/modules/toast';
import { displayApolloError } from '../../../../../../../../shared/utils';
import { amazonProductTypesQuery } from '../../../../../../../../shared/api/queries/salesChannels.js';
import { amazonVariationThemesQuery } from '../../../../../../../../shared/api/queries/amazonVariationThemes.js';
import {
  createAmazonVariationThemeMutation,
  updateAmazonVariationThemeMutation,
  deleteAmazonVariationThemeMutation,
} from '../../../../../../../../shared/api/mutations/amazonVariationThemes.js';

const props = defineProps<{ product: any; view: any | null }>();
const { t } = useI18n();

const loading = ref(false);
const saving = ref(false);
const themeOptions = ref<{ id: string; name: string }[]>([]);
const selectedTheme = ref<string | null>(null);
const originalTheme = ref<string | null>(null);
const recordId = ref<string | null>(null);

const productTypeRuleId = computed(() => {
  const typeProp = props.product?.productpropertySet?.find((p: any) => p.property?.isProductType);
  return typeProp?.valueSelect?.productpropertiesruleSet?.[0]?.id || null;
});

const fetchOptions = async () => {
  if (!productTypeRuleId.value) {
    themeOptions.value = [];
    return;
  }
  const { data } = await apolloClient.query({
    query: amazonProductTypesQuery,
    variables: { filter: { localInstance: { id: { exact: productTypeRuleId.value } } } },
    fetchPolicy: 'network-only',
  });
  const node = data?.amazonProductTypes?.edges?.[0]?.node;
  const themes: string[] = node?.variationThemes || [];
  themeOptions.value = themes.map((t: string) => ({ id: t, name: t }));
};

const fetchCurrent = async () => {
  if (!props.view?.id) {
    selectedTheme.value = null;
    originalTheme.value = null;
    recordId.value = null;
    return;
  }
  const { data } = await apolloClient.query({
    query: amazonVariationThemesQuery,
    variables: {
      filter: {
        product: { id: { exact: props.product.id } },
        view: { id: { exact: props.view.id } },
      },
    },
    fetchPolicy: 'network-only',
  });
  const node = data?.amazonVariationThemes?.edges?.[0]?.node;
  recordId.value = node?.id || null;
  selectedTheme.value = node?.theme || null;
  originalTheme.value = selectedTheme.value;
};

watch(
  () => [props.view?.id, productTypeRuleId.value],
  async () => {
    loading.value = true;
    try {
      await fetchOptions();
      await fetchCurrent();
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);

const hasChanges = computed(() => selectedTheme.value !== originalTheme.value);

const save = async () => {
  if (!hasChanges.value) return;
  saving.value = true;
  try {
    if (recordId.value) {
      if (selectedTheme.value) {
        await apolloClient.mutate({
          mutation: updateAmazonVariationThemeMutation,
          variables: { data: { id: recordId.value, theme: selectedTheme.value } },
        });
        originalTheme.value = selectedTheme.value;
        Toast.success(t('shared.alerts.saveSuccess'));
      } else {
        await apolloClient.mutate({
          mutation: deleteAmazonVariationThemeMutation,
          variables: { id: recordId.value },
        });
        recordId.value = null;
        originalTheme.value = null;
        Toast.success(t('shared.alerts.deleteSuccess'));
      }
    } else if (selectedTheme.value && props.view) {
      const res = await apolloClient.mutate({
        mutation: createAmazonVariationThemeMutation,
        variables: {
          data: {
            product: { id: props.product.id },
            view: { id: props.view.id },
            theme: selectedTheme.value,
          },
        },
      });
      recordId.value = res.data?.createAmazonVariationTheme?.id || null;
      originalTheme.value = selectedTheme.value;
      Toast.success(t('shared.alerts.saveSuccess'));
    }
  } catch (error) {
    displayApolloError(error);
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div>
    <h4 class="font-semibold mb-2">{{ t('products.products.amazon.variationTheme') }}</h4>
    <p class="text-xs text-gray-500 mb-2">{{ t('products.products.amazon.variationThemeDescription') }}</p>
    <LocalLoader :loading="loading" />
    <Flex v-if="!loading" gap="2" middle>
      <FlexCell class="min-w-96">
        <Selector
          class="w-72"
          :options="themeOptions"
          v-model="selectedTheme"
          label-by="name"
          value-by="id"
          :filterable="false"
          :placeholder="t('shared.placeholders.select')"
        />
      </FlexCell>
      <FlexCell>
        <Button class="btn btn-sm btn-primary" :disabled="!hasChanges || saving" @click="save">
        {{ t('shared.button.save') }}
      </Button>
      </FlexCell>
    </Flex>
  </div>
</template>
