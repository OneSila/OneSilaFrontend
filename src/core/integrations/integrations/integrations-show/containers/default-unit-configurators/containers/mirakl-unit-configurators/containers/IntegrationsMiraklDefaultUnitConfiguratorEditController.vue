<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import { Label } from "../../../../../../../../../shared/components/atoms/label";
import { Flex, FlexCell } from "../../../../../../../../../shared/components/layouts/flex";
import { SubmitButtons } from "../../../../../../../../../shared/components/organisms/general-form/containers/submit-buttons";
import { Selector } from "../../../../../../../../../shared/components/atoms/selector";
import { FormConfig, FormConfigDefaultTranslations, FormType, getEnhancedConfig } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../../../../../../shared/utils/constants";
import apolloClient from "../../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import { updateMiraklPropertyMutation } from "../../../../../../../../../shared/api/mutations/salesChannels.js";
import {
  getMiraklPropertyQuery,
  miraklPropertiesQuery,
  miraklPropertySelectValuesQuerySelector,
} from "../../../../../../../../../shared/api/queries/salesChannels.js";
import { MIRAKL_REPRESENTATION_TYPE_UNIT } from "../../../../properties/containers/mirakl-properties/representationTypes";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const propertyId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId?.toString() || '';
const salesChannelId = route.query.salesChannelId?.toString() || '';
const isWizard = route.query.wizard === '1';

const formConfig: FormConfig = {
  cols: 1,
  type: FormType.EDIT,
  mutation: updateMiraklPropertyMutation,
  mutationKey: 'updateMiraklProperty',
  submitUrl: {
    name: 'integrations.integrations.show',
    params: { type: type.value, id: integrationId },
    query: { tab: 'defaultUnits' },
  },
  fields: [
    { type: FieldType.Hidden, name: 'id', value: propertyId.value },
    { type: FieldType.Text, name: 'selectedUnit' },
  ],
  transformSubmitData: (cleanedData: Record<string, any>) => ({
    id: cleanedData.id,
    defaultValue: cleanedData.selectedUnit || '',
  }),
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
  id: propertyId.value,
  name: '',
  code: '',
  selectedUnit: null as string | null,
  choices: [] as { name: string; value: string }[],
});

const updatableForm = computed(() => ({
  id: form.id,
  selectedUnit: form.selectedUnit,
}));

const selectedUnitOption = computed(() => {
  if (!form.selectedUnit) {
    return null;
  }

  return form.choices.find((choice) => choice.value === form.selectedUnit) || null;
});

const fetchNextUnmapped = async (): Promise<{ nextId: string | null; last: boolean }> => {
  const { data } = await apolloClient.query({
    query: miraklPropertiesQuery,
    variables: {
      first: 100,
      filter: {
        salesChannel: { id: { exact: salesChannelId } },
        representationType: { exact: MIRAKL_REPRESENTATION_TYPE_UNIT },
      },
    },
    fetchPolicy: 'network-only',
  });

  const edges = (data?.miraklProperties?.edges || []).filter((edge: any) => !edge?.node?.defaultValue);
  let nextId: string | null = null;
  for (const edge of edges) {
    if (edge.node.id !== propertyId.value) {
      nextId = edge.node.id;
      break;
    }
  }

  const last = edges.length === 1 && edges[0]?.node?.id === propertyId.value;
  return { nextId, last };
};

const fetchUnitChoices = async () => {
  const choicesMap = new Map<string, { name: string; value: string }>();
  let after: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const { data } = await apolloClient.query({
      query: miraklPropertySelectValuesQuerySelector,
      variables: {
        first: 100,
        ...(after ? { after } : {}),
        filter: {
          remoteProperty: { id: { exact: propertyId.value } },
        },
      },
      fetchPolicy: 'network-only',
    });

    const connection = data?.miraklPropertySelectValues;
    const edges = connection?.edges || [];

    edges.forEach((edge: any) => {
      const node = edge.node;
      const value = node?.code || node?.value || '';
      const label = node?.label || node?.value || node?.code || '';

      if (value) {
        choicesMap.set(value, {
          name: label,
          value,
        });
      }
    });

    hasNextPage = Boolean(connection?.pageInfo?.hasNextPage);
    after = connection?.pageInfo?.endCursor || null;
  }

  if (form.selectedUnit && !choicesMap.has(form.selectedUnit)) {
    choicesMap.set(form.selectedUnit, {
      name: form.selectedUnit,
      value: form.selectedUnit,
    });
  }

  form.choices = Array.from(choicesMap.values());
};

onMounted(async () => {
  const { data } = await apolloClient.query({
    query: getMiraklPropertyQuery,
    variables: { id: propertyId.value },
    fetchPolicy: 'cache-first',
  });

  const property = data?.miraklProperty;
  form.name = property?.name || '';
  form.code = property?.code || '';
  form.selectedUnit = property?.defaultValue || null;

  await fetchUnitChoices();

  enhancedConfig.value.cancelUrl = {
    name: 'integrations.integrations.show',
    params: { type: type.value, id: integrationId },
    query: { tab: 'defaultUnits' },
  };

  if (!isWizard) {
    return;
  }

  const { nextId, last } = await fetchNextUnmapped();
  enhancedConfig.value.addSubmitAndContinue = false;

  if (nextId) {
    enhancedConfig.value.submitUrl = {
      name: 'integrations.miraklDefaultUnitConfigurators.edit',
      params: { type: type.value, id: nextId },
      query: { integrationId, salesChannelId, wizard: '1' },
    };
    enhancedConfig.value.submitLabel = t('integrations.show.mapping.saveAndMapNext');
    return;
  }

  if (last) {
    enhancedConfig.value.submitUrl = {
      name: 'integrations.integrations.show',
      params: { type: type.value, id: integrationId },
      query: { tab: 'defaultUnits' },
    };
    return;
  }

  Toast.success(t('integrations.show.mapping.allMappedSuccess'));
  router.push({
    name: 'integrations.integrations.show',
    params: { type: type.value, id: integrationId },
    query: { tab: 'defaultUnits' },
  });
});
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          {
            path: {
              name: 'integrations.integrations.show',
              params: { id: integrationId, type: type },
              query: { tab: 'defaultUnits' },
            },
            name: t('integrations.show.mirakl.title'),
          },
          { name: t('integrations.show.sections.defaultUnits') },
        ]"
      />
    </template>
    <template #content>
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
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">
                        {{ t('integrations.show.mirakl.defaultUnits.labels.selectedUnit') }}
                      </Label>
                    </FlexCell>
                    <FlexCell>
                      <Selector
                        v-model="form.selectedUnit"
                        :options="form.choices"
                        label-by="name"
                        value-by="value"
                        filterable
                        removable
                      />
                    </FlexCell>
                  </Flex>
                </div>
                <div class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">
                        {{ t('integrations.show.mirakl.defaultUnits.labels.currentValue') }}
                      </Label>
                    </FlexCell>
                    <FlexCell>{{ form.selectedUnit || '—' }}</FlexCell>
                  </Flex>
                </div>
                <div class="col-span-full">
                  <Flex vertical>
                    <FlexCell>
                      <Label class="font-semibold block text-sm leading-6 text-gray-900">
                        {{ t('integrations.show.mirakl.defaultUnits.labels.currentLabel') }}
                      </Label>
                    </FlexCell>
                    <FlexCell>{{ selectedUnitOption?.name || '—' }}</FlexCell>
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
