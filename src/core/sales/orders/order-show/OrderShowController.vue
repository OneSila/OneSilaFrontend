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
import ItemsList from "./containers/items/items-list/ItemsList.vue";
import NotesList from "./containers/notes/notes-list/NotesList.vue";
import {BackendLink} from "../../../../shared/components/atoms/backend-link";
import {CancelButton} from "../../../../shared/components/atoms/button-cancel";
import ShippingsList from "./containers/shipments/shipments-list/ShippingsList.vue";

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const tabItems = ref();

tabItems.value = [
    { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info', alwaysRender: true },
    { name: 'items', label: t('shared.tabs.items'), icon: 'sitemap' },
    { name: 'notes', label: t('shared.labels.notes'), icon: 'note-sticky' },
    { name: 'shippings', label: t('shared.tabs.shippings'), icon: 'truck' },
  ];

const customerId = route.query.customerId ? route.query.customerId.toString() : null;

const showConfig = showConfigConstructor(
    t,
    id.value,
    customerId,
    route.query.productId ? route.query.productId.toString() : null,
    route.query.source ? route.query.source.toString() : null,
);

const onDataFetched = (data) => {
  const customerDataId = data[showConfig.subscriptionKey].customer.id;
  if (customerDataId) {
    updateField(
        showConfig,
        'customer',
        {
      clickable: true,
      clickUrl: { name: 'sales.customers.show', params: { id: customerDataId } },
    });}
};

</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'sales.orders.list' }, name: t('sales.orders.title') },
                   { path: { name: 'sales.orders.show', params: {id: id} }, name: t('sales.orders.show.title') }]" />
    </template>

   <template v-slot:content>
      <Card>
        <Tabs :tabs="tabItems">
          <template v-slot:general>
            <GeneralShow :config="showConfig" @data-fetched="onDataFetched" >
              <template v-slot:buttons>
                <BackendLink :path="`/sales/orders/${id}/confirmation/`" target="_blank">
                  <CancelButton>
                    {{ t('shared.button.downloadConfirmation') }}
                  </CancelButton>
                </BackendLink>
              </template>
            </GeneralShow>
          </template>
          <template v-slot:items>
            <ItemsList :id="id" />
          </template>
          <template v-slot:notes>
            <NotesList :id="id" />
          </template>
          <template v-slot:shippings>
            <ShippingsList :id="id" />
          </template>
        </Tabs>
      </Card>
   </template>
  </GeneralTemplate>
</template>