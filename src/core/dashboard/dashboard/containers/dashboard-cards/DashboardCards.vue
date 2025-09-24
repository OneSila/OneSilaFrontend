<script lang="ts" setup>
import { computed } from 'vue';
import { DashboardSectionProducts } from "./containers/dashboard-section-products";
import { DashboardSectionGeneral } from "./containers/dashboard-section-general";
import { DashboardSectionAmazon } from "./containers/dashboard-section-amazon";
import { DashboardSectionEbay } from "./containers/dashboard-section-ebay";
import { injectAuth } from "../../../../../shared/modules/auth";

const auth = injectAuth();

const hasAmazonIntegration = computed(() => Boolean(auth.user.company?.hasAmazonIntegration));
const hasEbayIntegration = computed(() => Boolean((auth.user.company as any)?.hasEbayIntegration));
</script>

<template>
  <div>
    <DashboardSectionProducts />
    <DashboardSectionGeneral />
    <DashboardSectionAmazon v-if="hasAmazonIntegration" />
    <DashboardSectionEbay v-if="hasEbayIntegration" />
  </div>
</template>

<style scoped>

.cards {
  display: grid;
  grid-gap: 20px;
}

</style>
