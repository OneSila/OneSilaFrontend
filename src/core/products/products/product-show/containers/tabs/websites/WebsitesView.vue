<script setup lang="ts">
import { useI18n } from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import { Product } from "../../../../configs";
import { SearchConfig } from "../../../../../../../shared/components/organisms/general-search/searchConfig";
import WebsitesList from "./containers/variations-list/WebsitesList.vue";
import WebsiteAssignCreate from "./containers/variation-create/WebsiteAssignCreate.vue";
import { ref } from "vue";

const { t } = useI18n();

const props = defineProps<{ product: Product }>();
const ids = ref([]);
const refetchNeeded = ref(false);

const searchConfig: SearchConfig = {
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
};

const handleAssignAdded = () => {
  refetchNeeded.value = true;
};

const handleRefetched = () => {
  refetchNeeded.value = false;
};

const getIds = (newIds) => {
  ids.value = newIds;
};
</script>

<template>
  <TabContentTemplate>
    <template v-slot:content>
      <WebsitesList :product="product"
                    :search-config="searchConfig"
                    :refetch-needed="refetchNeeded"
                    @refetched="handleRefetched"
                    @update-ids="getIds" />

      <div class="mt-2">
        <WebsiteAssignCreate :product="product" :views-ids="ids" @assign-added="handleAssignAdded" />
      </div>
    </template>
  </TabContentTemplate>
</template>
