<script setup lang="ts">
import {onMounted, ref} from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import { GeneralForm } from "../../../../../../../../../shared/components/organisms/general-form";
import { useRoute } from "vue-router";
import { amazonProductTypeEditFormConfigConstructor, listingQuery } from "../configs";
import apolloClient from "../../../../../../../../../../apollo-client";
import { productPropertiesRulesQuery, propertiesQuery } from "../../../../../../../../../shared/api/queries/properties.js";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { FormConfig } from "../../../../../../../../../shared/components/organisms/general-form/formConfig";
import { Toast } from "../../../../../../../../../shared/modules/toast";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

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

const setupFormConfig = () => {
  formConfig.value = amazonProductTypeEditFormConfigConstructor(
    t,
    type.value,
    productTypeId.value,
    integrationId,
    resolvedDefaultRuleId.value
  );
};

const fetchNextUnmapped = async (): Promise<{ nextId: string | null; last: boolean }> => {
  const { data } = await apolloClient.query({
    query: listingQuery,
    variables: {
      first: 2,
      filter: {
        salesChannel: { id: { exact: salesChannelId } },
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
  return { nextId, last };
};

const fetchProductType = async () => {
    const {data} = await apolloClient.query({
      query: propertiesQuery,
      variables: {filter: {isProductType: { exact: true } }}
    })

    if (data && data.properties && data.properties.edges && data.properties.edges.length == 1) {
      propertyProductTypeId.value = data.properties.edges[0].node.id;
    }
}

const fetchDefaultRuleId = async () => {
  if (!defaultRuleId) return;

  const { data } = await apolloClient.query({
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

  const { nextId, last } = await fetchNextUnmapped();
  nextWizardId.value = nextId;

  formConfig.value.addSubmitAndContinue = false;

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
      query: { tab: 'productRules' }
    };
  } else {
    Toast.success(t('integrations.show.mapping.allMappedSuccess'));
    router.push({ name: 'integrations.integrations.show', params: { type: type.value, id: integrationId }, query: { tab: 'productRules' } });
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
          { path: { name: 'integrations.integrations.show', params: {id: integrationId, type: type}, query: {tab: 'productRules'} }, name: t('integrations.show.amazon.title') }
        ]" />
    </template>

    <template v-slot:buttons>
        <div>
          <Link :path="{ name: 'properties.values.create', query: { propertyId: propertyProductTypeId, isRule: '1', amazonRuleId: `${productTypeId}__${integrationId}__${salesChannelId}__${isWizard ? '1' : '0'}`, value: formData.name } }">
            <Button type="button" class="btn btn-primary">
                {{  t('properties.rule.create.title') }}
            </Button>
          </Link>
      </div>
    </template>

    <template v-slot:content>
      <GeneralForm v-if="formConfig" :config="formConfig" @form-updated="handleFormUpdate" />
    </template>
  </GeneralTemplate>
</template>
