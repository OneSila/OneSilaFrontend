<script setup lang="ts">
import { computed, defineProps, onMounted, Ref, ref } from 'vue';
import { useI18n } from "vue-i18n";
import {  FormType } from "../product";
import { FieldType, ProductType } from "../../../../../../shared/utils/constants";
import { Label } from "../../../../../../shared/components/atoms/label";
import { Toggle } from "../../../../../../shared/components/atoms/toggle";
import { FieldQuery } from "../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import { productsQuerySelector } from "../../../../../../shared/api/queries/products.js";
import { QueryFormField } from "../../../../../../shared/components/organisms/general-form/formConfig";

const props = defineProps<{ form: FormType, preselectedParentId?: string | null, disableParentSelector?: boolean }>();
const { t } = useI18n();

const aliasParentProductField = computed<QueryFormField>(() => ({
  type: FieldType.Query,
  name: 'aliasParentProduct',
  label: t('products.products.create.wizard.stepAlias.labels.aliasParent'),
  labelBy: 'name',
  valueBy: 'id',
  query: productsQuerySelector,
  dataKey: 'products',
  isEdge: true,
  multiple: false,
  filterable: true,
  disabled: props.disableParentSelector,
  queryVariables: {
    filter: { NOT: { type: { exact: ProductType.Alias } } }
  }
}));

onMounted(() => {
  if (props.preselectedParentId) {
    props.form.aliasParentProduct.id = props.preselectedParentId;
  }
});

</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">
      {{ t('products.products.create.wizard.stepAlias.content') }}
    </h1>
    <hr />

    <Flex class="mt-8" center>
      <FlexCell center>
        <Flex vertical class="gap-4">
          <FlexCell>
            <Label class="font-semibold block text-sm leading-6 text-gray-900">
              {{ t('products.products.create.wizard.stepAlias.labels.aliasParent') }}
            </Label>
          </FlexCell>
          <FlexCell>
            <FieldQuery
              class="w-96"
              v-model="form.aliasParentProduct.id"
              :field="aliasParentProductField"
            />
          </FlexCell>
        </Flex>
      </FlexCell>
    </Flex>

    <Flex class="mt-4 gap-4" center>
      <FlexCell center>
        <Flex class="gap-2">
          <FlexCell>
            <Label class="font-semibold block text-sm leading-6 text-gray-900">
              {{ t('products.products.create.wizard.stepAlias.labels.copyImages') }}
            </Label>
          </FlexCell>
          <FlexCell>
            <Toggle v-model="form.aliasCopyImages" />
          </FlexCell>
        </Flex>
        <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
          <p>{{ t('products.products.create.wizard.stepAlias.helpText.copyImages') }}</p>
        </div>
      </FlexCell>
    </Flex>

    <Flex class="mt-4 gap-4" center>
      <FlexCell center>
        <Flex class="gap-2">
          <FlexCell>
            <Label class="font-semibold block text-sm leading-6 text-gray-900">
              {{ t('products.products.create.wizard.stepAlias.labels.copyProperties') }}
            </Label>
          </FlexCell>
          <FlexCell>
            <Toggle v-model="form.aliasCopyProductProperties" />
          </FlexCell>
        </Flex>
        <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
          <p>{{ t('products.products.create.wizard.stepAlias.helpText.copyProperties') }}</p>
        </div>
      </FlexCell>
    </Flex>
  </div>
</template>
