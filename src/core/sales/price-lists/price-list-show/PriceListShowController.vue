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
import ItemsList from "./containers/items/items-list/ItemsList.vue";
import {updateField} from "../../../../shared/components/organisms/general-show/showConfig";

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const addEdit = ref(true);
const tabItems = ref();

tabItems.value = [
    { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info', alwaysRender: true },
    { name: 'items', label: t('shared.tabs.items'), icon: 'sitemap' },
  ];

const showConfig = showConfigConstructor(t, id.value);

</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'sales.priceLists.list' }, name: t('sales.priceLists.title') },
                   { path: { name: 'sales.priceLists.show', params: { id: id } }, name: t('sales.priceLists.show.title') }]" />
    </template>

   <template v-slot:content>
      <Card>
        <Tabs :tabs="tabItems">
          <template v-slot:general>
            <GeneralShow :config="showConfig"  />
          </template>
          <template v-slot:items>
            <ItemsList :id="id" :add-edit="addEdit" />
          </template>
        </Tabs>
      </Card>
   </template>
  </GeneralTemplate>
</template>