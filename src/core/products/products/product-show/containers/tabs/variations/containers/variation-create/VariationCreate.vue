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
  createUmbrellaVariationMutation
} from "../../../../../../../../../shared/api/mutations/products.js";
import { processGraphQLErrors } from "../../../../../../../../../shared/utils";
import {Toast} from "../../../../../../../../../shared/modules/toast";

const { t } = useI18n();

const props = defineProps<{ product: Product; variationIds: string[] }>();
const emit = defineEmits(['variationAdded']);
const variationIdsRef = ref(props.variationIds);

watch(() => props.variationIds, (newIds) => {
  variationIdsRef.value = newIds;
}, { deep: true });

export interface VariationForm {
  variation: string;
  quantity: string;
}

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
  switch(props.product.type) {
    case ProductType.Bundle:
      return createBundleVariationMutation;
    case ProductType.Umbrella:
      return createUmbrellaVariationMutation;
    case ProductType.Manufacturable:
      return createBillOfMaterialMutation;
    default:
      return null;
  }
}

const getVariables = () => {
  let variables = {
    umbrella: { id: props.product.id },
    variation: { id: form.value.variation }
  }

 if (props.product.type !== PRODUCT_BUNDLE) {
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

</script>

<template>
<Flex>
    <template v-if="isFormVisible">
      <FlexCell>
        <CreateForm :product="product" :form="form" :variation-ids="variationIdsRef" />
      </FlexCell>
      <FlexCell>
        <Button type="button" class="btn btn-danger ml-2" @click="resetForm">
          {{ t('shared.button.cancel') }}
        </Button>
      </FlexCell>
    </template>
      <FlexCell>
      <ApolloMutation v-if="isFormVisible" :mutation="getMutation()" :variables="getVariables()" @done="afterCreate" @error="onError">
        <template v-slot="{ mutate, loading, error }">
            <Button :disabled="loading" class="btn btn-primary ml-2" @click="mutate">
            {{ t('shared.button.submit') }}
          </Button>
        </template>
      </ApolloMutation>

      <Button v-else type="button" class="btn btn-primary" @click="handleAddClick">
        {{ t('shared.button.add') }}
      </Button>
    </FlexCell>
  </Flex>
</template>
