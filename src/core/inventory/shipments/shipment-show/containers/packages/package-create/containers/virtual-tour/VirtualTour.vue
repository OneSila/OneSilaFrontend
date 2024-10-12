<script setup lang="ts">
import {ref, computed, onMounted, Ref} from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from "../../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import {
  createFormConfigConstructor,
  createInventoryMovement,
  createPackage,
  getItemPickingLocations,
  getPackageTypeOptions, Item, Package, PickingLocation,
  StepType
} from "../../../configs";
import { useRouter } from "vue-router";
import Header from './containers/Header.vue';
import Instruction from './containers/Instruction.vue';
import Actions from './containers/Actions.vue';
import {PackageStatus} from "../../../../../../../../../shared/utils/constants";
import {Loader} from "../../../../../../../../../shared/components/atoms/loader";
import Swal from "sweetalert2";
import {updatePackageMutation} from "../../../../../../../../../shared/api/mutations/inventory.js";
import ConfirmSection from "./containers/ConfirmSection.vue";
import {ShipmentStatus, updateShipmentStatus} from "../../../../../../configs";

const { t } = useI18n();
const router = useRouter();


// Props for shipment ID and items to ship
const props = defineProps<{ shipmentId: string, items: Item[] }>();

// Step and data management
const step = ref(0);
const currentItem: Ref<Item | null> = ref(null);

const loading = ref(false);
const steps = ref<StepType[]>([
  {
    item: null,
    availableLocation: null,
    type: 'prepare',
  },
]);

const currentStep = computed(() => steps.value[step.value]);

const packages: Ref<Package[]> = ref([]);
const toShipItems: Ref<Item[]> = ref(props.items);

// Fetch shipment items if necessary (depending on your flow)
onMounted(async () => {
  // You can add logic to fetch any necessary data
});

// Computed properties for progress and steps
const progressPercentage = computed(() => {
  const totalSteps = (toShipItems.value.length*2) + 2;
  return Math.round((step.value / totalSteps) * 100);
});

const handleRemovePackage = (index) => {
  const packageToRemove = packages.value[index];
  if (packageToRemove.items.length > 0) {
    Toast.error(t('inventory.packages.create.virtual.error.cannotRemoveWithItems'));
  } else {
    packages.value.splice(index, 1);
  }
};

const handleUpdateItems = (updatedItems) => {
  toShipItems.value = updatedItems;
};


const selectPackageType = async () => {
  const packageTypeOptions = getPackageTypeOptions(t).reduce((options, option) => {
    options[option.code] = option.name;
    return options;
  }, {});

  const { value: selectedType } = await Swal.fire({
    title: t('inventory.packages.create.virtual.selectPackageType'),
    input: 'select',
    inputOptions: packageTypeOptions, // Using dynamic package type options
    showCancelButton: true,
    confirmButtonText: t('shared.button.submit'),
    cancelButtonText: t('shared.button.cancel'),
    inputValidator: (value) => {
      if (!value) {
        return t('inventory.packages.create.virtual.packageType.error');
      }
    }
  });

  return selectedType;
};

// Create a new package and add it to the frontend
const createNewPackage = async (selectedType) => {
  let formData = {
    shipment: { id: props.shipmentId },
    type: selectedType,
    status: PackageStatus.IN_PROGRESS,
    trackingCode: '',
    trackingLink: '',
    shippingLabel: null,
    customsDocument: null,
  };

  const createdPackageId = await createPackage(apolloClient, formData);

  if (!createdPackageId) {
    return null;
  }

  const formConfig = createFormConfigConstructor(t, props.shipmentId, true);

  const newPackage = {
    id: createdPackageId,
    form: formData,
    type: selectedType,
    items: [],
    status: PackageStatus.IN_PROGRESS,
    config: formConfig,
  };

  packages.value.push(newPackage);
  return createdPackageId;
};

// Update the last package's status to PACKED
const updatePackageStatus = async (lastPackageId) => {
  const formData = {
    id: lastPackageId,
    status: PackageStatus.PACKED,
  };

  // Update package status in the backend
  const isUpdated = await apolloClient.mutate({
    mutation: updatePackageMutation,
    variables: { data: formData },
  });

  if (isUpdated) {
    const updatedPackage = packages.value.find(pkg => pkg.id === lastPackageId);
    if (updatedPackage) {
      updatedPackage.form.status = PackageStatus.PACKED;
    }
  }

  return isUpdated;
};

const handleStart = async () => {
  loading.value = true;

  // Set currentItem to the first item in toShipItems (sorted by user)
  currentItem.value = toShipItems.value[0];

  // Select package type (box or pallet)
  const selectedType = await selectPackageType();

  // If user cancels or doesn't select a type, return early
  if (!selectedType) {
    loading.value = false;
    return;
  }

  // Create a new package
  const createdPackageId = await createNewPackage(selectedType);

  if (!createdPackageId) {
    loading.value = false;
    return;
  }

  // Prepare next steps for the current item based on available locations
  await generateItemNextSteps();

  // Move to the next step
  step.value++;

  loading.value = false;
};


const generateItemNextSteps = async () => {

  if (currentItem.value == null) {
    steps.value.push({
      item: null,
      availableLocation: null,
      type: 'confirm',
    });
  } else {
    // Fetch available picking locations for the item
    let pickingLocations = []
    try {
      pickingLocations = await getItemPickingLocations(apolloClient, currentItem.value.id);
    } catch (error: any) {
      loading.value = false;
      if (error.message.includes("pop from empty list")) {
        Toast.error(t('inventory.packages.create.virtual.error.noStockForProduct'));
      }
      return
    }

    if (!pickingLocations || pickingLocations.length === 0) {
      return;
    }

    // Dynamically generate steps for each available location
    pickingLocations.forEach((location) => {
      steps.value.push({
        item: currentItem.value,
        availableLocation: location,
        type: 'move',  // The first step is moving to the location
      });

      // Collect step after arriving at the location
      steps.value.push({
        item: currentItem.value,
        availableLocation: location,
        type: 'collect',  // The second step is collecting the item
      });
    });
  }

};



const handleArrived = () => {
  // Handler logic for marking "Arrived" (move)
  step.value += 1;
};

const goToNextStep = async () => {
  // If the current step exceeds the number of steps, handle moving to the next item
  if (step.value >= steps.value.length - 1 && currentItem.value !== null) {
    // Find the index of the current item in the toShipItems array
    const currentIndex = toShipItems.value.findIndex(item => item.id === currentItem.value!.id);

    if (currentIndex !== -1 && currentIndex < toShipItems.value.length - 1) {
      // Move to the next item in the toShipItems array
      currentItem.value = toShipItems.value[currentIndex + 1];

      // Generate new steps for the next item
      await generateItemNextSteps();
    } else {
      currentItem.value = null;
      const lastPackage = packages.value[packages.value.length - 1];
      const updateStatusSuccess = await updatePackageStatus(lastPackage.id);

      await generateItemNextSteps();
    }
  }

  step.value += 1;
};

const addItemToPackage = (packageObject, item, availableLocation, quantityToMove) => {
  const existingItem = packageObject.items.find(pkgItem => pkgItem.id === item.id);
  if (existingItem) {
    // Increase the quantity for the existing item
    existingItem.quantity += quantityToMove;
  } else {
    // Add the item to the package with the specified quantity
    packageObject.items.push({
      id: item.id,
      product: {
        id: item.product.id,
        name: item.product.name,
      },
      inventorylocation: {
        id: availableLocation.location.id,
        name: availableLocation.location.name,
      },
      quantity: quantityToMove,
    });
  }
};


const handleAddAll = async () => {
  const item: Item | null = currentStep.value.item;
  const availableLocation: PickingLocation | null = currentStep.value.availableLocation;
  const lastPackage: Package = packages.value[packages.value.length - 1];

  if (item == null || availableLocation == null) {
    return;
  }

  const toShipItem: Item|undefined = toShipItems.value.find(shipItem => shipItem.id === item.id);

  if (!toShipItem) {
    return;
  }

  const quantityToMove = toShipItem.quantity;

  // Create inventory movement for the full quantity
  const isMovementCreated = await createInventoryMovement(apolloClient, {
    product: item.product,
    quantity: quantityToMove,
    inventorylocation: availableLocation.location
  }, lastPackage.id);

  if (!isMovementCreated) {
    Toast.error(t('inventory.packages.create.virtual.error.inventoryMovementFailed', { itemName: item.product.name }));
    return;
  }

  addItemToPackage(lastPackage, item, availableLocation, quantityToMove);
  toShipItem.quantity = 0;

  // Proceed to the next step or item
  goToNextStep();
};

const handleAddQuantity = async (quantityToMove) => {
  const item = currentStep.value.item;
  const availableLocation = currentStep.value.availableLocation;
  const lastPackage = packages.value[packages.value.length - 1];

  if (item == null || availableLocation == null) {
    return;
  }

  // Validate that the input quantity does not exceed the item's available quantity
  if (quantityToMove > item.quantity) {
    Toast.error(t('inventory.packages.create.virtual.error.quantityExceedsAvailable', { available: item.quantity }));
    return;
  }

  // Create inventory movement for the specified quantity
  const isMovementCreated = await createInventoryMovement(apolloClient, {
    product: item.product,
    quantity: quantityToMove,
    inventorylocation: availableLocation.location
  }, lastPackage.id);

  if (!isMovementCreated) {
    Toast.error(t('inventory.packages.create.virtual.error.inventoryMovementFailed', { itemName: item.product.name }));
    return;
  }

  addItemToPackage(lastPackage, item, availableLocation, quantityToMove);


  // Update toShipItems - subtract the moved quantity
  const toShipItem: Item | undefined = toShipItems.value.find(shipItem => shipItem.id === item.id);
  if (toShipItem) {
    toShipItem.quantity -= quantityToMove;

    // If no more quantity to ship, move to next step or item
    if (toShipItem.quantity === 0) {
      goToNextStep();
    }
  }

};

const handlePackageFull = async () => {
  loading.value = true;

  // Get the last package (the one currently being filled)
  const lastPackage: Package = packages.value[packages.value.length - 1];

  if (!lastPackage) {
    loading.value = false;
    return;
  }

  // Step 1: Update the current package's status to 'PACKED'
  const updateStatusSuccess = await updatePackageStatus(lastPackage.id);

  if (!updateStatusSuccess) {
    Toast.error(t('inventory.packages.create.virtual.packageFull.error'));
    loading.value = false;
    return;
  }

  // Step 2: Select the new package type
  const selectedType = await selectPackageType();

  // If user cancels or doesn't select a type, return early
  if (!selectedType) {
    loading.value = false;
    return;
  }

  // Step 3: Create a new package and add it to the frontend
  const newPackageId = await createNewPackage(selectedType);

  if (!newPackageId) {
    loading.value = false;
    return;
  }

  // Continue processing the next step
  loading.value = false;
};


const handleFinish = async () => {
  const isStatusUpdated = await updateShipmentStatus(apolloClient, props.shipmentId, ShipmentStatus.DONE);

  Toast.success(t('inventory.packages.create.virtual.confirmationSuccess'));
  router.push({ name: 'inventory.shipments.show', params: { id: props.shipmentId }, query: { tab: 'packages' } });

};


const handleSavePackage = async (pkg) => {
  try {
    // Unpack the form and add the package ID
    const updatedData = {
      id: pkg.id,
      ...pkg.form, // Spread the form data (type, trackingCode, trackingLink, etc.)
    };

    // Perform the mutation to save the package details
    const { data } = await apolloClient.mutate({
      mutation: updatePackageMutation,
      variables: { data: updatedData },
    });

    if (data.updatePackage) {
      Toast.success(t('inventory.packages.create.virtual.packageSave.success'));
    } else {
      Toast.error(t('inventory.packages.create.virtual.packageSave.error'));
    }
  } catch (error) {
    console.error('Error saving package:', error);
    Toast.error(t('inventory.packages.create.virtual.packageSave.error'));
  }
};


</script>

<template>
  <div class="virtual-tour">
    <!-- Header section -->
    <Loader :loading="loading" />
    <Header
      :toShipItems="toShipItems"
      :packages="packages"
      :progressPercentage="progressPercentage"
      :step="step"
      :current-step="currentStep"
      @update-items="handleUpdateItems"
    />
    <div class="border-l-2 border-r-2 border-b-2 border-gray-300 rounded-b-lg">
      <!-- Instruction section -->
      <Instruction :current-step="currentStep" :packages="packages" :to-ship-items="toShipItems" />

      <ConfirmSection v-if="currentStep.type === 'confirm'" :packages="packages" @save-package="handleSavePackage" />

      <div class="mt-6">
        <hr>
      </div>
      <!-- Actions section -->
      <Actions
        v-if="currentStep "
        :step="currentStep"
        @start="handleStart"
        @arrived="handleArrived"
        @add-all="handleAddAll"
        @add-quantity="handleAddQuantity"
        @package-full="handlePackageFull"
        @finish="handleFinish"
      />
    </div>
  </div>
</template>
