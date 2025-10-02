<script setup lang="ts">
import { ref } from 'vue';
import debounce from 'lodash.debounce';
import { useI18n } from 'vue-i18n';
import { Selector } from "../../../../../../../shared/components/atoms/selector";
import { PrimaryButton } from "../../../../../../../shared/components/atoms/button-primary";
import { DangerButton } from "../../../../../../../shared/components/atoms/button-danger";
import { Product } from "../../../../configs";
import apolloClient from "../../../../../../../../apollo-client";
import { salesPriceListItemsQuery, salesPriceListsQuerySelector } from "../../../../../../../shared/api/queries/salesPrices.js";
import { createSalesPriceListItemMutation } from "../../../../../../../shared/api/mutations/salesPrices.js";
import { processGraphQLErrors } from "../../../../../../../shared/utils";
import { Toast } from "../../../../../../../shared/modules/toast";

interface PriceListOption {
  id: string;
  name: string;
}

const props = defineProps<{ product: Product }>();
const emit = defineEmits<{ (event: 'added'): void }>();

const { t } = useI18n();

const isFormVisible = ref(false);
const priceLists = ref<PriceListOption[]>([]);
const existingPriceListIds = ref<string[]>([]);
const selectedPriceListId = ref('');
const loading = ref(false);
const submitting = ref(false);
const search = ref('');

const cleanedData = (rawData: any): PriceListOption[] => {
  return rawData?.edges ? rawData.edges.map((edge: any) => edge.node) : [];
};

const fetchExistingPriceListIds = async () => {
  try {
    const { data } = await apolloClient.query({
      query: salesPriceListItemsQuery,
      variables: {
        filter: { product: { id: { exact: props.product.id } } },
        first: 100,
      },
      fetchPolicy: 'network-only',
    });

    if (data?.salesPriceListItems?.edges) {
      existingPriceListIds.value = data.salesPriceListItems.edges.map(
        (edge: any) => edge.node.salespricelist.id,
      );
    } else {
      existingPriceListIds.value = [];
    }
  } catch (error) {
    existingPriceListIds.value = [];
  }
};

const fetchPriceLists = async () => {
  loading.value = true;
  const filter: Record<string, any> = {
    NOT: { id: { inList: existingPriceListIds.value } },
  };

  if (search.value) {
    filter.search = search.value;
  }

  try {
    const { data } = await apolloClient.query({
      query: salesPriceListsQuerySelector,
      variables: { filter },
      fetchPolicy: 'network-only',
    });

    priceLists.value = cleanedData(data?.salesPriceLists);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  selectedPriceListId.value = '';
  search.value = '';
  priceLists.value = [];
  isFormVisible.value = false;
};

const handleAddClick = async () => {
  isFormVisible.value = true;
  await fetchExistingPriceListIds();
  await fetchPriceLists();
};

const handleSearch = debounce(async (value: string) => {
  search.value = value;
  await fetchPriceLists();
}, 300);

const handleSubmit = async () => {
  if (!selectedPriceListId.value) {
    return;
  }

  submitting.value = true;

  try {
    await apolloClient.mutate({
      mutation: createSalesPriceListItemMutation,
      variables: {
        data: {
          product: { id: props.product.id },
          salespricelist: { id: selectedPriceListId.value },
        },
      },
    });

    emit('added');
    resetForm();
  } catch (error) {
    const errors = processGraphQLErrors(error, t);

    if (errors['__all__']) {
      Toast.error(errors['__all__']);
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <Flex class="mb-4" gap="2">
    <template v-if="isFormVisible">
      <FlexCell grow>
        <div v-if="loading" class="flex items-center gap-2">
          <svg class="h-5 w-5 animate-spin text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ t('shared.messages.loading') }}</span>
        </div>
        <Selector
          v-else
          v-model="selectedPriceListId"
          :options="priceLists"
          label-by="name"
          value-by="id"
          :placeholder="t('products.products.priceLists.add.placeholder')"
          :removable="false"
          filterable
          class="min-w-96"
          @searched="handleSearch"
        />
      </FlexCell>
      <FlexCell>
        <PrimaryButton :disabled="submitting || !selectedPriceListId" type="button" @click="handleSubmit">
          {{ t('products.products.priceLists.add.select') }}
        </PrimaryButton>
      </FlexCell>
      <FlexCell>
        <DangerButton type="button" class="ml-2" @click="resetForm">
          {{ t('shared.button.cancel') }}
        </DangerButton>
      </FlexCell>
    </template>
    <FlexCell v-else>
      <PrimaryButton type="button" class="btn btn-primary" @click="handleAddClick">
        {{ t('shared.button.add') }}
      </PrimaryButton>
    </FlexCell>
  </Flex>
</template>
