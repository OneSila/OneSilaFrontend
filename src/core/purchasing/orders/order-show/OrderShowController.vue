<script setup lang="ts">
import { useI18n} from 'vue-i18n';
import { useRoute, useRouter} from "vue-router";
import { ref} from "vue";
import {GeneralShow} from "../../../../shared/components/organisms/general-show";
import {Breadcrumbs} from "../../../../shared/components/molecules/breadcrumbs";
import {Card} from "../../../../shared/components/atoms/card";
import { updateField} from "../../../../shared/components/organisms/general-show/showConfig";
import { showConfigConstructor } from "../configs";
import { Tabs} from "../../../../shared/components/molecules/tabs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import ItemsList from "./containers/items-list/ItemsList.vue";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(route.params.id);
const supplierId = ref();
const tabItems = ref();

tabItems.value = [
    { name: 'general', label: t('purchasing.suppliers.tabs.general.title'), icon: 'circle-info' },
    { name: 'items', label: t('profile.tabs.tabs.products.title'), icon: 'sitemap' },
  ];

const showConfig = showConfigConstructor(t, id.value);

const onDataFetched = (data) => {
  supplierId.value = data[showConfig.subscriptionKey].supplier.id;
  if (supplierId.value) {
    updateField(
        showConfig,
        'supplier',
        {
      clickable: true,
      clickUrl: { name: 'purchasing.suppliers.show', params: { id: supplierId.value } },
    });
    showConfig.backUrl = { name: 'purchasing.suppliers.show', params: { id: supplierId.value }, query: {tab: 'orders'} }
  }
};
</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'purchasing.orders.list' }, name: t('purchasing.orders.title') },
                   { path: { name: 'purchasing.orders.show', params: { id: id } }, name: t('purchasing.orders.show.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2">
          <Tabs :tabs="tabItems">
            <template v-slot:general>
              <GeneralShow :config="showConfig" @data-fetched="onDataFetched" />
            </template>
            <template v-slot:items>
              <ItemsList :id="id" />
            </template>
          </Tabs>
      </Card>
   </template>
  </GeneralTemplate>
</template>