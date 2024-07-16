<script setup lang="ts">
import {computed, defineProps, ref} from 'vue';
import { useI18n } from "vue-i18n";
import { AdditonalFormFields, FormType } from "../product";
import { FieldQuery } from "../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import { QueryFormField } from "../../../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../../../shared/utils/constants";
import { supplierProductsQuery } from "../../../../../../shared/api/queries/purchasing.js";
import {TextInput} from "../../../../../../shared/components/atoms/input-text";
import {Label} from "../../../../../../shared/components/atoms/label";
import {companiesQuery} from "../../../../../../shared/api/queries/contacts.js";
import {supplierOnTheFlyConfig} from "../../../../../purchasing/suppliers/configs";
import {unitsQuery} from "../../../../../../shared/api/queries/units.js";

const props = defineProps<{form: FormType, additionalFieldsForm: AdditonalFormFields}>();
const emit = defineEmits(['set-product-supplier-name']);

const { t } = useI18n();

const getSupplierProduct = computed<QueryFormField>(() => ({
    type: FieldType.Query,
    name: 'supplierProduct',
    label: t('purchasing.products.show.title'),
    labelBy: 'name',
    valueBy: 'id',
    query: supplierProductsQuery,
    dataKey: 'supplierProducts',
    isEdge: true,
    multiple: false,
    filterable: true,
    optional: true,
    formMapIdentifier: 'id',
} as QueryFormField));

const getSupplier = computed<QueryFormField>(() => ({
  type: 'Query',
  name: 'supplier',
  label: t('purchasing.orders.labels.supplier'),
  labelBy: 'name',
  valueBy: 'id',
  query: companiesQuery,
  queryVariables: { filter: { 'isInternalCompany': false } },
  dataKey: 'companies',
  isEdge: true,
  multiple: false,
  filterable: true,
  disabled: props.additionalFieldsForm.supplierProduct.id !== null,
  formMapIdentifier: 'id',
  createOnFlyConfig: supplierOnTheFlyConfig(t),
} as QueryFormField));

const getUnit = computed<QueryFormField>(() => ({
  type: 'Query',
  name: 'unit',
  label: t('shared.labels.unit'),
  labelBy: 'name',
  valueBy: 'id',
  query: unitsQuery,
  dataKey: 'units',
  isEdge: true,
  multiple: false,
  filterable: true,
  disabled: props.additionalFieldsForm.supplierProduct.id !== null,
  removable: false,
  formMapIdentifier: 'id',
} as QueryFormField));

emit('set-product-supplier-name')

</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">{{ t('products.products.create.wizard.stepFour.simple.whereBuy') }}</h1>
    <hr>
    <Flex vertical>
      <FlexCell>
        <Flex class="mt-4 gap-4" center vertical>
          <FlexCell>
            <p class="text-lg">{{ t('products.products.create.wizard.stepFour.simple.add') }}</p>
          </FlexCell>

          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('purchasing.products.show.title') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <FieldQuery class="w-96" v-model="additionalFieldsForm.supplierProduct.id" :field="getSupplierProduct" :disabled="additionalFieldsForm.supplierProduct.id !== null" />
              </FlexCell>
            </Flex>
          </FlexCell>
        </Flex>
      </FlexCell>

      <FlexCell>
        <Flex class="my-8 px-96">
          <FlexCell center grow>
            <hr class="flex-grow border-t border-gray-500">
          </FlexCell>
          <FlexCell center>
            <span class="mx-2 text-black uppercase">{{ t('shared.labels.or')}}</span>
          </FlexCell>
          <FlexCell center grow>
            <hr class="flex-grow border-t border-gray-500">
          </FlexCell>
        </Flex>
      </FlexCell>

      <FlexCell>
        <Flex class="mt-4 gap-4" center vertical>
          <FlexCell>
            <p class="text-lg">{{ t('products.products.create.wizard.stepFour.simple.create') }}</p>
          </FlexCell>

          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('purchasing.products.labels.supplier') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <FieldQuery class="w-96" v-model="additionalFieldsForm.supplierProduct.supplier.id" :field="getSupplier" />
              </FlexCell>
            </Flex>
          </FlexCell>

          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('shared.labels.name') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <TextInput class="w-96" v-model="additionalFieldsForm.supplierProduct.name" :placeholder="t('shared.placeholders.name')" :disabled="additionalFieldsForm.supplierProduct.id !== null" />
              </FlexCell>
            </Flex>
          </FlexCell>
          <FlexCell center>
            <Flex vertical class="gap-2">
               <FlexCell>
                 <Label class="font-semibold block text-sm leading-6 text-gray-900">
                   {{ t('shared.labels.sku') }}
                 </Label>
               </FlexCell>
               <FlexCell>
                <TextInput class="w-96" v-model="additionalFieldsForm.supplierProduct.sku" :placeholder="t('shared.placeholders.sku')" :disabled="additionalFieldsForm.supplierProduct.id !== null" />
               </FlexCell>
            </Flex>
          </FlexCell>

        <FlexCell center>
          <Flex vertical class="gap-2">
             <FlexCell>
               <Label class="font-semibold block text-sm leading-6 text-gray-900">
                 {{ t('shared.labels.quantity') }}
               </Label>
             </FlexCell>
             <FlexCell>
                <TextInput class="w-96" v-model="additionalFieldsForm.supplierProduct.quantity" number :placeholder="t('shared.placeholders.quantity')" :disabled="additionalFieldsForm.supplierProduct.id !== null" />
             </FlexCell>
          </Flex>
        </FlexCell>
        <FlexCell center>
          <Flex vertical class="gap-2">
             <FlexCell>
               <Label class="font-semibold block text-sm leading-6 text-gray-900">
                 {{ t('purchasing.products.labels.unitPrice') }}
               </Label>
             </FlexCell>
             <FlexCell>
                <TextInput class="w-96" v-model="additionalFieldsForm.supplierProduct.unitPrice" number :placeholder="t('purchasing.products.placeholders.unitPrice')" :disabled="additionalFieldsForm.supplierProduct.id !== null" />
             </FlexCell>
          </Flex>
        </FlexCell>

        <FlexCell center>
          <Flex vertical class="gap-2">
             <FlexCell>
               <Label class="font-semibold block text-sm leading-6 text-gray-900">
                 {{ t('shared.labels.unit') }}
               </Label>
             </FlexCell>
             <FlexCell>
               <FieldQuery class="w-96" v-model="additionalFieldsForm.supplierProduct.unit.id" :field="getUnit" />
             </FlexCell>
          </Flex>
        </FlexCell>
        </Flex>
      </FlexCell>
    </Flex>
  </div>
</template>