<script lang="ts" setup>
import { computed } from 'vue';
import { DashboardUserSections } from "./containers/dashboard-user-sections";
import { DashboardSectionAmazon } from "./containers/dashboard-section-amazon";
import { DashboardSectionEbay } from "./containers/dashboard-section-ebay";
import { DashboardSectionShein } from "./containers/dashboard-section-shein";
import { injectAuth } from "../../../../../shared/modules/auth";

const auth = injectAuth();

const hasAmazonIntegration = computed(() => Boolean(auth.user.company?.hasAmazonIntegration));
const hasEbayIntegration = computed(() => Boolean(auth.user.company?.hasEbayIntegration));
const hasSheinIntegration = computed(() => Boolean(auth.user.company?.hasSheinIntegration));

</script>

<template>
  <div>
    <DashboardUserSections />
    <DashboardSectionAmazon v-if="hasAmazonIntegration" />
    <DashboardSectionEbay v-if="hasEbayIntegration" />
    <DashboardSectionShein v-if="hasSheinIntegration" />
  </div>
</template>

<style scoped>

.cards {
  display: grid;
  grid-gap: 20px;
}

</style>
