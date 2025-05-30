<script setup lang="ts">
import { Product } from "../../../../configs";
import { useI18n } from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import { ParentsList } from "./containers/parents-list";

const { t } = useI18n();

const props = defineProps<{ product: Product }>();


</script>

<template>
  <TabContentTemplate>
    <template v-slot:content>
      <ParentsList
        :product="product"
      />
    </template>
  </TabContentTemplate>
</template>
