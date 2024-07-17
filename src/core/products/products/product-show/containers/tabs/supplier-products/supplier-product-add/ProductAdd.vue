<script setup lang="ts">

import { watch, ref, Ref} from 'vue';
import { Product} from "../../../../../configs";
import {useI18n} from "vue-i18n";
import CreateForm from "./CreateForm.vue";
import { processGraphQLErrors } from "../../../../../../../../shared/utils";
import {Toast} from "../../../../../../../../shared/modules/toast";
import {useEnterKeyboardListener} from "../../../../../../../../shared/modules/keyboard";
import {PrimaryButton} from "../../../../../../../../shared/components/atoms/button-primary";
import {DangerButton} from "../../../../../../../../shared/components/atoms/button-danger";
import apolloClient from "../../../../../../../../../apollo-client";
import { getProductQuery } from "../../../../../../../../shared/api/queries/products.js";
import { updateProductMutation } from "../../../../../../../../shared/api/mutations/products.js";
import { SupplierProduct } from "../SupplierProductsList.vue";

const { t } = useI18n();

export interface ProductForm {
  product: string | null;
}

const props = defineProps<{ product: Product; supplierProducts: SupplierProduct[] }>();
const emit = defineEmits(['productAdded']);
const submitButtonRef = ref();

const form: Ref<ProductForm> = ref({
  product: null
});
const isFormVisible = ref(false);

const resetForm = () => {
  form.value = {
    product: null,
  }
  isFormVisible.value = false;
}

const handleAddClick = () => {
  isFormVisible.value = true;
};

const getVariables = (baseProducts) => {
  let ids = baseProducts.map(baseProduct => ({ id: baseProduct.id }));

  if (form.value.product) {
      ids.push({id: props.product.id})
  }

  return { data: { id: form.value.product, baseProducts: ids } };
};

const addVariation = async (variables) => {
    const { data } = await apolloClient.mutate({
      mutation: updateProductMutation,
      variables: variables
  });

  if (data) {
    emit('productAdded', data);
    resetForm();
  }
}

const onCreate = async () => {

  const {data} = await apolloClient.query({
    query: getProductQuery,
    variables: { id: form.value.product },
    fetchPolicy: 'network-only'
  });

  if (data && data.product) {
    const baseProducts = data.product.baseProducts;
    const variables = getVariables(baseProducts);
    await addVariation(variables);
  }

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
      <FlexCell>
        <CreateForm :product="product" :form="form" :supplierProducts="supplierProducts" />
      </FlexCell>
      <FlexCell>
        <DangerButton type="button" class="ml-2" @click="resetForm">
          {{ t('shared.button.cancel') }}
        </DangerButton>
      </FlexCell>
    </template>
      <FlexCell>

      <PrimaryButton v-if="isFormVisible" :disabled="form.product == null" ref="submitButtonRef" class="ml-2" @click="onCreate">
        {{ t('shared.button.submit') }}
      </PrimaryButton>

      <PrimaryButton v-else  @click="handleAddClick" class="ml-2">
        {{ t('shared.button.add') }}
      </PrimaryButton>
    </FlexCell>
  </Flex>
</template>
