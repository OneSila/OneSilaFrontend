<script setup lang="ts">

import { useI18n} from 'vue-i18n';
import { useRoute } from "vue-router";
import { ref} from "vue";
import { GeneralShow } from "../../../../shared/components/organisms/general-show";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Tabs } from "../../../../shared/components/molecules/tabs";
import { Card } from "../../../../shared/components/atoms/card";
import { showConfigConstructor } from "../configs";
import SettingsTemplate from "../../SettingsTemplate.vue";
import AddressesList from "./containers/addresses-list/AddressesList.vue";
import PeopleList from "./containers/people-list/PeopleList.vue";
import { TabsMenu } from "../../../../shared/components/molecules/tabs-menu";
import { getTabsConfig } from "../../tabs";

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const tabItems = ref();

tabItems.value = [
    { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info' },
    { name: 'addresses', label: t('contacts.companies.address.list.title'), icon: 'map-marker' },
    { name: 'people', label: t('contacts.people.title'), icon: 'users' }
  ];

const showConfig = showConfigConstructor(t, id.value);

</script>

<template>
    <SettingsTemplate>

    <template v-slot:tabs>
      <TabsMenu :tabs="getTabsConfig(t)" :activeName="'companies'" />
    </template>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'settings.internalCompanies.list' }, name: t('contacts.companies.title') },
                   { path: { name: 'settings.internalCompany.show' }, name: t('contacts.companies.show.title') }]" />
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
          <template v-slot:people>
            <PeopleList :id="id" />
          </template>
        </Tabs>
      </Card>
   </template>
  </SettingsTemplate>
</template>