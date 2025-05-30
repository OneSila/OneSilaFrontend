<script setup lang="ts">

import {useI18n} from 'vue-i18n';
import {Product, ProductPropertyValue} from "../../../../configs";
import {onMounted, ref, Ref, watch} from "vue";
import apolloClient from "../../../../../../../../apollo-client";
import {
  getPropertySelectValueQuery,
  productPropertiesQuery,
  productPropertiesRulesQuery, productPropertyTextTranslationsQuery,
  propertiesQuery
} from "../../../../../../../shared/api/queries/properties.js";
import {ConfigTypes, ProductType, PropertyTypes} from "../../../../../../../shared/utils/constants";
import {ValueInput} from "./value-input";
import {Loader} from "../../../../../../../shared/components/atoms/loader";
import {translationLanguagesQuery} from "../../../../../../../shared/api/queries/languages.js";
import {Selector} from "../../../../../../../shared/components/atoms/selector";
import {Icon} from "../../../../../../../shared/components/atoms/icon";


const {t} = useI18n();
const props = defineProps<{ product: Product }>();
const ruleId: Ref<string | null> = ref(null);

const values: Ref<ProductPropertyValue[]> = ref([]);
const lastSavedValues: Ref<ProductPropertyValue[]> = ref([]);
const loading = ref(false);
const language: Ref<string | null> = ref(null);


const fetchProductTypeValue = async (productTypePropertyId) => {
  ruleId.value = null;

  const {data} = await apolloClient.query({
    query: productPropertiesQuery,
    variables: {filter: {property: {id: {exact: productTypePropertyId}}, product: {id: {exact: props.product.id}}}},
    fetchPolicy: 'network-only'
  });

  if (data && data.productProperties && data.productProperties.edges && data.productProperties.edges.length == 1) {
    const value = data.productProperties.edges[0].node;
    const existingItem = values.value.find(v => v.property.id === value.property.id);

    if (value.valueSelect && value.valueSelect.productpropertiesruleSet.length) {
      ruleId.value = value.valueSelect.productpropertiesruleSet[0].id;
    }

    if (existingItem) {
      existingItem.id = value.id;
      existingItem.valueSelect = {id: value.valueSelect.id};
    } else {
      const toAdd: ProductPropertyValue = {
        id: value.id,
        property: {
          id: value.property.id,
          name: value.property.name,
          type: value.property.type,
          isProductType: true,
        },
        valueSelect: {
          id: value.valueSelect.id
        },
        translation: {
          language: null
        }
      };
      values.value.push(toAdd);
    }

    return value.valueSelect.id;
  }

  return null;
};


const setCurrentLanguage = async () => {

  const {data} = await apolloClient.query({
    query: translationLanguagesQuery,
    fetchPolicy: 'network-only'
  });

  if (data && data.translationLanguages && data.translationLanguages.defaultLanguage) {
    const defaultLanguage = data.translationLanguages.defaultLanguage;
    language.value = defaultLanguage.code;
  }

};

const fetchPropertiesIds = async (productTypeValueId) => {

  const {data} = await apolloClient.query({
    query: productPropertiesRulesQuery,
    variables: {filter: {productType: {id: {exact: productTypeValueId}}}},
    fetchPolicy: 'network-only'
  })

  if (data && data.productPropertiesRules && data.productPropertiesRules.edges && data.productPropertiesRules.edges.length == 1) {
    const rule = data.productPropertiesRules.edges[0].node;
    const items = rule.items;
    const propertyIds: string[] = []

    for (const item of items) {
      const toAdd: ProductPropertyValue = {
        property: {
          id: item.property.id,
          name: item.property.name,
          type: item.property.type,
          isProductType: false,
          requireType: item.type
        },
        valueBoolean: undefined,
        valueInt: null,
        valueFloat: null,
        valueDate: null,
        valueDateTime: null,
        valueSelect: {id: null},
        valueMultiSelect: null,
        translation: {
          language: null
        }
      }
      values.value.push(toAdd);
      propertyIds.push(item.property.id)

      if ([PropertyTypes.TEXT, PropertyTypes.DESCRIPTION].includes(item.property.type) && language.value == null) {
        await setCurrentLanguage();
      }

    }

    return propertyIds
  }

  return [];
}

const setInitialValues = async (propertiesIds) => {
  const {data} = await apolloClient.query({
    query: productPropertiesQuery,
    variables: {filter: {property: {id: {inList: propertiesIds}}, product: {id: {exact: props.product.id}}}},
    fetchPolicy: 'network-only'
  });

  if (data && data.productProperties && data.productProperties.edges) {
    data.productProperties.edges.forEach(edge => {
      const value = edge.node;
      const existingItem = values.value.find(v => v.property.id === value.property.id);

      if (existingItem) {
        existingItem.id = value.id;
        existingItem.valueBoolean = value.valueBoolean ?? null;
        existingItem.valueInt = value.valueInt ?? null;
        existingItem.valueFloat = value.valueFloat ?? null;
        existingItem.valueDate = value.valueDate ?? null;
        existingItem.valueDateTime = value.valueDatetime ?? null;
        existingItem.valueSelect = value.valueSelect ? {id: value.valueSelect.id} : {id: null};
        existingItem.valueMultiSelect = value.valueMultiSelect ? value.valueMultiSelect.map(v => ({
          id: v.id,
          value: v.value
        })) : null;
      }
    });
  }

  return true;
};


const fetchRequiredProductType = async () => {

  const {data} = await apolloClient.query({
    query: propertiesQuery,
    variables: {filter: {isProductType: {exact: true}}},
    fetchPolicy: 'network-only'
  })

  if (data && data.properties && data.properties.edges && data.properties.edges.length == 1) {
    const productType = data.properties.edges[0].node
    const toAdd: ProductPropertyValue = {
      property: {
        id: productType.id,
        name: productType.name,
        type: productType.type,
        isProductType: true,
        requireType: ConfigTypes.REQUIRED
      },
      translation: {
        language: null
      }
    }
    values.value.push(toAdd);
    return productType.id;
  }

  return null;
}

const fetchRequiredAttributes = async (productTypePropertyId) => {

  const productTypeValueId = await fetchProductTypeValue(productTypePropertyId);

  if (props.product.type == ProductType.Configurable) {
    lastSavedValues.value = values.value;
    return
  }

  const propertyIds = await fetchPropertiesIds(productTypeValueId);
  await setInitialValues(propertyIds);

}

const fetchRequiredAttributesValues = async () => {
  loading.value = true
  values.value = [];
  language.value = null;
  const productTypePropertyId = await fetchRequiredProductType();
  await fetchRequiredAttributes(productTypePropertyId);
  loading.value = false
}

const handleUpdatedId = ({oldId, newId, isTranslation}) => {
  const index = values.value.findIndex(v => v.property.id === oldId);
  if (index !== -1) {
    if (isTranslation) {
      values.value[index].translation.id = newId;
    } else {
      values.value[index].id = newId;
    }
  }
};

const handleRemove = (id) => {
  const index = values.value.findIndex(v => v.property.id === id);

  if (index !== -1) {
    values.value[index].id = undefined
    values.value[index].valueBoolean = null;
    values.value[index].valueInt = null;
    values.value[index].valueFloat = null;
    values.value[index].valueDate = null;
    values.value[index].valueDateTime = null;
    values.value[index].valueSelect = {id: null};
    values.value[index].translation = {id: null, valueText: "", valueDescription: "", language: language.value};
    values.value[index].valueMultiSelect = null;
  }
};

const fetchFieldTranslation = async (value: ProductPropertyValue) => {

  if (language.value == null) {
    return
  }

  const {data} = await apolloClient.query({
    query: productPropertyTextTranslationsQuery,
    variables: {
      filter:
          {
            productProperty:
                {
                  property: {id: {exact: value.property.id}},
                  product: {id: {exact: props.product.id}}
                },
            language: {exact: language.value}
          }
    },
    fetchPolicy: 'network-only'
  });

  if (data && data.productPropertyTextTranslations && data.productPropertyTextTranslations.edges && data.productPropertyTextTranslations.edges.length == 1) {
    value.translation.id = data.productPropertyTextTranslations.edges[0].node.id;
    value.translation.valueText = data.productPropertyTextTranslations.edges[0].node.valueText;
    value.translation.valueDescription = data.productPropertyTextTranslations.edges[0].node.valueDescription;
  }

  return null;
};

const populateTranslatableFields = async () => {

  if (language.value == null) {
    return
  }

  for (const value of values.value) {
    if ([PropertyTypes.TEXT, PropertyTypes.DESCRIPTION].includes(value.property.type)) {
      value.translation.id = undefined;
      value.translation.valueDescription = undefined;
      value.translation.valueText = undefined;
      await fetchFieldTranslation(value);
      value.translation.language = language.value;
    }
  }
}

watch(language, populateTranslatableFields)
onMounted(fetchRequiredAttributesValues);

const getIconColor = (requireType: string, isFilled = false) => {

  if (isFilled) {
    if ([ConfigTypes.REQUIRED, ConfigTypes.REQUIRED_IN_CONFIGURATOR, ConfigTypes.OPTIONAL_IN_CONFIGURATOR].includes(requireType as ConfigTypes)) {
      return 'text-red-500';
    }
    if (requireType === ConfigTypes.OPTIONAL) {
      return 'text-orange-400';
    }
  }

  if ([ConfigTypes.REQUIRED, ConfigTypes.REQUIRED_IN_CONFIGURATOR, ConfigTypes.OPTIONAL_IN_CONFIGURATOR].includes(requireType as ConfigTypes)) {
    return 'text-red-500';
  }
  if (requireType === ConfigTypes.OPTIONAL) {
    return 'text-orange-400';
  }

  return 'text-gray-400';
};


const getExtendedTooltip = (metaType: string): string => {
  switch (metaType) {
    case 'REQUIRED':
      return t('properties.rule.configTypes.required.example');
    case 'OPTIONAL':
      return t('properties.rule.configTypes.optional.example');
    case 'FILLED':
      return t('properties.rule.configTypes.filled.example');
    default:
      return '';
  }
};


const requireTypes = [
  {value: ConfigTypes.REQUIRED, label: t('properties.rule.configTypes.required.title')},
  {value: ConfigTypes.OPTIONAL, label: t('properties.rule.configTypes.optional.title')},
  {value: 'FILLED', label: t('properties.rule.configTypes.filled.title')}
];




const handleValueUpdate = ({id, type, value, language}) => {
  const target = values.value.find(v => v.property.id === id);
  if (!target) return;

  switch (type) {
    case PropertyTypes.TEXT:
      target.translation.valueText = value;
      break;
    case PropertyTypes.DESCRIPTION:
      target.translation.valueDescription = value;
      break;
    case PropertyTypes.BOOLEAN:
      target.valueBoolean = value;
      break;
    case PropertyTypes.INT:
      target.valueInt = value;
      break;
    case PropertyTypes.FLOAT:
      target.valueFloat = value;
      break;
    case PropertyTypes.DATE:
      target.valueDate = value;
      break;
    case PropertyTypes.DATETIME:
      target.valueDateTime = value;
      break;
    case PropertyTypes.SELECT:
      target.valueSelect = {id: value};
      break;
    case PropertyTypes.MULTISELECT:
      target.valueMultiSelect = value.map(v => ({id: v}));
      break;
  }

  // Also update the language if it's a text/description field
  if ([PropertyTypes.TEXT, PropertyTypes.DESCRIPTION].includes(type)) {
    target.translation.language = language;
  }
};


</script>

<template>
  <div>
    <Flex between class="mb-2">
      <FlexCell grow center>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 ml-2 mb-4">
          <div v-for="(type, index) in requireTypes" :key="index" class="flex items-center space-x-2"
               :title="getExtendedTooltip(type.value)">
            <Icon name="circle-dot" :class="getIconColor(type.value)"/>
            <span>{{ type.label }}</span>
          </div>
        </div>
      </FlexCell>
      <FlexCell v-if="language">
        <ApolloQuery :query="translationLanguagesQuery">
          <template v-slot="{ result: { data } }">
            <Selector v-if="data"
                      v-model="language"
                      :options="data.translationLanguages.languages"
                      :removable="false"
                      :placeholder="t('products.translation.placeholders.language')"
                      class="w-32"
                      labelBy="name"
                      valueBy="code"
                      mandatory
                      filterable/>
          </template>
        </ApolloQuery>
      </FlexCell>
    </Flex>
    <Loader :loading="loading"/>
    <div class="mt-4 space-y-6">
  <div v-for="(val, index) in values" :key="val.property.id">
      <ValueInput
        v-if="!loading || [PropertyTypes.TEXT, PropertyTypes.DESCRIPTION].includes(val.property.type)"
        :product-id="product.id"
        :rule-id="ruleId"
        :value="val"
        @refetch="fetchRequiredAttributesValues"
        @update-id="handleUpdatedId"
        @update-value="handleValueUpdate"
        @remove="handleRemove"
      />
  </div>
</div>

  </div>
</template>

<style scoped>
.custom-table th,
.custom-table td {
  padding: 8px;
}

.custom-table th.left-align {
  text-align: left;
}

.custom-table th {
  width: 20%;
}

.custom-table td {
  width: 80%;
}
</style>