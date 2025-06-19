<script lang="ts" setup>

import { DashboardSectionProducts } from "./containers/dashboard-section-products";
import { DashboardSectionAmazon } from "./containers/dashboard-section-amazon";

</script>

<template>
  <div>
    <DashboardSectionProducts />
    <DashboardSectionAmazon />
  </div>
</template>

<style scoped>

.cards {
  display: grid;
  grid-gap: 20px;
}

</style>
