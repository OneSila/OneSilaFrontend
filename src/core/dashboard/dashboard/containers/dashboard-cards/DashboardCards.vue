<script lang="ts" setup>

import { DashboardSectionProducts } from "./containers/dashboard-section-products";
import { DashboardSectionGeneral } from "./containers/dashboard-section-general";
import { DashboardSectionOrders } from "./containers/dashboard-section-orders";

</script>

<template>
  <div>
    <DashboardSectionProducts />
  </div>
</template>

<style scoped>

.cards {
  display: grid;
  grid-gap: 20px;
}

</style>
