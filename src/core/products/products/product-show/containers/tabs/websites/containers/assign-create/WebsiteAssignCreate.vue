<script setup lang="ts">
import {onMounted, ref, Ref, watch} from 'vue';
import { useI18n } from "vue-i18n";
import { Product } from "../../../../../../configs";
import { salesChannelViewsQuerySelector } from "../../../../../../../../../shared/api/queries/salesChannels.js";
import { createSalesChannelViewAssignMutation } from "../../../../../../../../../shared/api/mutations/salesChannels.js";
import { Selector } from "../../../../../../../../../shared/components/atoms/selector";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import apolloClient from "../../../../../../../../../../apollo-client";
import {PrimaryButton} from "../../../../../../../../../shared/components/atoms/button-primary";

const { t } = useI18n();

interface SalesChannelView {
  id: string;
  name: string;
  active: boolean;
  salesChannel: {
    id: string;
  };
}


const props = defineProps<{ product: Product; viewsIds: string[] }>();
const emit = defineEmits(['assign-added']);
const selectedView = ref<string | null>(null);
const views: Ref<SalesChannelView[]> = ref([]);

const loading = ref(false);

const fetchViews = async () => {
  loading.value = true;
  const { data } = await apolloClient.query({
    query: salesChannelViewsQuerySelector,
    variables: { filter: { salesChannel: { active: {exact: true} }, NOT: { id: { inList: props.viewsIds } } } },
    fetchPolicy: 'cache-first'
  });

  if (data) {
    views.value = data.salesChannelViews.edges.map(edge => edge.node);
  }
  loading.value = false;
};

const resetForm = () => {
  selectedView.value = null;
};

const handleCreateAssign = async () => {
  try {
    const selectedSalesChannelView = views.value.find(view => view.id === selectedView.value) as SalesChannelView;

    const input = {
      product: { id: props.product.id },
      salesChannelView: { id: selectedView.value },
      salesChannel: { id: selectedSalesChannelView.salesChannel.id }
    };

    await apolloClient.mutate({
      mutation: createSalesChannelViewAssignMutation,
      variables: { data: input }
    });
    emit('assign-added');
    resetForm();
    Toast.success(t('shared.alert.toast.submitSuccessCreate'));
  } catch (error) {
    Toast.error(t('shared.alert.toast.generalError'));
  }
};

watch(() => props.viewsIds, fetchViews, { deep: true });

onMounted(fetchViews);

</script>

<template>
  <div class="mt-2">
    <Flex gap="2" v-if="views.length > 0">
      <FlexCell class="w-full md:w-1/2 xl:w-1/3">
        <Selector v-model="selectedView"
                  :options="views"
                  label-by="name"
                  value-by="id"
                  :placeholder="t('products.products.placeholders.salesChannelView')"
                  filterable
                  removable />
      </FlexCell>
      <FlexCell>
        <PrimaryButton :disabled="!selectedView || product.inspector.hasMissingInformation" @click="handleCreateAssign">
          {{ t('shared.button.add') }}
        </PrimaryButton>
      </FlexCell>
    </Flex>
    <p v-if="views.length > 0 && product.inspector.hasMissingInformation" class="mt-3 text-sm leading-6 text-red-500">{{ t('integrations.salesChannel.helpText.cannotAssign') }}</p>
  </div>
</template>
