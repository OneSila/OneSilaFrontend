<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralShow } from "../../../../shared/components/organisms/general-show";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../shared/components/atoms/card";
import { updateField } from "../../../../shared/components/organisms/general-show/showConfig";
import { showConfigConstructor } from "../configs";
import { Tabs } from "../../../../shared/components/molecules/tabs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import ProductList from "./containers/products-list/ProductsList.vue";
import { Loader } from "../../../../shared/components/atoms/loader";
import { Button } from "../../../../shared/components/atoms/button";
import { Modal } from "../../../../shared/components/atoms/modal";
import { TextInput } from "../../../../shared/components/atoms/input-text";
import { SecondaryButton } from "../../../../shared/components/atoms/button-secondary";
import { PrimaryButton } from "../../../../shared/components/atoms/button-primary";
import { Toast } from "../../../../shared/modules/toast";
import apolloClient from "../../../../../apollo-client";
import { duplicatePropertiesRuleMutation } from "../../../../shared/api/mutations/properties.js";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const id = ref(String(route.params.id));
const tabItems = ref();
const loading = ref(true);
const productTypeId = ref(null);
const ruleName = ref('');
const showDuplicateModal = ref(false);
const duplicateLoading = ref(false);

const openDuplicateModal = () => {
  ruleName.value = '';
  showDuplicateModal.value = true;
};

const closeDuplicateModal = () => {
  if (duplicateLoading.value) {
    return;
  }

  showDuplicateModal.value = false;
  ruleName.value = '';
};

const submitDuplicate = async () => {
  if (!ruleName.value.trim()) {
    Toast.error(t('properties.rule.duplicate.validation.nameRequired'));
    return;
  }

  duplicateLoading.value = true;

  try {
    const { data } = await apolloClient.mutate({
      mutation: duplicatePropertiesRuleMutation,
      variables: {
        name: ruleName.value.trim(),
        propertyRule: { id: id.value, salesChannel: null },
      },
      fetchPolicy: 'network-only',
    });

    const duplicatedId = data?.duplicatePropertiesRule?.id;
    if (duplicatedId) {
      showDuplicateModal.value = false;
      await router.push({ name: 'properties.rule.show', params: { id: duplicatedId } });
      return;
    }

    Toast.error(t('properties.rule.duplicate.error.failed'));
  } catch (error: any) {
    const graphQLError = error?.graphQLErrors?.[0]?.message;
    Toast.error(graphQLError || t('properties.rule.duplicate.error.failed'));
  } finally {
    duplicateLoading.value = false;
  }
};

tabItems.value = [
  { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info', alwaysRender: true },
  { name: 'products', label: t('products.title'), icon: 'box' },
];

const showConfig = showConfigConstructor(t, id.value);

const onDataFetched = (data) => {
  productTypeId.value = data[showConfig.subscriptionKey].productType.id;
  if (productTypeId.value) {
    updateField(
      showConfig,
      'productType',
      {
        clickable: true,
        clickUrl: { name: 'properties.values.show', params: { id: productTypeId.value } },
      });
  }
  loading.value = false;
};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[{ path: { name: 'properties.rule.list' }, name: t('properties.rule.title') },
                 { path: { name: 'properties.rule.show', params: { id: id } }, name: t('properties.rule.show.title') }]" />
    </template>

    <template v-slot:content>
      <Card>
        <Loader :loading="loading" />

        <Tabs :tabs="tabItems">
          <template v-slot:general>
            <GeneralShow :config="showConfig" @data-fetched="onDataFetched">
              <template v-slot:buttons>
                <Button class="btn btn-outline-primary" @click="openDuplicateModal">
                  {{ t('shared.button.duplicate') }}
                </Button>
              </template>
            </GeneralShow>
          </template>
          <template v-slot:products>
            <ProductList v-if="productTypeId" :id="productTypeId" />
          </template>
        </Tabs>
      </Card>
    </template>
  </GeneralTemplate>

  <Modal v-model="showDuplicateModal" @closed="closeDuplicateModal">
    <Card class="modal-content w-full max-w-lg">
      <h3 class="text-lg font-semibold mb-2">{{ t('properties.rule.duplicate.title') }}</h3>
      <p class="text-sm text-gray-600 mb-4">{{ t('properties.rule.duplicate.description') }}</p>

      <TextInput
        :model-value="ruleName"
        :disabled="duplicateLoading"
        :placeholder="t('properties.rule.duplicate.placeholder')"
        class="w-full"
        @update:modelValue="ruleName = String($event || '')"
      />

      <div class="flex justify-end gap-2 mt-6">
        <SecondaryButton :disabled="duplicateLoading" @click="closeDuplicateModal">
          {{ t('shared.button.cancel') }}
        </SecondaryButton>
        <PrimaryButton :loading="duplicateLoading" :disabled="duplicateLoading" @click="submitDuplicate">
          {{ t('shared.button.submit') }}
        </PrimaryButton>
      </div>
    </Card>
  </Modal>
</template>
