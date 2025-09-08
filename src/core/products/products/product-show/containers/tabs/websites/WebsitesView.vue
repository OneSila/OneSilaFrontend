<script setup lang="ts">
import { useI18n } from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import { Product } from "../../../../configs";
import { SearchConfig } from "../../../../../../../shared/components/organisms/general-search/searchConfig";
import WebsitesList from "./containers/assigns-list/WebsitesList.vue";
import WebsiteAssignCreate from "./containers/assign-create/WebsiteAssignCreate.vue";
import {computed, Ref, ref, watch} from "vue";

const { t } = useI18n();

const props = defineProps<{ product: Product }>();
const emit = defineEmits(['assign-added', 'assign-deleted']);
const ids: Ref<string[]> = ref([]);


const extractedIds = computed(() => {
  return props.product?.saleschannelviewassignSet?.map(assign => assign.salesChannelView.id) || [];
});

watch(
  extractedIds,
  (newIds) => {
    ids.value = newIds;
  },
  { immediate: true }
);

</script>

<template>
  <TabContentTemplate>
    <template v-slot:content>
      <WebsitesList :product="product" @assign-deleted="emit('assign-deleted')" />

      <div class="mt-2">
        <WebsiteAssignCreate :product="product" :views-ids="ids" @assign-added="emit('assign-added')" />
      </div>
    </template>
  </TabContentTemplate>
</template>
