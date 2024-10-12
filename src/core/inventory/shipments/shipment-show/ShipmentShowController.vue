<script setup lang="ts">
import { useI18n} from 'vue-i18n';
import { useRoute} from "vue-router";
import { ref} from "vue";
import {GeneralShow} from "../../../../shared/components/organisms/general-show";
import {Breadcrumbs} from "../../../../shared/components/molecules/breadcrumbs";
import {Card} from "../../../../shared/components/atoms/card";
import { showConfigConstructor } from "../configs";
import { Tabs} from "../../../../shared/components/molecules/tabs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {BackendLink} from "../../../../shared/components/atoms/backend-link";
import {CancelButton} from "../../../../shared/components/atoms/button-cancel";
import ItemsList from "./containers/items/items-list/ItemsList.vue";
import PackagesList from "./containers/packages/packages-list/PackagesList.vue";
import {ApolloSubscription} from "../../../../shared/components/molecules/apollo-subscription";

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const shipment = ref(null);

const tabItems = ref([
  { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info', alwaysRender: true },
  { name: 'items', label: t('shared.tabs.items'), icon: 'sitemap' },
  { name: 'packages', label: t('inventory.packages.title'), icon: 'box-open' },
]);

const showConfig = showConfigConstructor(t, id.value);

</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'inventory.shipments.list' }, name: t('inventory.shipments.title') },
          { path: { name: 'inventory.shipments.show', params: { id } }, name: t('inventory.shipments.show.title') },
        ]"
      />
    </template>

    <template v-slot:content>
      <Card>
        <Tabs :tabs="tabItems">
          <template v-slot:general>
            <GeneralShow :config="showConfig">
              <template v-slot:buttons>
                <BackendLink :path="`/warehouse/shipments/${id}/pickinglist/`" target="_blank">
                  <CancelButton>
                    {{ t('inventory.shipments.button.downloadPickingList') }}
                  </CancelButton>
                </BackendLink>
              </template>
            </GeneralShow>
          </template>
          <template v-slot:items>
            <ItemsList :id="id" />
          </template>
          <template v-slot:packages>
            <ApolloSubscription :subscription="showConfig.subscription" :variables="showConfig.subscriptionVariables">
              <template v-slot:default="{ loading, error, result }">
                <template v-if="!loading && result">
                  <PackagesList :shipment="result[showConfig.subscriptionKey]" />
                </template>
              </template>
            </ApolloSubscription>
          </template>
        </Tabs>
      </Card>
    </template>
  </GeneralTemplate>
</template>