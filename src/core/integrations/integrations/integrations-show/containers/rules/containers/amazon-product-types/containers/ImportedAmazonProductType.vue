<script setup lang="ts">
import {ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';
import {Breadcrumbs} from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import {TextInput} from "../../../../../../../../../shared/components/atoms/input-text";
import {Button} from "../../../../../../../../../shared/components/atoms/button";
import {FieldQuery} from "../../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import {salesChannelViewsQuery} from "../../../../../../../../../shared/api/queries/salesChannels.js";
import {suggestAmazonProductTypeMutation, updateAmazonProductTypeMutation} from "../../../../../../../../../shared/api/mutations/salesChannels.js";
import apolloClient from "../../../../../../../../../../apollo-client";
import {QueryFormField} from "../../../../../../../../../shared/components/organisms/general-form/formConfig";
import {FieldType} from "../../../../../../../../../shared/utils/constants";
import {Toast} from "../../../../../../../../../shared/modules/toast";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();

const productTypeId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = route.query.integrationId?.toString() || '';
const salesChannelId = route.query.salesChannelId?.toString() || '';
const isWizard = route.query.wizard === '1';

const marketplaceField: QueryFormField = {
  type: FieldType.Query,
  name: 'marketplace',
  label: t('integrations.show.propertySelectValues.labels.marketplace'),
  labelBy: 'name',
  valueBy: 'id',
  query: salesChannelViewsQuery,
  dataKey: 'salesChannelViews',
  isEdge: true,
  multiple: false,
  filterable: true,
  queryVariables: {filters: { salesChannel: { id: { exact: salesChannelId } } } }
};

const productName = ref('');
const marketplace = ref('');
const suggestions = ref<any[]>([]);
const selected = ref<string>('');

const fetchSuggestions = async () => {
  if (!productName.value || !marketplace.value) return;
  const {data} = await apolloClient.mutate({
    mutation: suggestAmazonProductTypeMutation,
    variables: {
      name: productName.value,
      marketplace: {id: marketplace.value}
    }
  });
  suggestions.value = data?.suggestAmazonProductType?.productTypes || [];
};

const save = async () => {
  if (!selected.value) return;
  await apolloClient.mutate({
    mutation: updateAmazonProductTypeMutation,
    variables: { data: { id: productTypeId.value, productTypeCode: selected.value, name: productName.value, imported: true } }
  });
  Toast.success(t('shared.success'));
  router.back();
};
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'integrations.integrations.list' }, name: t('integrations.title') }, { path: { name: 'integrations.integrations.show', params: {id: integrationId, type: type}, query: {tab: 'productRules'} }, name: t('integrations.show.amazon.title') }, { name: t('integrations.show.mapProductType') }]" />
    </template>
    <template #content>
      <div class="space-y-6">
        <div>
          <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('shared.labels.name') }}</label>
          <TextInput v-model="productName" class="w-full" />
          <p class="mt-1 text-sm leading-6 text-gray-400">{{ t('integrations.show.productRules.help.name') }}</p>
        </div>
        <div>
          <FieldQuery :field="marketplaceField" v-model="marketplace" />
        </div>
        <div>
          <Button type="button" class="btn btn-secondary" @click="fetchSuggestions">{{ t('shared.button.search') }}</Button>
        </div>
        <div v-if="suggestions.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="s in suggestions" :key="s.name" class="p-4 border rounded cursor-pointer" :class="{ 'border-primary': selected === s.name }" @click="selected = s.name">
            <strong>{{ s.displayName }}</strong>
            <p class="text-sm text-gray-500">{{ s.name }}</p>
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <Button type="button" class="btn btn-primary" @click="save">{{ t('shared.button.save') }}</Button>
          <Button type="button" class="btn btn-secondary" @click="router.back()">{{ t('shared.button.cancel') }}</Button>
        </div>
      </div>
    </template>
  </GeneralTemplate>
</template>
