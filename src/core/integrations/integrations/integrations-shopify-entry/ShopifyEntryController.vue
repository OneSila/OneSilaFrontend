<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { getShopifyChannelsQuery } from "../../../../shared/api/queries/salesChannels";
import { IntegrationTypes } from "../integrations";
import { Loader } from "../../../../shared/components/atoms/loader";
import { Toast } from "../../../../shared/modules/toast";
import apolloClient from "../../../../../apollo-client";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

onMounted(async () => {
  const queryParams = route.query;
  const shop = queryParams.shop as string | undefined;

  if (!shop) {
    Toast.error(t('integrations.salesChannel.shopify.installed.missingParams'));
    await router.replace({ name: 'integrations.integrations.list' });
    return;
  }

  try {

    const { data } = await apolloClient.query({
      query: getShopifyChannelsQuery,
      variables: {
        filters: {
          hostname: {iContains: shop},
        },
      first: 1,
      }
    });

  if (data && data.shopifyChannels && data.shopifyChannels.edges && data.shopifyChannels.edges.length == 1) {
    await router.replace({
      name: 'integrations.integrations.show',
      params: {
        type: IntegrationTypes.Shopify,
        id: data.shopifyChannels.edges[0].node.id,
      },
    });
  } else {
    await router.replace({
      name: 'integrations.integrations.create',
      query: {
        ...queryParams,
        isExternal: 'true',
        type: IntegrationTypes.Shopify
      },
    });
  }

  } catch (e) {
    Toast.error(t('integrations.salesChannel.shopify.installed.genericError'));
    await router.replace({ name: 'integrations.integrations.list' });
  }
});
</script>

<template>
  <div class="p-8">
    <Loader :loading="true" />
  </div>
</template>
