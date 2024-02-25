<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralShow } from "../../../../shared/components/organisms/general-show";
import { ShowConfig } from "../../../../shared/components/organisms/general-show/showConfig";
import { deleteCompanyMutation } from "../../../../shared/api/mutations/contacts.js";
import { getCompanySubscription } from "../../../../shared/api/subscriptions/contacts.js";
import {FieldType} from "../../../../shared/components/organisms/general-form/formConfig";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(route.params.id);

const showConfig: ShowConfig = {
  cols: 1,
  subscription: getCompanySubscription,
  subscriptionKey: 'company',
  subscriptionVariables: {id: id.value},
  addBack:true,
  backLabel: "BACK",
  backUrl:  {name: 'people.list' },
  addEdit:false,
  addDelete:false,
  fields: [
 {
    name: 'name',
    label: 'Name',
  },
  {
    name: 'vatNumber',
    label: 'VAT Number',
    icon: 'envelope'
  },
  {
    name: 'eoriNumber',
    label: 'EORI Number',
  }
  ]

};

</script>

<template>
  <div>
    <GeneralShow :config="showConfig" />
  </div>
</template>