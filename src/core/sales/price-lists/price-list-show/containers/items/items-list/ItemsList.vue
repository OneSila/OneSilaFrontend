<script setup lang="ts">

import {ref, watch} from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from "../../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../../shared/components/atoms/link";
import { GeneralListing } from "../../../../../../../shared/components/organisms/general-listing";
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { listingConfigConstructor, searchConfigConstructor, listingQueryKey, listingQuery } from "../configs";

const props = defineProps<{ id: string; addEdit: boolean }>();
const { t } = useI18n();

const listingConfig = ref(listingConfigConstructor(t, props.id));
const searchConfig = searchConfigConstructor(t);

watch(() => props.addEdit, (newValue) => {
  listingConfig.value.addEdit = newValue;
});

</script>

<template>
  <GeneralTemplate>

    <template v-slot:buttons>
      <Flex between>
        <FlexCell grow></FlexCell>
        <FlexCell>
          <Link :path="{ name: 'sales.priceLists.items.create', params: {priceListId: id} }">
            <Button class="btn btn-primary">
                {{  t('sales.priceLists.items.create.title') }}
            </Button>
          </Link>
        </FlexCell>
      </Flex>
    </template>

   <template v-slot:content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="{'salespricelist': {'id': {'exact': id}}}"
    />
   </template>
  </GeneralTemplate>
</template>