<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from "vue-router";
import { ref} from "vue";
import { GeneralShow } from "../../../../shared/components/organisms/general-show";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../shared/components/atoms/card";
import { updateField } from "../../../../shared/components/organisms/general-show/showConfig";
import { showConfigConstructor } from "../configs";
import { Tabs} from "../../../../shared/components/molecules/tabs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import { flagMapping } from "../../../../shared/utils/constants";
import ProductList from "./containers/products-list/ProductsList.vue"
import { Loader } from "../../../../shared/components/atoms/loader";
import RulesList from "./containers/rules-list/RulesList.vue";
import { TextInput } from "../../../../shared/components/atoms/input-text";
import PropertySelectValueMerge from './PropertySelectValueMerge.vue';
import IntegrationsList from "./containers/integrations-list/IntegrationsList.vue";

interface TranslatableField {
  language: string;
  value: string;
}

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const tabItems = ref();
const isProductType = ref(false);
const loading = ref(true);
const translatableFields = ref<TranslatableField[]>([]);
const propertyId = ref('');
const currentLabel = ref('');

tabItems.value = [
    { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info', alwaysRender: true },
    { name: 'translations', label: t('shared.tabs.translations'), icon: 'language' },
    { name: 'products', label: t('products.title'), icon: 'box' },
    { name: 'configurators', label: t('properties.rule.title'), icon: 'cog' },
    { name: 'integrations', label: t('properties.integrations.title'), icon: 'globe' },
  ];

const showConfig = showConfigConstructor(t, id.value);

const onDataFetched = (data) => {
  const propId = data[showConfig.subscriptionKey].property.id;
  propertyId.value = propId;
  isProductType.value = data[showConfig.subscriptionKey].property.isProductType;
  translatableFields.value = data[showConfig.subscriptionKey].propertyselectvaluetranslationSet;
  currentLabel.value = data[showConfig.subscriptionKey].value;


  if (!isProductType.value) {
    const configuratorsTabIndex = tabItems.value.findIndex(tab => tab.name === 'configurators');
    if (configuratorsTabIndex !== -1) {
      tabItems.value.splice(configuratorsTabIndex, 1);
    }
  }

  if (propId) {
    updateField(
        showConfig,
        'property',
        {
          clickable: true,
          clickUrl: { name: 'properties.properties.show', params: { id: propId } },
    });
  }
  loading.value = false;
};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'properties.values.list' }, name: t('properties.values.title') },
                   { path: { name: 'properties.values.show', params: { id: id } }, name: t('properties.values.show.title') }]" />
    </template>

   <template v-slot:content>
      <Card>
        <Loader :loading="loading" />
        <Tabs :tabs="tabItems">
          <template v-slot:general>
            <GeneralShow :config="showConfig" @data-fetched="onDataFetched">
              <template #buttons>
                <PropertySelectValueMerge :id="id" :property-id="propertyId" :current-label="currentLabel" />
              </template>
            </GeneralShow>
          </template>
          <template v-slot:translations>
            <div class="w-full md:w-1/2 px-2 box-border" v-for="(field, index) in translatableFields" :key="field.language">
              <div class="mt-2">
                <TextInput class="w-full" :model-value="field.value" :prepend="flagMapping[field.language]" disabled />
              </div>
            </div>
          </template>
          <template v-slot:products>
             <ProductList :id="id" />
          </template>
          <template v-slot:configurators>
            <RulesList v-if="isProductType" :id="id" />
          </template>
          <template v-slot:integrations>
            <IntegrationsList v-if="!loading" :id="id" />
          </template>
        </Tabs>
      </Card>
   </template>
  </GeneralTemplate>
</template>
