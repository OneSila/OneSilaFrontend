<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { RouteLocationRaw } from 'vue-router';
import { useI18n } from 'vue-i18n';
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import { GeneralForm } from "../../../../../../../../../shared/components/organisms/general-form";
import {
  productPropertiesRulesQuery,
  propertiesQuerySelector,
} from "../../../../../../../../../shared/api/queries/properties.js";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { ConfigTypes } from "../../../../../../../../../shared/utils/constants";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { Accordion } from "../../../../../../../../../shared/components/atoms/accordion";
import { FormConfig } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import {
  getListingQuery,
  getListingQueryKey,
  getProductTypeQueryDataKey,
  productTypeEditFormConfigConstructor,
} from "../configs";
import apolloClient from "../../../../../../../../../../apollo-client";
import { IntegrationTypes } from "../../../../../../integrations";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const props = defineProps<{ productType: any | null }>();

const productTypeId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId ? route.query.integrationId.toString() : '';
const salesChannelId = route.query.salesChannelId ? route.query.salesChannelId.toString() : '';
const isWizard = route.query.wizard === '1';
const defaultRuleId = route.query.createPropertySelectValueId ? route.query.createPropertySelectValueId.toString() : null;
const resolvedDefaultRuleId = ref<string | null>(null);

const propertyProductTypeId = ref<string | null>(null);
const formData = ref<Record<string, any>>({});
const formConfig = ref<FormConfig | null>(null);
const nextWizardId = ref<string | null>(null);
const items = ref<any[]>([]);

const listingQuery = computed(() => getListingQuery(type.value));
const listingQueryKey = computed(() => getListingQueryKey(type.value));
const queryDataKey = computed(() => getProductTypeQueryDataKey(type.value));
const isAmazon = computed(() => type.value === IntegrationTypes.Amazon);

const configTypeChoices = [
  { id: ConfigTypes.REQUIRED_IN_CONFIGURATOR, text: t('properties.rule.configTypes.requiredInConfigurator.title') },
  { id: ConfigTypes.OPTIONAL_IN_CONFIGURATOR, text: t('properties.rule.configTypes.optionalInConfigurator.title') },
  { id: ConfigTypes.REQUIRED, text: t('properties.rule.configTypes.required.title') },
  { id: ConfigTypes.OPTIONAL, text: t('properties.rule.configTypes.optional.title') },
];

const accordionItems = [
  { name: 'items', label: t('integrations.imports.types.schema'), icon: 'sitemap' },
];

const integrationTitle = computed(() => t(`integrations.show.${type.value}.title`));

const getItemProperty = (item: any) => (isAmazon.value ? item.remoteProperty : item.ebayProperty);
const getItemName = (item: any) => {
  const property = getItemProperty(item);
  if (!property) return '';
  return isAmazon.value ? property.name : property.localizedName || property.translatedName || '';
};
const getItemCode = (item: any) => {
  if (!isAmazon.value) {
    return '';
  }
  return getItemProperty(item)?.code || '';
};
const isItemMappedLocally = (item: any) => Boolean(getItemProperty(item)?.mappedLocally);

const extractItems = (data: any) => {
  if (!data) return [];
  return isAmazon.value ? data.amazonproducttypeitemSet || [] : data.items || [];
};

const updateItemsFromData = (data: any) => {
  items.value = extractItems(data);
};

const setupFormConfig = () => {
  formConfig.value = productTypeEditFormConfigConstructor(
    t,
    type.value,
    productTypeId.value,
    integrationId,
    resolvedDefaultRuleId.value,
  );
  if (formConfig.value && props.productType) {
    formConfig.value.queryData = { [queryDataKey.value]: props.productType };
    updateItemsFromData(props.productType);
  }
};

const fetchNextUnmapped = async (): Promise<{ nextId: string | null; last: boolean }> => {
  const { data } = await apolloClient.query({
    query: listingQuery.value,
    variables: {
      first: 2,
      filter: {
        salesChannel: { id: { exact: salesChannelId } },
        mappedLocally: false,
      },
    },
    fetchPolicy: 'network-only',
  });
  const edges = data?.[listingQueryKey.value]?.edges || [];
  let nextId: string | null = null;
  for (const edge of edges) {
    if (edge.node.id !== productTypeId.value) {
      nextId = edge.node.id;
      break;
    }
  }
  const last = edges.length === 1 && edges[0]?.node?.id === productTypeId.value;
  return { nextId, last };
};

const fetchProductType = async () => {
  const { data } = await apolloClient.query({
    query: propertiesQuerySelector,
    variables: { filter: { isProductType: { exact: true } } },
  });

  if (data && data.properties && data.properties.edges && data.properties.edges.length === 1) {
    propertyProductTypeId.value = data.properties.edges[0].node.id;
  }
};

const fetchDefaultRuleId = async () => {
  if (!defaultRuleId) return;

  const { data } = await apolloClient.query({
    query: productPropertiesRulesQuery,
    variables: {
      filter: {
        productType: {
          id: {
            exact: defaultRuleId,
          },
        },
      },
    },
  });

  const ruleNode = data?.productPropertiesRules?.edges?.[0]?.node;
  if (ruleNode?.productType?.id === defaultRuleId) {
    resolvedDefaultRuleId.value = ruleNode.id;
  }
};

onMounted(async () => {
  await fetchProductType();
  await fetchDefaultRuleId();
  setupFormConfig();

  if (!isWizard || formConfig.value == null) return;

  const { nextId, last } = await fetchNextUnmapped();
  nextWizardId.value = nextId;

  formConfig.value.addSubmitAndContinue = false;
  formConfig.value.cancelUrl = {
    name: 'integrations.integrations.show',
    params: { type: type.value, id: integrationId },
    query: { tab: 'productRules' },
  };

  if (nextId) {
    formConfig.value.submitUrl = {
      name: 'integrations.amazonProductTypes.edit',
      params: { type: type.value, id: nextId },
      query: { integrationId, salesChannelId, wizard: '1' },
    };
    formConfig.value.submitLabel = t('integrations.show.mapping.saveAndMapNext');
  } else if (last) {
    formConfig.value.submitUrl = {
      name: 'integrations.integrations.show',
      params: { type: type.value, id: integrationId },
      query: { tab: 'productRules' },
    };
  } else {
    Toast.success(t('integrations.show.mapping.allMappedSuccess'));
    router.push({
      name: 'integrations.integrations.show',
      params: { type: type.value, id: integrationId },
      query: { tab: 'productRules' },
    });
  }
});

const handleSetData = (data: any) => {
  updateItemsFromData(data?.[queryDataKey.value]);
};

const handleFormUpdate = (form: any) => {
  formData.value = form;
};

const buildPropertyPath = (item: any): RouteLocationRaw | null => {
  const property = getItemProperty(item);
  if (!property?.id) {
    return null;
  }
  const routeName = isAmazon.value ? 'integrations.amazonProperties.edit' : 'integrations.ebayProperties.edit';
  return {
    name: routeName,
    params: { type: type.value, id: property.id },
    query: { integrationId, salesChannelId },
  };
};

const mappedItems = computed(() =>
  items.value.map((item) => ({
    item,
    propertyPath: buildPropertyPath(item),
  }))
);

const shouldShowAdditionalButton = computed(() => isAmazon.value && Boolean(propertyProductTypeId.value));
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
              query: { tab: 'productRules' },
            },
            name: integrationTitle,
          },
          { name: t('integrations.show.mapProductType') },
        ]"
      />
    </template>

    <template #content>
      <GeneralForm v-if="formConfig" :config="formConfig" @form-updated="handleFormUpdate" @set-data="handleSetData">
        <template v-if="shouldShowAdditionalButton" #additional-button>
          <Link
            :path="{
              name: 'properties.values.create',
              query: {
                propertyId: propertyProductTypeId,
                isRule: '1',
                amazonRuleId: `${productTypeId}__${integrationId}__${salesChannelId}__${isWizard ? '1' : '0'}`,
                value: formData.name,
              },
            }"
          >
            <Button type="button" class="btn btn-info">
              {{ t('integrations.show.generateProductType') }}
            </Button>
          </Link>
        </template>
      </GeneralForm>

      <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3 mt-4">
        <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <Accordion v-if="items.length" :items="accordionItems">
            <template #items>
              <div class="max-h-[700px] overflow-y-auto  rounded-md custom-scrollbar overflow-x-auto">
                <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
                  <thead>
                    <tr>
                      <th class="p-2 text-left">{{ t('shared.labels.name') }}</th>
                      <th v-if="isAmazon" class="p-2 text-left">{{ t('integrations.show.properties.labels.code') }}</th>
                      <th class="p-2 text-left">{{ t('integrations.show.mapping.mappedLocally') }}</th>
                      <th class="p-2 text-left">{{ t('shared.labels.type') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="entry in mappedItems" :key="entry.item.id">
                      <td class="p-2">
                        <Link v-if="entry.propertyPath" :path="entry.propertyPath">
                          {{ getItemName(entry.item) }}
                        </Link>
                        <span v-else>{{ getItemName(entry.item) }}</span>
                      </td>
                      <td v-if="isAmazon" class="p-2">{{ getItemCode(entry.item) }}</td>
                      <td class="p-2">
                        <Icon v-if="isItemMappedLocally(entry.item)" name="check-circle" class="text-green-500" />
                        <Icon v-else name="times-circle" class="text-red-500" />
                      </td>
                      <td class="p-2">{{ configTypeChoices.find((c) => c.id === entry.item.remoteType)?.text }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </Accordion>
        </div>
      </div>
    </template>
  </GeneralTemplate>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 10px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4361EE;
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #c0c0c0;
}

.custom-scrollbar {
  padding-right: 15px;
}
</style>
