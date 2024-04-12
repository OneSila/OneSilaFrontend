<script setup lang="ts">

import {reactive, computed, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { getVatRateField } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Wizard } from "../../../../shared/components/molecules/wizard";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute, useRouter} from "vue-router";
import { OptionSelector } from "../../../../shared/components/molecules/option-selector";
import { ProductType } from "../../../../shared/utils/constants";
import variableType from "../../../../assets/images/product-types/simple.png";
import bundleType from "../../../../assets/images/product-types/bundle.png";
import configurableType from "../../../../assets/images/product-types/configurable.png";
import Image from "../../../../shared/components/atoms/image/Image.vue";
import { TextInput } from "../../../../shared/components/atoms/input-text";
import { PrimaryButton } from "../../../../shared/components/atoms/button-primary";
import { FieldQuery } from "../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import { createProductMutation } from "../../../../shared/api/mutations/products.js"
import apolloClient from "../../../../../apollo-client";
import {Toast} from "../../../../shared/modules/toast";
import {processGraphQLErrors} from "../../../../shared/utils";


const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const wizardRef = ref();
const step = ref(0);

const form = reactive({
  type: '',
  sku: '',
  active: true,
  vatRate: {
    id: ''
  },
  alwaysOnStock: false
});

const wizardSteps = [
  { title: t('products.products.labels.type.title'), name: 'typeStep' },
  { title: t('shared.labels.sku'), name: 'skuStep' },
  { title: t('settings.vatRates.title'), name: 'vatStep' }
];

const typeChoice = [
  { name: ProductType.Variation },
  { name: ProductType.Bundle },
  { name: ProductType.Umbrella }
];

const handleFinish = async () => {

  try {
    const {data, errors } = await apolloClient.mutate({
      mutation: createProductMutation,
      variables: {
        data: {...form}
      },
    });


    if (data && data.createProduct) {
      Toast.success(t('products.products.create.createSuccefully'));
      router.push({name: 'products.products.show', params: {id: data.createProduct.id}})
    }
  } catch (err) {
    const graphqlError = err as { graphQLErrors: Array<{ message: string }> };
    if (graphqlError.graphQLErrors) {
      const validationErrors = processGraphQLErrors(graphqlError, t);
      for (const key in validationErrors) {
        if (validationErrors.hasOwnProperty(key)) {
          Toast.error(validationErrors[key]);
        }
      }
    }
  }

}

const updateStep = (val) => {
  step.value = val;
}

const triggerNextStep = () => {
  wizardRef.value.nextStep();
};

const allowNextStep = computed(() => {
  if (step.value === 0 && form.type === '') {
    return false;
  }

  if (step.value === 2 && (form.vatRate.id === '' || form.vatRate.id == null)) {
    return false;
  }

  return true;
});

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'products.products.list' }, name: t('products.title') },
                   { path: { name: 'products.products.create' }, name: t('products.products.create.title') }]" />
    </template>

   <template v-slot:content>
      <Wizard ref="wizardRef" :steps="wizardSteps" :allow-next-step="allowNextStep" @on-finish="handleFinish" @update-current-step="updateStep">

        <template #typeStep>
          <div>
            <h1 class="text-2xl text-center mb-2">{{ t('products.products.create.wizard.stepOne.content') }}</h1>
            <hr>
            <OptionSelector v-model="form.type" :choices="typeChoice" >

              <template #VARIATION>
                <div>
                  <h3 class="text-lg font-bold">{{ t('products.products.create.wizard.stepOne.variable.title') }}</h3>
                  <p>{{ t('products.products.create.wizard.stepOne.variable.example') }}</p>
                  <Image :source="variableType" alt="Variable" class="w-full" />
                </div>
              </template>

              <template #BUNDLE>
                <div>
                  <h3 class="text-lg font-bold">{{ t('products.products.create.wizard.stepOne.bundle.title') }}</h3>
                  <p>{{ t('products.products.create.wizard.stepOne.bundle.example') }}</p>
                  <Image :source="bundleType" alt="Bundle" class="w-full" />
                </div>
              </template>

              <template #UMBRELLA>
                <div>
                  <h3 class="text-lg font-bold">{{ t('products.products.create.wizard.stepOne.configurable.title') }}</h3>
                  <p>{{ t('products.products.create.wizard.stepOne.configurable.example') }}</p>
                  <Image :source="configurableType" alt="Configurable" class="w-full" />
                </div>
              </template>

            </OptionSelector>
          </div>
        </template>

        <template #skuStep>
          <div>
            <h1 class="text-2xl text-center mb-2">{{ t('products.products.create.wizard.stepTwo.content') }}</h1>
            <hr>
            <Flex center vertical>
              <FlexCell>
                <TextInput v-model="form.sku" class="mt-5" :placeholder="'SKU-123'" />
              </FlexCell>
              <FlexCell><h1 class="text-lg font-bold uppercase mt-3">{{ t('shared.labels.or') }}</h1></FlexCell>
              <FlexCell>
                <PrimaryButton class="mt-3" @click="triggerNextStep">
                  {{ t('products.products.create.wizard.stepTwo.generate') }}
                </PrimaryButton>
              </FlexCell>
            </Flex>
          </div>
        </template>

        <template #vatStep>
          <div vertical center>
            <h1 class="text-2xl text-center mb-2">{{ t('products.products.create.wizard.stepThree.content') }}</h1>
            <hr>
            <Flex vertical center>
              <FlexCell class="w-1/3">
                <FieldQuery class="mt-5" v-model="form.vatRate.id" :field="getVatRateField(t)" />
              </FlexCell>
            </Flex>
          </div>
        </template>
      </Wizard>
   </template>
  </GeneralTemplate>
</template>