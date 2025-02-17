<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { GeneralForm } from "../../../../../../../shared/components/organisms/general-form";
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../shared/components/molecules/breadcrumbs";
import { editFormConfigConstructor } from '../configs';

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const shipmentId = ref(String(route.params.shipmentId));

const formConfig = editFormConfigConstructor(
  t,
  id.value,
  shipmentId.value
);

</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'inventory.shipments.list' }, name: t('inventory.shipments.title') },
          { path: { name: 'inventory.shipments.show', params: { id: shipmentId } }, name: t('inventory.shipments.show.title') },
          { path: { name: 'inventory.packages.edit', params: { shipmentId, id } }, name: t('inventory.packages.edit.title') }
        ]"
      />
    </template>

    <template v-slot:content>
      <div class="p-2" v-if="formConfig !== null">
        <GeneralForm :config="formConfig" />
      </div>
    </template>
  </GeneralTemplate>
</template>
