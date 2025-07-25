<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import {Breadcrumbs} from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import {GeneralForm} from "../../../../../../../../../shared/components/organisms/general-form";
import {useRoute} from "vue-router";
import {amazonProductTypeEditFormConfigConstructor, listingQuery} from "../configs";
import apolloClient from "../../../../../../../../../../apollo-client";
import {
  productPropertiesRulesQuery,
  propertiesQuery
} from "../../../../../../../../../shared/api/queries/properties.js";
import {Link} from "../../../../../../../../../shared/components/atoms/link";
import {Button} from "../../../../../../../../../shared/components/atoms/button";
import {Card} from "../../../../../../../../../shared/components/atoms/card";
import {Badge} from "../../../../../../../../../shared/components/atoms/badge";
import {getPropertyTypeBadgeMap} from "../../../../../../../../properties/properties/configs";
import {ConfigTypes} from "../../../../../../../../../shared/utils/constants";
import {Icon} from "../../../../../../../../../shared/components/atoms/icon";
import {Accordion} from "../../../../../../../../../shared/components/atoms/accordion";
import {FormConfig, FormType} from "../../../../../../../../../shared/components/organisms/general-form/formConfig";
import {Toast} from "../../../../../../../../../shared/modules/toast";
import {HelpSection} from "../../../../../../../../../shared/components/organisms/general-form/containers/help-section";
import {FormCreate} from "../../../../../../../../../shared/components/organisms/general-form/containers/form-create";
import {FormEdit} from "../../../../../../../../../shared/components/organisms/general-form/containers/form-edit";

const {t} = useI18n();
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

const handleSetData = (data: any) => {
  items.value = data?.amazonProductType?.amazonproducttypeitemSet || [];
};

const configTypeChoices = [
  {id: ConfigTypes.REQUIRED_IN_CONFIGURATOR, text: t('properties.rule.configTypes.requiredInConfigurator.title')},
  {id: ConfigTypes.OPTIONAL_IN_CONFIGURATOR, text: t('properties.rule.configTypes.optionalInConfigurator.title')},
  {id: ConfigTypes.REQUIRED, text: t('properties.rule.configTypes.required.title')},
  {id: ConfigTypes.OPTIONAL, text: t('properties.rule.configTypes.optional.title')}
];

const propertyTypeBadgeMap = getPropertyTypeBadgeMap(t);

const accordionItems = [
  {name: 'items', label: t('integrations.imports.types.schema'), icon: 'sitemap'},
];

const setupFormConfig = () => {
  formConfig.value = amazonProductTypeEditFormConfigConstructor(
      t,
      type.value,
      productTypeId.value,
      integrationId,
      resolvedDefaultRuleId.value
  );
  if (props.productType) {
    formConfig.value.queryData = { amazonProductType: props.productType };
  }
};

const fetchNextUnmapped = async (): Promise<{ nextId: string | null; last: boolean }> => {
  const {data} = await apolloClient.query({
    query: listingQuery,
    variables: {
      first: 2,
      filter: {
        salesChannel: {id: {exact: salesChannelId}},
        mappedLocally: false,
      },
    },
    fetchPolicy: 'network-only',
  });
  const edges = data?.amazonProductTypes?.edges || [];
  let nextId: string | null = null;
  for (const edge of edges) {
    if (edge.node.id !== productTypeId.value) {
      nextId = edge.node.id;
      break;
    }
  }
  const last = edges.length === 1 && edges[0].node.id === productTypeId.value;
  return {nextId, last};
};

const fetchProductType = async () => {
  const {data} = await apolloClient.query({
    query: propertiesQuery,
    variables: {filter: {isProductType: {exact: true}}}
  })

  if (data && data.properties && data.properties.edges && data.properties.edges.length == 1) {
    propertyProductTypeId.value = data.properties.edges[0].node.id;
  }
}

const fetchDefaultRuleId = async () => {
  if (!defaultRuleId) return;

  const {data} = await apolloClient.query({
    query: productPropertiesRulesQuery,
    variables: {
      filter: {
        productType: {
          id: {
            exact: defaultRuleId
          }
        }
      }
    }
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

  const {nextId, last} = await fetchNextUnmapped();
  nextWizardId.value = nextId;

  formConfig.value.addSubmitAndContinue = false;
  formConfig.value.cancelUrl = {
    name: 'integrations.integrations.show',
    params: {type: type.value, id: integrationId},
    query: {tab: 'productRules'}
  };

  if (nextId) {
    formConfig.value.submitUrl = {
      name: 'integrations.amazonProductTypes.edit',
      params: {type: type.value, id: nextId},
      query: {integrationId, salesChannelId, wizard: '1'},
    };
    formConfig.value.submitLabel = t('integrations.show.mapping.saveAndMapNext');
  } else if (last) {
    formConfig.value.submitUrl = {
      name: 'integrations.integrations.show',
      params: {type: type.value, id: integrationId},
      query: {tab: 'productRules'}
    };
  } else {
    Toast.success(t('integrations.show.mapping.allMappedSuccess'));
    router.push({
      name: 'integrations.integrations.show',
      params: {type: type.value, id: integrationId},
      query: {tab: 'productRules'}
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
          { path: { name: 'integrations.integrations.show', params: {id: integrationId, type: type}, query: {tab: 'productRules'} }, name: t('integrations.show.amazon.title') },
          { name: t('integrations.show.mapProductType') }
        ]"/>
    </template>

    <template v-slot:content>
      <GeneralForm v-if="formConfig" :config="formConfig" @form-updated="handleFormUpdate" @set-data="handleSetData">
        <template #additional-button>
          <Link
              :path="{ name: 'properties.values.create', query: { propertyId: propertyProductTypeId, isRule: '1', amazonRuleId: `${productTypeId}__${integrationId}__${salesChannelId}__${isWizard ? '1' : '0'}`, value: formData.name } }">
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
                    <th class="p-2 text-left">{{ t('integrations.show.properties.labels.code') }}</th>
                    <th class="p-2 text-left">{{ t('integrations.show.mapping.mappedLocally') }}</th>
                    <th class="p-2 text-left">{{ t('shared.labels.type') }}</th>
                  </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="item in items" :key="item.id">
                    <td class="p-2">
                      <Link :path="{ name: 'integrations.amazonProperties.edit', params: { type: type, id: item.remoteProperty.id }, query: { integrationId, salesChannelId } }">
                        {{ item.remoteProperty.name }}
                      </Link>
                    </td>
                    <td class="p-2">{{ item.remoteProperty.code }}</td>
                    <td class="p-2">
                      <Icon v-if="item.remoteProperty.mappedLocally" name="check-circle" class="text-green-500"/>
                      <Icon v-else name="times-circle" class="text-red-500"/>
                    </td>
                    <td class="p-2">{{ configTypeChoices.find(c => c.id === item.remoteType)?.text }}</td>
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