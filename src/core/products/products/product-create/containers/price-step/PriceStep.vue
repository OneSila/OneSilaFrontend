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
import {Icon} from "../../../../../../shared/components/atoms/icon";
import {TextInputPrepend} from "../../../../../../shared/components/atoms/input-text-prepend";

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
            <TextInputPrepend id="amount" class="w-96" v-model="additionalFieldsForm.price.amount" :label="t('sales.prices.labels.amount')" type="number"
                              :placeholder="'100'">
            {{ currency }}
          </TextInputPrepend>
          </FlexCell>
        </Flex>
        <Flex center class="gap-4 mt-4">
          <FlexCell center>
            <TextInputPrepend id="discountAmount" class="w-96" v-model="additionalFieldsForm.price.discountAmount" :label="t('sales.prices.labels.discountAmount')" type="number"
                              :placeholder="'90.99'">
            {{ currency }}
          </TextInputPrepend>
          </FlexCell>
        </Flex>
      </FlexCell>

      <FlexCell class="py-8 px-96"><hr></FlexCell>

      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical>
              <FlexCell>
                <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('settings.vatRates.show.title') }}*</label>
              </FlexCell>
              <FlexCell>
                <FieldQuery class="w-96" v-model="form.vatRate.id" :field="getVatRateField(t)" />
              </FlexCell>
            </Flex>
          </FlexCell>
        </Flex>
      </FlexCell>

    </Flex>
  </div>
</template>