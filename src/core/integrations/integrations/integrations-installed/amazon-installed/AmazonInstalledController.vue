<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import { Breadcrumbs } from '../../../../../shared/components/molecules/breadcrumbs';
import { Loader } from "../../../../../shared/components/atoms/loader";
import apolloClient from "../../../../../../apollo-client";
import { Card } from "../../../../../shared/components/atoms/card";
import { Link } from "../../../../../shared/components/atoms/link";
import { Button } from "../../../../../shared/components/atoms/button";
import { IntegrationTypes } from "../../integrations";
import GeneralTemplate from "../../../../../shared/templates/GeneralTemplate.vue";
import {validateAmazonAuthMutation} from "../../../../../shared/api/mutations/salesChannels";

const { t } = useI18n();
const route = useRoute();

const errors = ref<string[]>([]);
const loading = ref(true);
const id = ref<string | null>(null);

onMounted(async () => {
  const { spapi_oauth_code, selling_partner_id, state } = route.query;

  if (!spapi_oauth_code || !selling_partner_id || !state) {
    errors.value.push(t('integrations.salesChannel.amazon.installed.missingParams'));
    loading.value = false;
    return;
  }

  try {
    const { data } = await apolloClient.mutate({
      mutation: validateAmazonAuthMutation,
      variables: {
        data: {
          spapiOauthCode: spapi_oauth_code,
          sellingPartnerId: selling_partner_id,
          state,
        }
      }
    });

    const result = data?.validateAmazonAuth;
    if (result?.id) {
      id.value = result.id;
    } else if (result?.messages?.length) {
      errors.value = result.messages.map((m: any) => m.message);
    }
  } catch (e) {
    errors.value.push(t('integrations.salesChannel.amazon.installed.genericError'));
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
              ✅ {{ t('integrations.salesChannel.amazon.installed.success') }}
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
            <div v-if="!loading" class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
              <span class="font-medium flex items-center gap-1">
                ⚠️ {{ t('integrations.show.amazonNotConnectedBanner.title') }}
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
