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

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(route.params.id);

const showConfig = showConfigConstructor(t, id.value);

</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'contacts.companies.list' }, name: t('contacts.companies.title') },
                   { path: { name: 'contacts.companies.edit' }, name: t('contacts.companies.edit.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2">
        <GeneralShow :config="showConfig" />
        <AddressesList :id="id" />
      </Card>
   </template>
  </GeneralTemplate>
</template>