<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {processGraphQLErrors} from "../../../../../shared/utils";
import {Toast} from "../../../../../shared/modules/toast";
import {createInventoryMovementMutation} from "../../../../../shared/api/mutations/inventory.js";
import apolloClient from "../../../../../../apollo-client";
import {CancelButton} from "../../../../../shared/components/atoms/button-cancel";
import {Link} from "../../../../../shared/components/atoms/link";
import {PrimaryButton} from "../../../../../shared/components/atoms/button-primary";

const props = defineProps<{
  form: any;
  movementFromModel: any;
  movementToModel: any;
}>();

const emit = defineEmits(['submit', 'update-errors']);

const router = useRouter();
const { t } = useI18n();

const handleSubmit = async () => {
  // Perform validation
  const errors: Record<string, string> = {};

  if (!props.form.product.id) {
    errors['product'] = t('inventory.movements.errors.productRequired');
  }
  if (!props.form.quantity) {
    errors['quantity'] = t('inventory.movements.errors.quantityRequired');
  }
  if (!props.movementFromModel) {
    errors['movementFromModel'] = t('inventory.movements.errors.movementFromModelRequired');
  }
  if (!props.form.movementFromId) {
    errors['movementFromId'] = t('inventory.movements.errors.movementFromIdRequired');
  }
  if (!props.movementToModel) {
    errors['movementToModel'] = t('inventory.movements.errors.movementToModelRequired');
  }
  if (!props.form.movementToId) {
    errors['movementToId'] = t('inventory.movements.errors.movementToIdRequired');
  }

  emit('update-errors', errors);
  if (Object.keys(errors).length > 0) {
    return;
  }

  // Prepare data for mutation
  const submitData = {
    product: { id: props.form.product.id },
    quantity: parseFloat(props.form.quantity),
    notes: props.form.notes,
    movementFromId: props.form.movementFromId,
    movementToId: props.form.movementToId,
  };

  try {
    const { data } = await apolloClient.mutate({
      mutation: createInventoryMovementMutation,
      variables: {
        data: submitData,
      },
    });

    if (data && data.createInventoryMovement) {
      Toast.success(t('inventory.movements.messages.createSuccess'));
      router.push({ name: 'inventory.inventory.list' });
      emit('submit', data.createInventoryMovement);
    } else {
      Toast.error(t('inventory.movements.messages.createError'));
    }
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    emit('update-errors', validationErrors);
    if (validationErrors['__all__']) {
      Toast.error(validationErrors['__all__']);
    }
  }
};

</script>

<template>
  <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
    <Link :path="{ name: 'inventory.inventory.list' }">
      <CancelButton>
        {{ t('shared.button.back') }}
      </CancelButton>
    </Link>

    <PrimaryButton @click="handleSubmit">
      {{ t('shared.button.save') }}
    </PrimaryButton>
  </div>
</template>

