<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { Breadcrumbs } from '../../../../shared/components/molecules/breadcrumbs';
import GeneralTemplate from '../../../../shared/templates/GeneralTemplate.vue';
import {Loader} from "../../../../shared/components/atoms/loader";
import { validateShopifyAuthMutation } from "../../../../shared/api/mutations/salesChannels.js";
import apolloClient from "../../../../../apollo-client";
import {Card} from "../../../../shared/components/atoms/card";
import {Link} from "../../../../shared/components/atoms/link";
import {Button} from "../../../../shared/components/atoms/button";
import {IntegrationTypes} from "../integrations";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const errors = ref<string[]>([]);
const loading = ref(true);
const id = ref<string | null>(null);

onMounted(async () => {
  const { shop, state, hmac, code, timestamp, host } = route.query;

  if (!shop || !state || !hmac || !code || !timestamp || !host) {
    errors.value.push(t('integrations.salesChannel.shopify.installed.missingParams'));
    loading.value = false;
    return;
  }

  try {
    const { data } = await apolloClient.mutate({
      mutation: validateShopifyAuthMutation,
      variables: {
        data: {
          shop,
          state,
          hmac,
          code,
          timestamp,
          host
        }
      }
    });

    const result = data?.validateShopifyAuth;
    if (result?.id) {
      id.value = result.id;
    } else if (result?.messages?.length) {
      errors.value = result.messages.map((m: any) => m.message);
    }

  } catch (e) {
    errors.value.push(t('integrations.salesChannel.shopify.installed.genericError'));
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'integrations.integrations.list' }, name: t('integrations.title') }]" />
    </template>

    <template #content>
      <Card class="p-4">
        <Loader :loading="loading" />
        <div>
          <div v-if="id">
            <div class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50" role="alert">
              ✅ {{ t('integrations.salesChannel.shopify.installed.success') }}
            </div>
            <Link class="mt-2" :path="{ name: 'integrations.integrations.show', params: { id, type: IntegrationTypes.Shopify } }">
              <Button
                type="button"
                class="button rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm btn-info"
              >
                {{ t('integrations.salesChannel.shopify.labels.goToStore') }}
              </Button>
            </Link>
          </div>

          <div v-else>
            <div class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
              <span class="font-medium flex items-center gap-1">
                ⚠️ {{ t('integrations.show.shopifyNotConnectedBanner.title') }}
              </span>
              <ul class="mt-2 ml-4 list-disc">
                <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </template>
  </GeneralTemplate>
</template>
