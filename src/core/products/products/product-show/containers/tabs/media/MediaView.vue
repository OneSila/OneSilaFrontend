<script setup lang="ts">

import { ref } from 'vue';
import { Product } from "../../../../configs";
import { useI18n } from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import { MediaCreate } from "./containers/media-create";
import { MediaList } from "./containers/media-list";

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
      <Flex class="mb-2">
        <FlexCell grow></FlexCell>
        <FlexCell>
          <MediaCreate :product="product" :media-ids="ids" @media-added="handleVariationAdded" />
        </FlexCell>
      </Flex>
      <MediaList :product="product" :refetch-needed="refetchNeeded" @refetched="handleRefeched" @update-ids="getIds" />
    </template>
  </TabContentTemplate>
</template>
