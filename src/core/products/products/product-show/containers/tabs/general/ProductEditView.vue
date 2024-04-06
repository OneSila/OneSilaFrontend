<script setup lang="ts">

import {reactive, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../../../../shared/utils/constants";
import {baseFormConfigConstructor, Product} from "../../../../configs";
import {updateProductMutation} from "../../../../../../../shared/api/mutations/products.js";
import TabContentTemplate from "../TabContentTemplate.vue";
import {SubmitButtons} from "../../../../../../../shared/components/organisms/general-form/containers/submit-buttons";
import { Toast} from "../../../../../../../shared/modules/toast";

const { t } = useI18n();
const props = defineProps<{ product: Product }>();
const form = ref(null);

const baseForm = {
  ...baseFormConfigConstructor(
    t,
    FormType.EDIT,
    updateProductMutation,
    'updateProduct',
    {name: 'products.products.show', params: {id: props.product.id}, query: {tabs: 'general'} }
  ),
};

const formConfig = {
  ...baseForm,
  mutationId: props.product.id,
  queryData: props.product,
  hideButtons: true,
  submitUrl: {name: 'products.products.show', params: {id: props.product.id}, query: {tabs: 'general'} },
  fields: [
    {
      type: FieldType.Hidden,
      name: 'id',
      value: props.product.id
    },
    ...baseForm.fields
  ]
};

const handleFormUpdate = (f) => {
  form.value = f;
}

const handleSubmit = (resp) => {
  Toast.success(t('products.products.edit.updateSuccefully'))
}

</script>

<template>
  <div class="flex justify-between items-start">
    <div class="flex-grow">
      <GeneralForm :config="formConfig as FormConfig" @form-updated="handleFormUpdate"/>
    </div>

    <div class="flex-initial">
      <SubmitButtons :form="form" :config="{...formConfig, submitLabel: t('shared.button.save')} as FormConfig" @submit="handleSubmit"/>
    </div>
  </div>

</template>