<script setup lang="ts">
import {onMounted, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import { GeneralForm } from "../../../../../../../../../shared/components/organisms/general-form";
import { useRoute } from "vue-router";
import { amazonProductTypeEditFormConfigConstructor } from "../configs";
import apolloClient from "../../../../../../../../../../apollo-client";
import {propertiesQuery} from "../../../../../../../../../shared/api/queries/properties";
import {Link} from "../../../../../../../../../shared/components/atoms/link";
import {Button} from "../../../../../../../../../shared/components/atoms/button";

const { t } = useI18n();
const route = useRoute();

const productTypeId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId ? route.query.integrationId.toString() : '';
const propertyProductTypeId = ref<string | null>(null);

const formConfig = amazonProductTypeEditFormConfigConstructor(t, type.value, productTypeId.value, integrationId);

const fetchProductType = async () => {
    const {data} = await apolloClient.query({
      query: propertiesQuery,
      variables: {filter: {isProductType: { exact: true } }}
    })

    if (data && data.properties && data.properties.edges && data.properties.edges.length == 1) {
      propertyProductTypeId.value = data.properties.edges[0].node.id;
    }
}

onMounted(fetchProductType);

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
          <Link :path="{ name: 'properties.values.create', query: { propertyId: propertyProductTypeId, isRule: '1', amazonRuleId: `${productTypeId}__${integrationId}` } }">
            <Button type="button" class="btn btn-primary">
                {{  t('properties.rule.create.title') }}
            </Button>
          </Link>
      </div>
    </template>

    <template v-slot:content>
      <GeneralForm :config="formConfig" />
    </template>
  </GeneralTemplate>
</template>
