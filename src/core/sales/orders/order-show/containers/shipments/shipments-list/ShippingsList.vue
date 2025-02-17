<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from "../../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../../shared/components/atoms/link";
import { GeneralListing } from "../../../../../../../shared/components/organisms/general-listing";
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { listingConfigConstructor, searchConfigConstructor, listingQueryKey, listingQuery } from "../../../../../../inventory/shipments/configs";

const props = defineProps<{ id: string }>();
const { t } = useI18n();

const searchConfig = searchConfigConstructor(t, props.id);
const listingConfig = listingConfigConstructor(t, props.id, 'order');
</script>

<template>
  <GeneralTemplate>
    <template v-slot:buttons>
      <Link :path="{ name: 'inventory.shipments.create', query: {orderId: id, source: 'order' } }">
        <Button class="btn btn-primary">
          {{ t('inventory.shipments.create.title') }}
        </Button>
      </Link>
    </template>

    <template v-slot:content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="{'order': {'id': {'exact': id}}}"
      />
    </template>
  </GeneralTemplate>
</template>