<script setup lang="ts">
import {onMounted, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import {useRoute, useRouter} from 'vue-router';
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../shared/components/molecules/breadcrumbs";
import {PackagingMode} from "../../../../../../../shared/utils/constants";
import {ManualPackage} from "./containers/manual-package";
import {VirtualTour} from "./containers/virtual-tour";
import {Card} from "../../../../../../../shared/components/atoms/card";
import {Image} from "../../../../../../../shared/components/atoms/image";
import virtualImage from "../../../../../../../assets/images/packages-types/virtual.png";
import manualImage from "../../../../../../../assets/images/packages-types/manual.png";
import apolloClient from "../../../../../../../../apollo-client";
import {shipmentItemsToShipQuery} from "../../../../../../../shared/api/queries/inventory.js";
import {ShipmentStatus, updateShipmentStatus} from "../../../../configs";

const { t } = useI18n();
const route = useRoute();
const shipmentId = ref(String(route.params.shipmentId));
const items = ref([]);


const router = useRouter();
const activeMode = ref(route.query.mode || '');

const setMode = (mode: PackagingMode) => {
  activeMode.value = mode;
  router.push({ query: { ...route.query, mode } });
};


const fetchShipmentItems = async () => {
  try {
    await updateShipmentStatus(apolloClient, shipmentId.value, ShipmentStatus.IN_PROGRESS);

    const { data } = await apolloClient.query({
      query: shipmentItemsToShipQuery,
      variables: { filter: { 'shipment': { 'id': { 'exact': shipmentId.value } } } },
      fetchPolicy: 'network-only'
    });

    const edges = data.shipmentitemstoship.edges;

    items.value = edges.map(edge => ({
      id: edge.node.id,
      product: {
        id: edge.node.product.id,
        name: edge.node.product.name,
      },
      inventorylocation: {
        id: edge.node.inventorylocation.id,
        name: edge.node.inventorylocation.name,
      },
      quantity: edge.node.quantity,
    }));
  } catch (error) {
    console.error('Error fetching shipment items:', error);
  }
}

onMounted(() => {
  fetchShipmentItems();
  if (route.query.mode) {
    activeMode.value = route.query.mode;
  }
});

const typeChoices = [
  {
    name: PackagingMode.MANUAL,
    title: t('inventory.packages.create.manual.title'),
    description: t('inventory.packages.create.manual.description'),
    image: manualImage,
    component: ManualPackage,
  },
  {
    name: PackagingMode.VIRTUAL,
    title: t('inventory.packages.create.virtual.title'),
    description: t('inventory.packages.create.virtual.description'),
    image: virtualImage,
    component: VirtualTour,
  },
];

</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'inventory.shipments.list' }, name: t('inventory.shipments.title') },
          { path: { name: 'inventory.shipments.show', params: { id: shipmentId } }, name: t('inventory.shipments.show.title') },
          { path: { name: 'inventory.packages.create', params: { shipmentId } }, name: t('inventory.packages.create.title') }
        ]"
      />
    </template>

    <template v-slot:content>
      <Card>
        <div v-if="!activeMode">
          <div class="grid gap-4 mt-4 grid-cols-2">
            <div
              v-for="choice in typeChoices"
              :key="choice.name"
              class="flex-grow cursor-pointer border border-gray-300 group-hover:border-gray-400 md:border-2 rounded-lg p-4"
              @click="setMode(choice.name)"
            >
              <h3 class="text-lg font-bold">{{ choice.title }}</h3>
              <p class="mb-6">{{ choice.description }}</p>
              <Image :source="choice.image" alt="Variable" class="w-full max-h-[35rem]" />
            </div>
          </div>
        </div>

        <ManualPackage v-if="activeMode === PackagingMode.MANUAL && items.length" :shipmentId="shipmentId" :items="items" />
        <VirtualTour v-if="activeMode === PackagingMode.VIRTUAL && items.length" :shipmentId="shipmentId" :items="items" />
      </Card>
    </template>
  </GeneralTemplate>
</template>