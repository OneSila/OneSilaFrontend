<script setup lang="ts">
import { onMounted, ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import { Label } from "../../../../../../../../../shared/components/atoms/label";
import { Flex, FlexCell } from "../../../../../../../../../shared/components/layouts/flex";
import { SubmitButtons } from "../../../../../../../../../shared/components/organisms/general-form/containers/submit-buttons";
import { Selector } from "../../../../../../../../../shared/components/atoms/selector";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { FormConfig, FormConfigDefaultTranslations, getEnhancedConfig, FormType } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../../../../../../shared/utils/constants";
import apolloClient from "../../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import { updateAmazonDefaultUnitConfiguratorMutation } from "../../../../../../../../../shared/api/mutations/salesChannels.js";
import { getAmazonDefaultUnitConfiguratorQuery, amazonDefaultUnitConfiguratorsQuery } from "../../../../../../../../../shared/api/queries/salesChannels.js";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const configuratorId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId?.toString() || '';
const salesChannelId = route.query.salesChannelId?.toString() || '';
const isWizard = route.query.wizard === '1';
const nextWizardId = ref<string | null>(null);

const formConfig: FormConfig = {
  cols: 1,
  type: FormType.EDIT,
  mutation: updateAmazonDefaultUnitConfiguratorMutation,
  mutationKey: 'updateAmazonDefaultUnitConfigurator',
  query: getAmazonDefaultUnitConfiguratorQuery,
  queryVariables: { id: configuratorId.value },
  queryDataKey: 'amazonDefaultUnitConfigurator',
  submitUrl: { name: 'integrations.integrations.show', params: { type: type.value, id: integrationId }, query: { tab: 'defaultUnits' } },
  fields: [
    { type: FieldType.Hidden, name: 'id', value: configuratorId.value },
    { type: FieldType.Text, name: 'name', label: t('shared.labels.name'), disabled: true },
    { type: FieldType.Text, name: 'code', label: t('integrations.show.properties.labels.code'), disabled: true },
    { type: FieldType.Text, name: 'marketplace', label: t('integrations.show.propertySelectValues.labels.marketplace'), disabled: true },
    { type: FieldType.Choice, name: 'selectedUnit', label: t('shared.labels.unit'), labelBy: 'name', valueBy: 'value', options: [], removable: false },
  ],
};

const defaultTranslations: FormConfigDefaultTranslations = {
  submitLabel: t('shared.button.save'),
  cancelLabel: t('shared.button.back'),
  submitAndContinueLabel: t('shared.button.saveAndContinue'),
  deleteLabel: t('shared.button.delete'),
  showLabel: t('shared.button.show'),
};

const enhancedConfig = ref<FormConfig>(getEnhancedConfig(formConfig, defaultTranslations));

const form = reactive({
  id: configuratorId.value,
  name: '',
  code: '',
  marketplaceName: '',
  marketplaceId: null as string | null,
  selectedUnit: null as string | null,
  choices: [] as any[],
});

const updatableForm = computed(() => ({
  id: form.id,
  selectedUnit: form.selectedUnit,
}));

const marketplaceEditPath = computed(() =>
  form.marketplaceId
    ? {
        name: 'integrations.stores.edit',
        params: { type: type.value, id: form.marketplaceId },
        query: { integrationId },
      }
    : null,
);

onMounted(async () => {
  const { data } = await apolloClient.query({
    query: getAmazonDefaultUnitConfiguratorQuery,
    variables: { id: configuratorId.value },
    fetchPolicy: 'cache-first',
  });

  const cfg = data?.amazonDefaultUnitConfigurator;
  form.name = cfg?.name || '';
  form.code = cfg?.code || '';
  form.marketplaceName = cfg?.marketplace?.name || '';
  form.marketplaceId = cfg?.marketplace?.id || null;
  form.selectedUnit = cfg?.selectedUnit || null;
  form.choices = cfg?.choices || [];

  if (!isWizard) return;

  const { nextId, last } = await fetchNextUnmapped();
  nextWizardId.value = nextId;

  enhancedConfig.value.addSubmitAndContinue = false;
  enhancedConfig.value.cancelUrl = {
    name: 'integrations.integrations.show',
    params: { type: type.value, id: integrationId },
    query: { tab: 'defaultUnits' },
  };

  if (nextId) {
    enhancedConfig.value.submitUrl = {
      name: 'integrations.amazonDefaultUnitConfigurators.edit',
      params: { type: type.value, id: nextId },
      query: { integrationId, salesChannelId, wizard: '1' },
    };
    enhancedConfig.value.submitLabel = t('integrations.show.mapping.saveAndMapNext');
  } else if (last) {
    enhancedConfig.value.submitUrl = {
      name: 'integrations.integrations.show',
      params: { type: type.value, id: integrationId },
      query: { tab: 'defaultUnits' },
    };
  } else {
    Toast.success(t('integrations.show.mapping.allMappedSuccess'));
    router.push({ name: 'integrations.integrations.show', params: { type: type.value, id: integrationId }, query: { tab: 'defaultUnits' } });
  }
});

const fetchNextUnmapped = async (): Promise<{ nextId: string | null; last: boolean }> => {
  const { data } = await apolloClient.query({
    query: amazonDefaultUnitConfiguratorsQuery,
    variables: {
      first: 2,
      filter: {
        salesChannel: { id: { exact: salesChannelId } },
        mappedLocally: false,
      },
    },
    fetchPolicy: 'network-only',
  });

  const edges = data?.amazonDefaultUnitConfigurators?.edges || [];
  let nextId: string | null = null;
  for (const edge of edges) {
    if (edge.node.id !== configuratorId.value) {
      nextId = edge.node.id;
      break;
    }
  }
  const last = edges.length === 1 && edges[0].node.id === configuratorId.value;
  return { nextId, last };
};
</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.show', params: { id: integrationId, type: type }, query: { tab: 'defaultUnits' } }, name: t('integrations.show.amazon.title') },
          { name: t('integrations.show.mapSelectValue') }
        ]"
      />
    </template>
    <template v-slot:content>
      <div class="space-y-10 divide-y divide-gray-900/10 mt-4">
        <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div class="px-4 py-6 sm:p-8">
              <div class="grid max-w grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                <div class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('shared.labels.name') }}</Label>
                    </FlexCell>
                    <FlexCell>{{ form.name }}</FlexCell>
                  </Flex>
                </div>
                <div class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('integrations.show.properties.labels.code') }}</Label>
                    </FlexCell>
                    <FlexCell>{{ form.code }}</FlexCell>
                  </Flex>
                </div>
                <div class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('integrations.show.propertySelectValues.labels.marketplace') }}</Label>
                    </FlexCell>
                    <FlexCell>
                      <Link v-if="marketplaceEditPath" :path="marketplaceEditPath">{{ form.marketplaceName }}</Link>
                      <span v-else>{{ form.marketplaceName }}</span>
                    </FlexCell>
                  </Flex>
                </div>
                <div class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('shared.labels.unit') }}</Label>
                    </FlexCell>
                    <FlexCell>
                      <Selector v-model="form.selectedUnit" :options="form.choices" label-by="name" value-by="value" filterable />
                    </FlexCell>
                  </Flex>
                </div>
              </div>
            </div>
            <SubmitButtons :config="enhancedConfig" :form="updatableForm" />
          </div>
        </div>
      </div>
    </template>
  </GeneralTemplate>
</template>
