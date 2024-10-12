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
import MovementsList from "./containers/movements-list/MovementsList.vue";

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const productId = ref(null);
const locationId = ref(null);
const tabItems = ref();

tabItems.value = [
    { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info' },
    { name: 'history', label: t('inventory.inventory.labels.movements'), icon: 'history' },
  ];

const showConfig = showConfigConstructor(t, id.value,);

const onDataFetched = (data) => {
  productId.value = data[showConfig.subscriptionKey].product.id;
  locationId.value = data[showConfig.subscriptionKey].inventorylocation.id;
};

</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'inventory.inventory.list' }, name: t('inventory.title') },
                   { path: { name: 'inventory.inventory.show', params: { id: id } }, name: t('inventory.inventory.title') }]" />
    </template>

   <template v-slot:content>
      <Card>
        <Tabs :tabs="tabItems">
          <template v-slot:general>
            <GeneralShow :config="showConfig" @data-fetched="onDataFetched" />
          </template>
          <template v-slot:history>
            <MovementsList v-if="productId && locationId" :product-id="productId" :location-id="locationId" />
          </template>
        </Tabs>
      </Card>
   </template>
  </GeneralTemplate>
</template>