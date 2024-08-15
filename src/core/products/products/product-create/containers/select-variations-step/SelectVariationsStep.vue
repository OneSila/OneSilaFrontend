<script setup lang="ts">

import {defineProps, Ref, ref} from 'vue';
import { useI18n } from "vue-i18n";
import {AdditonalFormFields, FormType, RelatedProduct} from "../product";
import { PRODUCT_BUNDLE, PRODUCT_CONFIGURABLE, PRODUCT_MANUFACTURABLE } from "../../../../../../shared/utils/constants";
import { VariationsAdder } from "../../../../../../shared/components/organisms/variations-adder";

const props = defineProps<{form: FormType, additionalFieldsForm: AdditonalFormFields}>();
const isFormVisible = ref(false);

const { t } = useI18n();
const variations: Ref<RelatedProduct[]> = ref(props.additionalFieldsForm.relatedProducts);
const productDescriptionMap = {
  [PRODUCT_BUNDLE]:  t('products.products.create.wizard.stepFour.bundle.selectVariations') ,
  [PRODUCT_CONFIGURABLE]:  t('products.products.create.wizard.stepFour.configurable.selectVariations') ,
  [PRODUCT_MANUFACTURABLE]:  t('products.products.create.wizard.stepFour.manufacturable.selectVariations') ,
};

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

</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">{{ productDescriptionMap[form.type] }}</h1>
    <hr>
    <VariationsAdder class="my-4" :added-variations="variations" :type="form.type" @add="addVariation" @remove="removeVariation" />
  </div>
</template>