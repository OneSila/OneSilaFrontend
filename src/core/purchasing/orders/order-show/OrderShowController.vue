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
const route = useRoute();
const id = ref(String(route.params.id));
const supplierId = ref();
const tabItems = ref();

tabItems.value = [
    { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info' },
    { name: 'items', label: t('shared.tabs.items'), icon: 'sitemap' },
  ];

const showConfig = showConfigConstructor(t,
    id.value,
    route.query.supplierId ? route.query.supplierId.toString() : null,
    route.query.source ? route.query.source.toString() : null,
);

const onDataFetched = (data) => {
  supplierId.value = data[showConfig.subscriptionKey].supplier.id;
  if (supplierId.value) {
    updateField(
        showConfig,
        'supplier',
        {
      clickable: true,
      clickUrl: { name: 'purchasing.suppliers.show', params: { id: supplierId.value } },
    });}
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
      <Card>
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