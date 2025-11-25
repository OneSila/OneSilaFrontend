<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import { GeneralForm } from "../../../../../../../../../shared/components/organisms/general-form";
import { ebayInternalPropertyEditFormConfigConstructor, ebayInternalListingQuery } from "../ebayInternalConfigs";
import { FieldType, PropertyTypes } from "../../../../../../../../../shared/utils/constants";
import { propertiesQuerySelector } from "../../../../../../../../../shared/api/queries/properties.js";
import apolloClient from "../../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import type { FormConfig } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";
import EbayInternalPropertyOptions from "../components/EbayInternalPropertyOptions.vue";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../../../shared/components/atoms/button";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const ebayInternalPropertyId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId?.toString() || '';
const salesChannelId = route.query.salesChannelId?.toString() || '';
const isWizard = route.query.wizard === '1';
const propertyId = route.query.propertyId?.toString() || null;
const returnTab = route.query.fromTab?.toString() || 'properties';

const formConfig = ref<FormConfig | null>(null);
const formState = ref<Record<string, any>>({});
const propertyData = ref<any | null>(null);

const fetchNextUnmapped = async (): Promise<{ nextId: string | null; last: boolean }> => {
  const { data } = await apolloClient.query({
    query: ebayInternalListingQuery,
    variables: {
      first: 2,
      filter: {
        salesChannel: { id: { exact: salesChannelId } },
        mappedLocally: false,
      },
    },
    fetchPolicy: 'network-only',
  });

  const edges = data?.ebayInternalProperties?.edges || [];
  let nextId: string | null = null;
  for (const edge of edges) {
    if (edge.node.id !== ebayInternalPropertyId.value) {
      nextId = edge.node.id;
      break;
    }
  }
  const last = edges.length === 1 && edges[0].node.id === ebayInternalPropertyId.value;
  return { nextId, last };
};

onMounted(async () => {
  formConfig.value = ebayInternalPropertyEditFormConfigConstructor(
    t,
    type.value,
    ebayInternalPropertyId.value,
    integrationId,
    returnTab,
  );

  if (!formConfig.value) {
    return;
  }

  formConfig.value.cancelUrl = {
    name: 'integrations.integrations.show',
    params: { type: type.value, id: integrationId },
    query: { tab: returnTab },
  };

  if (!isWizard) {
    return;
  }

  const { nextId, last } = await fetchNextUnmapped();

  formConfig.value.addSubmitAndContinue = false;

  if (nextId) {
    formConfig.value.submitUrl = {
      name: 'integrations.remoteInternalProperties.edit',
      params: { type: type.value, id: nextId },
      query: { integrationId, salesChannelId, wizard: '1', fromTab: returnTab },
    };
    formConfig.value.submitLabel = t('integrations.show.mapping.saveAndMapNext');
    return;
  }

  if (last) {
    formConfig.value.submitUrl = {
      name: 'integrations.integrations.show',
      params: { type: type.value, id: integrationId },
      query: { tab: returnTab },
    };
    return;
  }

  Toast.success(t('integrations.show.mapping.allMappedSuccess'));
  router.push({
    name: 'integrations.integrations.show',
    params: { type: type.value, id: integrationId },
    query: { tab: returnTab },
  });
});

const handleSetData = (data: any) => {
  if (!formConfig.value) {
    return;
  }

  propertyData.value = data?.ebayInternalProperty ?? null;
  const propertyType = data?.ebayInternalProperty?.type;
  if (!propertyType) {
    return;
  }

  const defaultValue = propertyId || data?.ebayInternalProperty?.localInstance?.id || null;

  const field = {
    type: FieldType.Query,
    name: 'localInstance',
    label: t('integrations.show.properties.labels.property'),
    help: t('integrations.show.properties.help.property'),
    labelBy: 'name',
    valueBy: 'id',
    query: propertiesQuerySelector,
    queryVariables: { filter: { type: { exact: propertyType } } },
    dataKey: 'properties',
    isEdge: true,
    multiple: false,
    filterable: true,
    addLookup: true,
    lookupKeys: ['id'],
    formMapIdentifier: 'id',
    ...(defaultValue ? { default: defaultValue } : {}),
  };

  const index = formConfig.value.fields.findIndex((f: any) => f.name === 'localInstance');
  if (index === -1) {
    formConfig.value.fields.push(field as any);
  } else {
    formConfig.value.fields[index] = field as any;
  }
};

const handleFormUpdate = (form: Record<string, any>) => {
  formState.value = { ...form };
};

const localInstanceId = computed<string | null>(() => {
  const formLocal = formState.value?.localInstance;
  if (typeof formLocal === 'string') {
    return formLocal;
  }
  if (formLocal && typeof formLocal === 'object') {
    return formLocal.id ?? null;
  }

  const dataLocal = propertyData.value?.localInstance;
  if (typeof dataLocal === 'string') {
    return dataLocal;
  }
  if (dataLocal && typeof dataLocal === 'object') {
    return dataLocal.id ?? null;
  }

  return null;
});

const isSelectProperty = computed(() => propertyData.value?.type === PropertyTypes.SELECT);
const remoteRuleId = computed(() =>
  [ebayInternalPropertyId.value, integrationId, salesChannelId, type.value]
    .map((part) => part ?? '')
    .join('__'),
);
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.show', params: { id: integrationId, type: type }, query: { tab: returnTab } }, name: t('integrations.show.ebay.title') },
          { name: t('integrations.show.mapProperty') },
        ]"
      />
    </template>
    <template #content>
      <div v-if="formConfig" class="space-y-6">
        <GeneralForm
          :config="formConfig"
          @set-data="handleSetData"
          @form-updated="handleFormUpdate"
        >
          <template #additional-button>
            <Link
              v-if="remoteRuleId"
              :path="{
                name: 'properties.properties.create',
                query: {
                  remoteRuleId,
                  ...(formState.name ? { name: formState.name } : {}),
                  ...(formState.type ? { type: formState.type } : {}),
                  remoteWizard: isWizard ? '1' : '0',
                  remoteRuleRoute: 'integrations.remoteInternalProperties.edit',
                },
              }"
            >
              <Button type="button" class="btn btn-info">
                {{ t('integrations.show.generateProperty') }}
              </Button>
            </Link>
          </template>
        </GeneralForm>
        <EbayInternalPropertyOptions
          v-if="isSelectProperty && localInstanceId"
          :property-id="ebayInternalPropertyId"
          :local-property-id="localInstanceId"
        />
      </div>
    </template>
  </GeneralTemplate>
</template>
