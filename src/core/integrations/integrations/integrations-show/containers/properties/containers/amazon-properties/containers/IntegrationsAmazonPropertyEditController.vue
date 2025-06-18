<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import { GeneralForm } from "../../../../../../../../../shared/components/organisms/general-form";
import { amazonPropertyEditFormConfigConstructor } from "../configs";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import apolloClient from "../../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import { amazonPropertiesQuery } from "../../../../../../../../../shared/api/queries/salesChannels";
import { FormConfig } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const amazonPropertyId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId?.toString() || '';
const salesChannelId = route.query.salesChannelId?.toString() || '';
const isWizard = route.query.wizard == '1';
const propertyId = route.query.propertyId?.toString() || null;
const amazonCreateValue = route.query.amazonCreateValue?.toString() || null;
const formConfig = ref<FormConfig | null>(null);
const formData = ref<Record<string, any>>({});
const nextWizardId = ref<string | null>(null);

const fetchNextUnmapped = async (): Promise<{ nextId: string | null; last: boolean }> => {
  const { data } = await apolloClient.query({
    query: amazonPropertiesQuery,
    variables: {
      first: 2,
      filter: {
        salesChannel: { id: { exact: salesChannelId } },
        mappedLocally: false,
      },
    },
    fetchPolicy: 'network-only',
  });

  const edges = data?.amazonProperties?.edges || [];
  let nextId: string | null = null;
  for (const edge of edges) {
    if (edge.node.id !== amazonPropertyId.value) {
      nextId = edge.node.id;
      break;
    }
  }
  const last = edges.length === 1 && edges[0].node.id === amazonPropertyId.value;
  return { nextId, last };
};

onMounted(async () => {
  formConfig.value = amazonPropertyEditFormConfigConstructor(t, type.value, amazonPropertyId.value, integrationId, propertyId);

  if (amazonCreateValue) {
    formConfig.value.submitUrl = {
      name: 'integrations.amazonPropertySelectValues.edit',
      params: { type: type.value, id: amazonCreateValue },
      query: { integrationId, salesChannelId, ...(isWizard ? { wizard: '1' } : {}) },
    };
    return;
  }

  if (!isWizard) return;

  const { nextId, last } = await fetchNextUnmapped();
  nextWizardId.value = nextId;

  formConfig.value.addSubmitAndContinue = false;

  if (nextId) {
    formConfig.value.submitUrl = {
      name: 'integrations.amazonProperties.edit',
      params: { type: type.value, id: nextId },
      query: { integrationId, salesChannelId, wizard: '1' },
    };
    formConfig.value.submitLabel = t('integrations.show.mapping.saveAndMapNext');
  } else if (last) {
    formConfig.value.submitUrl = {
      name: 'integrations.integrations.show',
      params: { type: type.value, id: integrationId },
      query: { tab: 'properties' }
    };
  } else {
    Toast.success(t('integrations.show.mapping.allMappedSuccess'));
    router.push({
      name: 'integrations.integrations.show',
      params: { type: type.value, id: integrationId },
      query: { tab: 'properties' }
    });
  }
});

const handleFormUpdate = (form) => {
  formData.value = form;
};

</script>


<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.show', params: {id: integrationId, type: type}, query: {tab: 'properties'} }, name: t('integrations.show.amazon.title') }
        ]" />
    </template>
    <template v-slot:buttons>
        <div>
          <Link :path="{ name: 'properties.properties.create', query: { amazonRuleId: `${amazonPropertyId}__${integrationId}__${salesChannelId}`, name: formData.name, type: formData.type, amazonWizard: isWizard ? '1' : '0', ...(amazonCreateValue ? { amazonCreateValue } : {}) } }">
            <Button type="button" class="btn btn-primary">
                {{  t('properties.properties.create.title') }}
            </Button>
          </Link>
      </div>
    </template>
    <template v-slot:content>
      <GeneralForm v-if="formConfig" :config="formConfig" @form-updated="handleFormUpdate" />
    </template>
  </GeneralTemplate>
</template>
