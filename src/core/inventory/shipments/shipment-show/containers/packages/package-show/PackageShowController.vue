<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../shared/components/molecules/breadcrumbs";
import {GeneralShow} from "../../../../../../../shared/components/organisms/general-show";
import {Card} from "../../../../../../../shared/components/atoms/card";
import {Tabs} from "../../../../../../../shared/components/molecules/tabs";
import {showConfigConstructor} from "../configs";
import {packageItemsQuery} from "../../../../../../../shared/api/queries/inventory.js";
import {FieldType} from "../../../../../../../shared/utils/constants";
import {ListingConfig} from "../../../../../../../shared/components/organisms/general-listing/listingConfig";
import {GeneralListing} from "../../../../../../../shared/components/organisms/general-listing";
import {searchConfigConstructor} from "../../items/configs";

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const shipmentId = ref(String(route.params.shipmentId));

const tabItems = ref([
  { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info', alwaysRender: true },
  { name: 'items', label: t('shared.tabs.items'), icon: 'sitemap' },
]);

const showConfig = showConfigConstructor(t, id.value, shipmentId.value);

const listingConfig: ListingConfig = {
  headers: [t('shared.labels.product'), t('shared.labels.quantity')],
  fields: [
    {
      name: 'product',
      type: FieldType.NestedText,
      keys: ['name'],
    },
    {
      name: 'quantity',
      type: FieldType.Text,
    },
  ],
  identifierKey: 'id',
  addActions: false,
  addEdit: false,
  addShow: false,
  addDelete: false,
  addPagination: true,
};
const searchConfig = searchConfigConstructor();

</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'inventory.shipments.list' }, name: t('inventory.shipments.title') },
          { path: { name: 'inventory.shipments.show', params: { id: shipmentId } }, name: t('inventory.shipments.show.title') },
          { path: { name: 'inventory.packages.show', params: { shipmentId, id } }, name: t('inventory.packages.show.title') }
        ]"
      />
    </template>

    <template v-slot:content>
      <Card>
        <Tabs :tabs="tabItems">
          <template v-slot:general>
            <GeneralShow :config="showConfig" />
          </template>
          <template v-slot:items>
            <GeneralListing
              :config="listingConfig"
              :query="packageItemsQuery"
              :query-key="'packageitems'"
              :fixed-filter-variables="{ package: { id: { exact: id } } }"
              :search-config="searchConfig"
            />
          </template>
        </Tabs>
      </Card>
    </template>
  </GeneralTemplate>
</template>