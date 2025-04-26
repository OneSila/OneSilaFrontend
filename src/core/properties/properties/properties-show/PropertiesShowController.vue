<script setup lang="ts">
import { useI18n} from 'vue-i18n';
import { useRoute, useRouter} from "vue-router";
import { ref} from "vue";
import {GeneralShow} from "../../../../shared/components/organisms/general-show";
import {Breadcrumbs} from "../../../../shared/components/molecules/breadcrumbs";
import {Card} from "../../../../shared/components/atoms/card";
import { showConfigConstructor } from "../configs";
import { Tabs} from "../../../../shared/components/molecules/tabs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {FieldType, flagMapping, PropertyTypes} from "../../../../shared/utils/constants";
import ProductList from "./containers/products-list/ProductsList.vue"
import ValuesList from "./containers/values-list/ValuesList.vue"
import {Loader} from "../../../../shared/components/atoms/loader";
import RulesList from "./containers/rules-list/RulesList.vue";
import {ShowField} from "../../../../shared/components/organisms/general-show/showConfig";
import {TextInput} from "../../../../shared/components/atoms/input-text";

interface TranslatableField {
  language: string;
  name: string;
}

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const tabItems = ref();
const showValues = ref(false);
const isProductType = ref(false);
const hasImage = ref(false);
const loading = ref(true);
const translatableFields = ref<TranslatableField[]>([]);

tabItems.value = [
    { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info', alwaysRender: true },
    { name: 'translations', label: t('shared.tabs.translations'), icon: 'language' },
    { name: 'products', label: t('products.title'), icon: 'box' },
    { name: 'configurators', label: t('properties.rule.title'), icon: 'cog' },
    { name: 'values', label: t('properties.values.title'), icon: 'sitemap' },
  ];

const showConfig = showConfigConstructor(t, id.value);

const onDataFetched = (data) => {

  showValues.value = data[showConfig.subscriptionKey].type === PropertyTypes.SELECT || data[showConfig.subscriptionKey].type === PropertyTypes.MULTISELECT;
  isProductType.value = data[showConfig.subscriptionKey].isProductType;
  translatableFields.value = data[showConfig.subscriptionKey].propertytranslationSet;

  if ([PropertyTypes.SELECT, PropertyTypes.MULTISELECT].includes(data[showConfig.subscriptionKey].type)) {
    const hasImageField =  {
      label: t('properties.properties.labels.hasImage'),
      name: 'hasImage',
      type: FieldType.Boolean
    } as ShowField;

    if (!showConfig.fields.some(f => f.name === 'hasImage')) {
      showConfig.fields.push(hasImageField);
    }

    if (data[showConfig.subscriptionKey].hasImage) {
      hasImage.value = true;
    }
  }

  if (!showValues.value) {
    const valuesTabIndex = tabItems.value.findIndex(tab => tab.name === 'values');
    if (valuesTabIndex !== -1) {
      tabItems.value.splice(valuesTabIndex, 1);
    }
  }

  if (isProductType.value) {
    const configuratorsTabIndex = tabItems.value.findIndex(tab => tab.name === 'configurators');
    if (configuratorsTabIndex !== -1) {
      tabItems.value.splice(configuratorsTabIndex, 1);
    }
  }

  loading.value = false;
};

</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'properties.properties.list' }, name: t('properties.title') },
                   { path: { name: 'properties.properties.show', params: { id: id } }, name: t('properties.properties.show.title') }]" />
    </template>

   <template v-slot:content>
      <Card>
        <Loader :loading="loading" />
        <Tabs :tabs="tabItems">
          <template v-slot:general>
            <GeneralShow :config="showConfig" @data-fetched="onDataFetched" />
          </template>
          <template v-slot:translations>
            <div class="w-full md:w-1/2 px-2 box-border" v-for="(field, index) in translatableFields" :key="field.language">
              <div class="mt-2">
                <TextInput class="w-full" :model-value="field.name" :prepend="flagMapping[field.language]" disabled />
              </div>
            </div>
          </template>
          <template v-slot:products>
             <ProductList :id="id" />
          </template>
          <template v-slot:configurators>
            <RulesList v-if="!isProductType" :id="id" :is-product-type="isProductType" />
          </template>
          <template v-slot:values>
            <ValuesList v-if="showValues && !loading" :id="id" :add-grid="hasImage" />
          </template>
        </Tabs>
      </Card>
   </template>
  </GeneralTemplate>
</template>