<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { IntegrationTypes } from "../../../integrations";
import { AmazonImportsListing, EbayImportsListing, GeneralImportsListing } from './components';

const route = useRoute();
const props = defineProps<{ id: string; salesChannelId: string }>();
const type = ref(String(route.params.type));
const isAmazon = computed(() => type.value === IntegrationTypes.Amazon);
const isEbay = computed(() => type.value === IntegrationTypes.Ebay);
</script>

<template>
  <AmazonImportsListing v-if="isAmazon" :id="id" :sales-channel-id="salesChannelId" />
  <EbayImportsListing v-else-if="isEbay" :id="id" :sales-channel-id="salesChannelId" />
  <GeneralImportsListing v-else :id="id" :sales-channel-id="salesChannelId" />
</template>
