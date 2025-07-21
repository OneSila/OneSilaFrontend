<script setup lang="ts">

import {defineProps, Ref, ref, watch} from 'vue';
import { useI18n } from "vue-i18n";
import {AdditonalFormFields, FormType, RelatedProduct} from "../product";
import { PRODUCT_BUNDLE, PRODUCT_CONFIGURABLE } from "../../../../../../shared/utils/constants";
import { VariationsAdder } from "../../../../../../shared/components/organisms/variations-adder";
import { VariationsGenerator } from "../../../../../../shared/components/organisms/variations-generator";
import { OptionSelector } from "../../../../../../shared/components/molecules/option-selector";

const props = defineProps<{form: FormType, additionalFieldsForm: AdditonalFormFields}>();
const isFormVisible = ref(false);

const { t } = useI18n();
const variations: Ref<RelatedProduct[]> = ref(props.additionalFieldsForm.relatedProducts);
const productDescriptionMap = {
  [PRODUCT_BUNDLE]:  t('products.products.create.wizard.stepFour.bundle.selectVariations') ,
  [PRODUCT_CONFIGURABLE]:  t('products.products.create.wizard.stepFour.configurable.selectVariations') ,
};

const mode = ref('manual');
const selectedValues = ref<string[]>(props.additionalFieldsForm.propertyValueIds);

const resetForm = () => {
  isFormVisible.value = false;
}

const handleAddClick = () => {
  isFormVisible.value = true;
};

const updateFormVariations = () => {
    props.additionalFieldsForm.relatedProducts = variations.value;
}

const removeVariation = (id: string) => {
  variations.value = variations.value.filter(v => v.id !== id);
  updateFormVariations();
}

const addVariation = (variation: RelatedProduct) => {
  variations.value.push(variation);
  updateFormVariations();
}

watch(selectedValues, () => {
  props.additionalFieldsForm.propertyValueIds = selectedValues.value;
});

const handleSelectedUpdate = (vals: string[]) => {
  selectedValues.value = vals;
};

</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">{{ productDescriptionMap[form.type] }}</h1>
    <hr>
    <div v-if="form.type === PRODUCT_CONFIGURABLE && additionalFieldsForm.productType.id">
      <OptionSelector v-model="mode" :choices="[{ name: 'manual' }, { name: 'generate' }]">
        <template #manual>
          <span class="font-medium">{{ t('shared.labels.manual') }}</span>
        </template>
        <template #generate>
          <span class="font-medium">{{ t('shared.labels.generate') }}</span>
        </template>
      </OptionSelector>
    </div>

    <div class="my-4">
      <VariationsAdder v-if="mode === 'manual'" class="my-4" :product-type-id="additionalFieldsForm.productType.id" :added-variations="variations" :type="form.type" @add="addVariation" @remove="removeVariation" />
      <VariationsGenerator v-else class="my-4" :product-type-id="additionalFieldsForm.productType.id" @update:selected="handleSelectedUpdate" />
    </div>
  </div>
</template>