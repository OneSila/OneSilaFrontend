<script setup lang="ts">

import { useI18n} from 'vue-i18n';
import { useRoute, useRouter} from "vue-router";
import { ref} from "vue";
import {GeneralShow} from "../../../../shared/components/organisms/general-show";
import {Breadcrumbs} from "../../../../shared/components/molecules/breadcrumbs";
import {Card} from "../../../../shared/components/atoms/card";
import { showConfigConstructor } from "../configs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import AddressesList from "./containers/addresses-list/AddressesList.vue";
import { Tabs } from "../../../../shared/components/molecules/tabs";

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const tabItems = ref();

tabItems.value = [
    { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info' },
    { name: 'addresses', label: t('contacts.companies.address.list.title'), icon: 'map-marker' },
  ];

const showConfig = showConfigConstructor(t, id.value);

</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'contacts.companies.list' }, name: t('contacts.companies.title') },
                   { path: { name: 'contacts.companies.show' }, name: t('contacts.companies.show.title') }]" />
    </template>

   <template v-slot:content>
      <Card>
        <Tabs :tabs="tabItems">
          <template v-slot:general>
            <GeneralShow :config="showConfig" />
          </template>
          <template v-slot:addresses>
            <AddressesList :id="id" />
          </template>
        </Tabs>

      </Card>
   </template>
  </GeneralTemplate>
</template>