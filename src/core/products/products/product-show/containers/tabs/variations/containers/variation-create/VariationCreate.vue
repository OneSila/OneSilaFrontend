<script setup lang="ts">

import { watch, ref, Ref} from 'vue';
import {Product} from "../../../../../../configs";
import {useI18n} from "vue-i18n";
import {Button} from "../../../../../../../../../shared/components/atoms/button";
import CreateForm from "./CreateForm.vue";
import {PRODUCT_BUNDLE, ProductType} from "../../../../../../../../../shared/utils/constants";
import {
  createBillOfMaterialMutation,
  createBundleVariationMutation,
  createConfigurableVariationMutation
} from "../../../../../../../../../shared/api/mutations/products.js";
import { processGraphQLErrors } from "../../../../../../../../../shared/utils";
import {Toast} from "../../../../../../../../../shared/modules/toast";
import {useEnterKeyboardListener} from "../../../../../../../../../shared/modules/keyboard";
import {PrimaryButton} from "../../../../../../../../../shared/components/atoms/button-primary";
import {DangerButton} from "../../../../../../../../../shared/components/atoms/button-danger";

const { t } = useI18n();

export interface VariationForm {
  variation: string;
  quantity: string;
}

const props = defineProps<{ product: Product; variationIds: string[] }>();
const emit = defineEmits(['variationAdded']);
const variationIdsRef = ref(props.variationIds);
const submitButtonRef = ref();

watch(() => props.variationIds, (newIds) => {
  variationIdsRef.value = newIds;
}, { deep: true });


const form: Ref<VariationForm> = ref({
  variation: '',
  quantity: ''
});
const isFormVisible = ref(false);

const resetForm = () => {
  form.value = {
    variation: '',
    quantity: ''
  }
  isFormVisible.value = false;
}

const handleAddClick = () => {
  isFormVisible.value = true;
};

const getMutation = () => {
  let type = props.product.type;

  if (type == ProductType.Alias) {
    type = props.product.aliasParentProduct.type;
  }

  switch(type) {
    case ProductType.Bundle:
      return createBundleVariationMutation;
    case ProductType.Configurable:
      return createConfigurableVariationMutation;
    default:
      return null;
  }
}

const getVariables = () => {
  let variables = {
    parent: { id: props.product.id },
    variation: { id: form.value.variation }
  }

  let type = props.product.type;

  if (type == ProductType.Alias) {
    type = props.product.aliasParentProduct.type;
  }

 if (type !== ProductType.Configurable) {
   variables['quantity'] = form.value.quantity;
 }

 return {data: variables}
}

const afterCreate = (response) => {
    emit('variationAdded', response);
    resetForm();
};

const onError = (error) => {
    const errors = processGraphQLErrors(error, t);
    if (errors['__all__']) {
      Toast.error(errors['__all__']);
    }
};

const onSubmitPressed = () => {
  submitButtonRef.value?.$el.click();
};

useEnterKeyboardListener(onSubmitPressed);
</script>

<template>
<Flex>
    <template v-if="isFormVisible">
      <FlexCell grow>
        <CreateForm :product="product" :form="form" :variation-ids="variationIdsRef" />
      </FlexCell>
      <FlexCell>
        <DangerButton type="button" class="ml-2" @click="resetForm">
          {{ t('shared.button.cancel') }}
        </DangerButton>
      </FlexCell>
    </template>
      <FlexCell>
      <ApolloMutation v-if="isFormVisible" :mutation="getMutation()" :variables="getVariables()" @done="afterCreate" @error="onError">
        <template v-slot="{ mutate, loading, error }">
            <PrimaryButton :disabled="loading" ref="submitButtonRef" class="ml-2" @click="mutate">
            {{ t('shared.button.submit') }}
          </PrimaryButton>
        </template>
      </ApolloMutation>

      <PrimaryButton v-else type="button" class="btn btn-primary" @click="handleAddClick">
        {{ t('shared.button.add') }}
      </PrimaryButton>
    </FlexCell>
  </Flex>
</template>
