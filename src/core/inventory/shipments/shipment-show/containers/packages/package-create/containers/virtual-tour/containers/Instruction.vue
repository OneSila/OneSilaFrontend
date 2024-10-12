<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {Icon} from "../../../../../../../../../../shared/components/atoms/icon";
import {Item, Package, StepType} from "../../../../configs";

const props = defineProps<{ currentStep: StepType, packages: Package[], toShipItems: Item[] }>();
const { t } = useI18n();

const getPackageName = () => {
  return t('inventory.packages.create.virtual.virtualTour.packageName', { index: props.packages.length });
};

const getRemainingQuantity = () => {
  const itemInToShip = props.toShipItems.find(item => item.id === props.currentStep.item?.id);
  return itemInToShip ? itemInToShip.quantity : 0;
};

const instructionContent = computed(() => {
  const step = props.currentStep;

  switch (props.currentStep.type) {
    case 'prepare':
      return {
        title: t('inventory.packages.create.virtual.instructions.prepare.title'),
        description: t('inventory.packages.create.virtual.instructions.prepare.description'),
      };
    case 'move':
      return {
        title: t('inventory.packages.create.virtual.instructions.move.title', {
          location: step.availableLocation?.location?.name || t('inventory.packages.create.virtual.instructions.move.noLocation')
        }),
        description: t('inventory.packages.create.virtual.instructions.move.description', {
          location: step.availableLocation?.location?.name || t('inventory.packages.create.virtual.instructions.move.noLocation')
        }),
      };
    case 'collect':
      // Use the remaining quantity instead of availableLocation.quantity
      const remainingQuantity = getRemainingQuantity();
      return {
        title: t('inventory.packages.create.virtual.instructions.collect.title'),
        description: t('inventory.packages.create.virtual.instructions.collect.description', {
          item: step.item?.product?.name || t('inventory.packages.create.virtual.instructions.collect.noItem'),
          location: step.availableLocation?.location?.name || t('inventory.packages.create.virtual.instructions.collect.noLocation'),
          quantity: remainingQuantity,
          package: getPackageName(),
        }),
      };
    case 'confirm':
      return {
        title: t('inventory.packages.create.virtual.instructions.confirm.title'),
        description: t('inventory.packages.create.virtual.instructions.confirm.description'),
      };
    default:
      return { title: '', description: '' };
  }
});


</script>

<template>
  <div class="instruction-container p-6 bg-blue-100">
    <div class="flex items-center justify-center mb-4">
      <Icon name="exclamation-circle" class="text-indigo-600 mr-3" size="2xl" />
      <h3 class="text-xl font-bold text-gray-800 text-center">{{ instructionContent.title }}</h3>
    </div>
    <p class="text-center text-gray-600">{{ instructionContent.description }}</p>

    <div v-if="currentStep.type === 'collect'" class="mt-10">
      <div class="my-4">
        <hr>
      </div>
      <ul class="text-sm text-gray-500 list-disc list-inside">
        <li>{{ t('inventory.packages.create.virtual.instructions.collect.general.addAll') }}</li>
        <li>{{ t('inventory.packages.create.virtual.instructions.collect.general.packageFull') }}</li>
        <li v-if="currentStep.availableLocation?.quantity && currentStep.availableLocation.quantity > 1">
          {{ t('inventory.packages.create.virtual.instructions.collect.extra.partialAdd') }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>

.exclamation-icon {
  color: #6366f1; /* Indigo color for the exclamation icon */
}
</style>
