<script lang="ts" setup>

import { DashboardSectionProducts } from "./containers/dashboard-section-products";
import { DashboardSectionGeneral } from "./containers/dashboard-section-general";
import { DashboardSectionAmazon } from "./containers/dashboard-section-amazon";
import { injectAuth } from "../../../../../shared/modules/auth";
const auth = injectAuth();

</script>

<template>
  <div>
    <DashboardSectionProducts />
    <DashboardSectionGeneral />
    <DashboardSectionAmazon v-if="auth.user.company?.hasAmazonIntegration" />
  </div>
</template>

<style scoped>

.cards {
  display: grid;
  grid-gap: 20px;
}

</style>
