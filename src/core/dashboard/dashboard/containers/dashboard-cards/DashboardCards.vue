<script lang="ts" setup>
import { computed } from 'vue';
import { DashboardUserSections } from "./containers/dashboard-user-sections";
import { DashboardSectionAmazon } from "./containers/dashboard-section-amazon";
import { DashboardSectionEbay } from "./containers/dashboard-section-ebay";
import { DashboardSectionMirakl } from "./containers/dashboard-section-mirakl";
import { DashboardSectionShein } from "./containers/dashboard-section-shein";
import { injectAuth } from "../../../../../shared/modules/auth";

const auth = injectAuth();

const hasAmazonIntegration = computed(() => Boolean(auth.user.company?.hasAmazonIntegration));
const hasEbayIntegration = computed(() => Boolean(auth.user.company?.hasEbayIntegration));
const hasMiraklIntegration = computed(() => Boolean(auth.user.company?.hasMiraklIntegration));
const hasSheinIntegration = computed(() => Boolean(auth.user.company?.hasSheinIntegration));

</script>

<template>
  <div>
    <DashboardUserSections />
  </div>
</template>

<style scoped>

.cards {
  display: grid;
  grid-gap: 20px;
}

</style>
