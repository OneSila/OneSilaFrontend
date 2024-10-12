<script setup lang="ts">
import {ref, computed, onMounted, Ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { Wizard } from "../../../../../../../../../shared/components/molecules/wizard";
import CreatePackageStep from './containers/CreatePackageStep.vue';
import AssignItemsStep from './containers/AssignItemsStep.vue';
import apolloClient from "../../../../../../../../../../apollo-client";
import {Toast} from "../../../../../../../../../shared/modules/toast";
import {createInventoryMovement, createPackage, Item, Package} from "../../../configs";
import {useRouter} from "vue-router";
import {ShipmentStatus, updateShipmentStatus} from "../../../../../../configs";

const { t } = useI18n();

const router = useRouter();
const props = defineProps<{ shipmentId: string, items: Item[] }>();

const step = ref(0);
const wizardRef = ref();
const packages: Ref<Package[]> = ref([]);
const toShipItems: Ref<Item[]> = ref(props.items);

const wizardSteps = computed(() => [
  { title: t('inventory.packages.create.manual.createStep.title'), name: 'createPackageStep' },
  { title: t('inventory.packages.create.manual.assignItemsStep.title'), name: 'assignItemsStep' }
]);

const handleFinish = async () => {
  // Step 1: Validate that there are no empty packages
  const emptyPackage = packages.value.find(pkg => pkg.items.length === 0);
  if (emptyPackage) {
    Toast.error(t('inventory.packages.create.manual.assignItemsStep.error.noItemsInPackage'));
    return;
  }

  // Step 2: Loop through each package and create them using createPackage
  for (const pkg of packages.value) {
    const createdPackageId = await createPackage(apolloClient, pkg.form); // Create package and get the ID

    if (!createdPackageId) {
      Toast.error(t('inventory.packages.create.manual.assignItemsStep.error.packageCreationFailed', { trackingCode: pkg.form.trackingCode }));
      return;
    }

    // Step 3: For each item in the package, create the inventory movement with the newly created package ID
    for (const item of pkg.items) {
      const isMovementCreated = await createInventoryMovement(apolloClient, item, createdPackageId); // Use the returned package ID

      if (!isMovementCreated) {
        Toast.error(t('inventory.packages.create.manual.assignItemsStep.error.inventoryMovementFailed', { itemName: item.product.name }));
        return;
      }
    }
  }

  const isStatusUpdated = await updateShipmentStatus(apolloClient, props.shipmentId, ShipmentStatus.DONE);

  // // Step 4: If all packages and movements are successful, show a success message and complete the workflow
  Toast.success(t('inventory.packages.create.manual.assignItemsStep.success'));
  router.push({ name: 'inventory.shipments.show', params: { id: props.shipmentId }, query: {tab: 'packages'} });
};


const updateStep = (newStep) => {
  step.value = newStep;
};

const handleAddPackage = (newPackage) => {
  packages.value.push(newPackage);
};

const handleRemovePackage = (index) => {
  const packageToRemove = packages.value[index];
  if (packageToRemove.items.length > 0) {
    Toast.error(t('inventory.packages.create.manual.assignItemsStep.error.cannotRemoveWithItems'))
  } else {
    packages.value.splice(index, 1);
  }
};

const handleAddItemToPackage = (item, pkgId, quantity) => {
  // Find the package to update
  const packageToUpdate = packages.value.find(pkg => pkg.id === pkgId);

  if (packageToUpdate) {
    // Check if the item is already in the package
    const existingItem = packageToUpdate.items.find(pkgItem => pkgItem.id === item.id);

    if (existingItem) {
      // If the item is already in the package, just update the quantity
      existingItem.quantity += quantity;
    } else {
      // Otherwise, add a new entry for the item
      packageToUpdate.items.push({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
        },
        inventorylocation: {
          id: item.inventorylocation.id,
          name: item.inventorylocation.name,
        },
        quantity: quantity,
      });
    }
  }

  const toShipItem = toShipItems.value.find(shipItem => shipItem.id === item.id);

  if (toShipItem) {
    toShipItems.value = toShipItems.value.map(shipItem =>
      shipItem.id === item.id
        ? { ...shipItem, quantity: shipItem.quantity - quantity }
        : shipItem
    );
  }
};


const handleRemoveItemFromPackage = (itemId, pkgId) => {
  const packageToUpdate: Package | undefined = packages.value.find(pkg => pkg.id === pkgId);

  if (packageToUpdate) {
    const itemIndex = packageToUpdate.items.findIndex(item => item.id === itemId);

    const removedItem = packageToUpdate.items[itemIndex];
    const toShipItem: Item | undefined = toShipItems.value.find(shipItem => shipItem.id === itemId);

    if (toShipItem) {
      toShipItem.quantity += removedItem.quantity;
    }

    packageToUpdate.items.splice(itemIndex, 1);
  }
};

const allowNextStep = computed(() => {

  const stepName = wizardSteps.value[step.value].name;

  if (stepName == 'createPackageStep' && packages.value.length == 0) {
    return false
  }

  if (stepName == 'assignItemsStep' && !toShipItems.value.every(item => item.quantity === 0)) {
    return false
  }

  return true;
});

</script>

<template>
  <Wizard
    ref="wizardRef"
    :steps="wizardSteps"
    :show-buttons="true"
    :allow-next-step="allowNextStep"
    @on-finish="handleFinish"
    @update-current-step="updateStep"
  >
    <template #createPackageStep>
      <CreatePackageStep
          :shipmentId="shipmentId"
          :packages="packages"
          @add-package="handleAddPackage"
          @remove-package="handleRemovePackage"
      />
    </template>

    <template #assignItemsStep>
      <AssignItemsStep
        :to-ship-items="toShipItems"
        :packages="packages"
        @add-item-to-package="handleAddItemToPackage"
        @remove-item-from-package="handleRemoveItemFromPackage"
      />
    </template>
  </Wizard>
</template>
