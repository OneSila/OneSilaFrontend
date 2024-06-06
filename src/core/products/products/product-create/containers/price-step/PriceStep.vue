<script setup lang="ts">
import { defineProps, ref } from 'vue';
import { useI18n } from "vue-i18n";
import {AdditonalFormFields, FormType} from "../product";
import {TextInput} from "../../../../../../shared/components/atoms/input-text";
import { Label } from "../../../../../../shared/components/atoms/label";
import { getVatRateField } from "../../../configs";
import { FieldQuery } from "../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import apolloClient from "../../../../../../../apollo-client";
import { currenciesQuery } from "../../../../../../shared/api/queries/currencies.js";

const props = defineProps<{form: FormType, additionalFieldsForm: AdditonalFormFields}>();
const emit = defineEmits(['set-default-currency']);
const { t } = useI18n();
const currency = ref('');

const getDefaultCurrency = async () => {
  const {data} = await apolloClient.query({
    query: currenciesQuery,
    variables: {filter: {isDefaultCurrency: true}},
  });

  currency.value = data.currencies.edges[0].node.symbol
  emit('set-default-currency', data.currencies.edges[0].node.id)
}

getDefaultCurrency();

</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">{{ t('products.products.create.wizard.stepThree.content') }}</h1>
    <hr>
    <Flex vertical>
      <FlexCell>
        <Flex center class="mt-4 gap-4">
          <FlexCell center>
            <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('sales.prices.labels.amount') }}</label>
          </FlexCell>
          <FlexCell center>
            <TextInput v-model="additionalFieldsForm.price.amount" float :placeholder="'100 ' + currency" />
          </FlexCell>
        </Flex>
        <Flex center class="gap-4 mt-4">
          <FlexCell center>
            <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('sales.prices.labels.discountAmount') }}</label>
          </FlexCell>
          <FlexCell center>
            <TextInput v-model="additionalFieldsForm.price.discountAmount" float :placeholder="'90.99 ' + currency" />
          </FlexCell>
        </Flex>
      </FlexCell>

      <FlexCell class="py-8 px-96"><hr></FlexCell>

      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('shared.labels.name') }}</label>
          </FlexCell>
          <FlexCell center>
              <FieldQuery class="w-96" v-model="form.vatRate.id" :field="getVatRateField(t)" />
          </FlexCell>
        </Flex>
      </FlexCell>

    </Flex>
  </div>
</template>