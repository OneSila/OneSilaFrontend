<script setup lang="ts">

import { ref } from 'vue';
import { Product } from "../../../../configs";
import { useI18n } from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import MediaCreate from "./containers/variation-create/MediaCreate.vue";
import MediaList from "./containers/variations-list/MediaList.vue";

const { t } = useI18n();

const props = defineProps<{ product: Product }>();
const ids = ref([]);
const refetchNeeded = ref(false);

const handleVariationAdded = (response) => {
  refetchNeeded.value = true;
};

const handleRefeched = () => {
  refetchNeeded.value = false;
};

const getIds = (newIds) => {
  ids.value = newIds;
};

</script>

<template>
  <TabContentTemplate>

    <template v-slot:content>
      <MediaList :product="product" :refetch-needed="refetchNeeded" @refetched="handleRefeched" @update-ids="getIds" />
      <div class="mt-2">
        <MediaCreate :product="product" :media-ids="ids" @variation-added="handleVariationAdded" />
      </div>
    </template>
  </TabContentTemplate>
</template>
