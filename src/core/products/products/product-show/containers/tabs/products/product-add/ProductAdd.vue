<script setup lang="ts">

import { watch, ref, Ref} from 'vue';
import {BaseProduct, Product} from "../../../../../configs";
import {useI18n} from "vue-i18n";
import {Button} from "../../../../../../../../shared/components/atoms/button";
import CreateForm from "./CreateForm.vue";
import { processGraphQLErrors } from "../../../../../../../../shared/utils";
import {Toast} from "../../../../../../../../shared/modules/toast";
import {useEnterKeyboardListener} from "../../../../../../../../shared/modules/keyboard";
import {PrimaryButton} from "../../../../../../../../shared/components/atoms/button-primary";
import {updateProductMutation} from "../../../../../../../../shared/api/mutations/products.js";
import {DangerButton} from "../../../../../../../../shared/components/atoms/button-danger";

const { t } = useI18n();

export interface ProductForm {
  product: string | null;
}

const props = defineProps<{ product: Product; baseProducts: BaseProduct[] }>();
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

const getVariables = () => {
  let ids = props.baseProducts.map(baseProduct => ({ id: baseProduct.id }));

  if (form.value.product) {
      ids.push({id: form.value.product})
  }

  return { data: { id: props.product.id, baseProducts: ids } };
};

const afterCreate = (response) => {
    emit('productAdded', response);
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
      <FlexCell>
        <CreateForm :product="product" :form="form" :base-products="baseProducts" />
      </FlexCell>
      <FlexCell>
        <DangerButton type="button" class="ml-2" @click="resetForm">
          {{ t('shared.button.cancel') }}
        </DangerButton>
      </FlexCell>
    </template>
      <FlexCell>
      <ApolloMutation v-if="isFormVisible" :mutation="updateProductMutation" :variables="getVariables()" @done="afterCreate" @error="onError">
        <template v-slot="{ mutate, loading, error }">
            <PrimaryButton :disabled="loading || form.product == null" ref="submitButtonRef" class="ml-2" @click="mutate">
            {{ t('shared.button.submit') }}
          </PrimaryButton>
        </template>
      </ApolloMutation>

      <PrimaryButton v-else  @click="handleAddClick" class="ml-2">
        {{ t('shared.button.add') }}
      </PrimaryButton>
    </FlexCell>
  </Flex>
</template>
