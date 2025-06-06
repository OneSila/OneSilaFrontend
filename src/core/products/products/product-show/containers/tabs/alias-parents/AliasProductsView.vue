<script setup lang="ts">
import { Product } from "../../../../configs";
import { useI18n } from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import { AliasParentsList } from "./containers/alias-parents-list";
import { Button } from "../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../shared/components/atoms/link";

const { t } = useI18n();

const props = defineProps<{ product: Product }>();

</script>

<template>
  <TabContentTemplate>
    <template #buttons>
      <Link :path="{ name: 'products.products.create', query: { aliasProductParentId: product.id } }">
        <Button type="button" class="btn btn-primary">
          {{ t('products.products.create.title') }}
        </Button>
      </Link>
    </template>
    <template #content>
      <AliasParentsList :products="product.aliasProducts" />
    </template>
  </TabContentTemplate>
</template>
