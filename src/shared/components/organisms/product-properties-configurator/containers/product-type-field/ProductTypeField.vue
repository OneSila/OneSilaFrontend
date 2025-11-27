<script setup lang="ts">

import { QueryFormField } from "../../../general-form/formConfig";
import { FieldType } from "../../../../../utils/constants";
import { productPropertiesRulesQuery, propertySelectValuesQuery } from "../../../../../api/queries/properties.js";
import { useI18n } from "vue-i18n";
import { defineEmits, onMounted, Ref, ref, watch } from "vue";
import { FieldQuery } from "../../../general-form/containers/form-fields/field-query";
import { Selector } from "../../../../atoms/selector";
import apolloClient from "../../../../../../../apollo-client";

const props = withDefaults(defineProps<{ productType: { id: string, value: string } | null; widthClass?: string }>(), {
  widthClass: 'w-96'
});
const localProductType = ref();
const productTypeField: Ref<QueryFormField | null> = ref(null);
const emit = defineEmits(['product-type-updated']);


if (props.productType === null) {
  localProductType.value = null;
} else {
  localProductType.value = props.productType.id;
}

const { t } = useI18n();

watch(() => localProductType.value, (newVal) => {
  if (newVal !== '') {
    emit('product-type-updated', newVal)
  }
});

const disabledChoices = [
  {id: props.productType?.id, value: props.productType?.value}
]

const setField = async () => {
  let ids: string[] = []
  const {data} = await apolloClient.query({
    query: productPropertiesRulesQuery,
    fetchPolicy: 'cache-first'
  });

  if (data && data.productPropertiesRules && data.productPropertiesRules.edges.length > 0) {
      ids = data.productPropertiesRules.edges.map(rule => rule.node.productType.id);
  }

  productTypeField.value = {
    type: FieldType.Query,
    name: 'productType',
    label: t('properties.properties.labels.isProductType'),
    labelBy: 'value',
    valueBy: 'id',
    query: propertySelectValuesQuery,
    queryVariables: {
      filter: {
        property: { isProductType: { exact: true } },
        NOT: { id: { inList: ids } },
      },
    },
    dataKey: 'propertySelectValues',
    isEdge: true,
    multiple: false,
    filterable: true,
    formMapIdentifier: 'id',
  }

}

onMounted(setField);

</script>

<template>
  <div class="my-4">
    <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{  t('properties.properties.labels.isProductType') }}</label>
    <template v-if="productType == null">
      <FieldQuery v-if="productTypeField !== null" :class="props.widthClass" v-model="localProductType" :field="productTypeField"  />
    </template>
    <Selector v-else v-model="localProductType" :options="disabledChoices" value-by="id" label-by="value" disabled :class="props.widthClass" />
  </div>
</template>