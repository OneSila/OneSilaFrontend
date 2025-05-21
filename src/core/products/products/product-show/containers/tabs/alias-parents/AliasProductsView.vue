<script setup lang="ts">
import { Product } from "../../../../configs";
import { useI18n } from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import { AliasParentsList } from "./containers/alias-parents-list";

const { t } = useI18n();

const props = defineProps<{ product: Product }>();

</script>

<template>
  <TabContentTemplate>
    <template #content>
      <AliasParentsList :products="product.aliasProducts" />
    </template>
  </TabContentTemplate>
</template>