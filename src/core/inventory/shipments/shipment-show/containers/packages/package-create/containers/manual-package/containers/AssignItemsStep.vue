<script setup lang="ts">
import {computed, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from "sweetalert2";
import { Icon } from "../../../../../../../../../../shared/components/atoms/icon";
import { Item, Package } from "../../../../configs";

const { t } = useI18n();
const props = defineProps<{ packages: Package[], toShipItems: Item[] }>();
const emit = defineEmits(['add-item-to-package', 'remove-item-from-package']);

const draggingItemId = ref(null);

const handleAddToPackage = async (item, targetPackage = null) => {
  const packageCount = props.packages.length;

  const addItemStep = async (pkg, quantity) => {
    emit('add-item-to-package', item, pkg.id, quantity);
  };

  const addQuantityToPackage = async (pkg) => {
    const { value: quantity } = await Swal.fire({
      title: t('shared.placeholders.quantity'),
      input: 'number',
      inputValue: '1',
      inputAttributes: {
        autocapitalize: 'off',
        inputmode: 'decimal',
        min: '1',
        max: item.quantity.toString(),
      },
      showCancelButton: true,
      confirmButtonText: t('shared.button.submit'),
      cancelButtonText: t('shared.button.cancel'),
      showLoaderOnConfirm: true,
      preConfirm: (quantity) => {
        const parsedQuantity = parseFloat(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
          Swal.showValidationMessage(t('shared.validations.quantity'));
          return false;
        }
        return quantity;
      },
    });

    if (quantity) {
      addItemStep(pkg, parseFloat(quantity));
    }
  };

  const selectPackage = async (quantity) => {
    const { value: selectedPackageId } = await Swal.fire({
      title: t('inventory.packages.create.manual.assignItemsStep.modal.package'),
      input: 'select',
      inputOptions: props.packages.reduce((options, pkg, index) => {
        options[pkg.id] = t('inventory.packages.create.manual.assignItemsStep.packageName', { index: index + 1 });
        return options;
      }, {}),
      showCancelButton: true,
      confirmButtonText: t('shared.button.submit'),
      cancelButtonText: t('shared.button.cancel'),
    });

    if (selectedPackageId) {
      const selectedPackage = props.packages.find(pkg => pkg.id === selectedPackageId);
      addItemStep(selectedPackage, quantity);
    }
  };

  const selectQuantityAndPackage = async () => {
    const { value: selection } = await Swal.fire({
      title: t('inventory.packages.create.manual.assignItemsStep.modal.title'),
      html: `
        <label class="text-black">${t('shared.labels.quantity')}</label>
      <input id="quantity" type="number" value="1" min="1" max="${item.quantity}" class="swal2-input text-black">
        <label class="mt-4 text-black">${t('inventory.packages.create.manual.assignItemsStep.modal.package')}</label>
        <select id="package" class="swal2-input text-black">
          ${props.packages.map((pkg, index) =>
            `<option value="${pkg.id}">${t('inventory.packages.create.manual.assignItemsStep.packageName', { index: index + 1 })}</option>`
          ).join('')}
        </select>`,
      focusConfirm: false,
      preConfirm: () => {
        return {
          quantity: (document.getElementById('quantity') as HTMLInputElement).value,
          packageId: (document.getElementById('package') as HTMLSelectElement).value,
        };
      },
    });

    if (selection) {
      const selectedPackage = props.packages.find(pkg => pkg.id === selection.packageId);
      addItemStep(selectedPackage, parseFloat(selection.quantity));
    }
  };

  if (targetPackage) {
    // Direct drop into a package, handle quantity
    if (item.quantity > 1) {
      await addQuantityToPackage(targetPackage);
    } else {
      addItemStep(targetPackage, 1);  // Auto-add single quantity to the target package
    }
  } else {
      if (item.quantity === 1 && packageCount === 1) {
      // Case 1: Single quantity, single package
      addItemStep(props.packages[0], 1);
    } else if (item.quantity > 1 && packageCount === 1) {
      // Case 2: Multiple quantities, single package
      await addQuantityToPackage(props.packages[0]);
    } else if (item.quantity === 1 && packageCount > 1) {
      // Case 3: Single quantity, multiple packages
      await selectPackage(1);
    } else if (item.quantity > 1 && packageCount > 1) {
      // Case 4: Multiple quantities, multiple packages
      await selectQuantityAndPackage();
    }
  }

};


const handleRemoveFromPackage = (itemId, pkgId) => {
  emit('remove-item-from-package', itemId, pkgId);
};

const dragStart = (item) => {
  draggingItemId.value = item.id;
};

const dragEnd = () => {
  draggingItemId.value = null;
};

const allowDrop = (event) => {
  event.preventDefault();
};

const handleDrop = async (pkg) => {

  const item = props.toShipItems.find(i => i.id === draggingItemId.value);
  if (item) {
    await handleAddToPackage(item, pkg);
  }
  dragEnd();
};

const noItemsToShip = computed(() => {
  return props.toShipItems.every(item => item.quantity === 0);
});


</script>

<template>

  <div>
    <p class="text-center text-gray-600 mb-6">{{ t('inventory.packages.create.manual.assignItemsStep.description') }}</p>
    <hr>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
    <!-- Items to Ship -->
    <div>
      <div v-if="noItemsToShip">
        <p class="text-center">{{ t('inventory.packages.create.manual.assignItemsStep.noItemsToShip') }}</p>
      </div>
      <table v-else class="table-auto w-full">
        <thead>
          <tr>
            <th>{{ t('shared.labels.name') }}</th>
            <th>{{ t('shared.labels.quantity') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in toShipItems" :key="item.id">
                      <tr
            draggable="true"
            @dragstart="dragStart(item)"
            @dragend="dragEnd"
            v-if="item.quantity > 0"
          >
            <td>{{ item.product.name }}</td>
            <td>{{ item.quantity }}</td>
            <td>
              <Icon name="plus" class="cursor-pointer" @click="handleAddToPackage(item)" />
            </td>
          </tr>
          </template>

        </tbody>
      </table>
    </div>

    <!-- Packages with Items -->
    <Flex vertical>
      <FlexCell v-for="(pkg, index) in packages" :key="pkg.id" class="mb-4">
        <div class="rounded-lg border border-gray-300 bg-white dark:bg-gray-800 shadow-md" @drop="handleDrop(pkg)" @dragover="allowDrop">
          <!-- Header -->
          <Flex vertical class="rounded-t-lg bg-gray-800 text-white p-4">
            <FlexCell>
              <h4 class="text-lg font-semibold">{{ t('inventory.packages.create.manual.assignItemsStep.packageName', { index: index + 1 }) }}</h4>
            </FlexCell>
            <FlexCell>
              <p>{{ pkg.form.trackingCode }}</p>
            </FlexCell>
          </Flex>

          <!-- Package Items -->
          <div class="p-4">
            <h5 v-if="pkg.items.length == 0" class="text-md font-semibold">{{ t('inventory.packages.create.manual.assignItemsStep.emptyPackage') }}</h5>
              <table v-else class="table-auto w-full">
                <tbody>
                  <tr v-for="item in pkg.items" :key="item.id" class="border-t border-gray-200">
                    <td class="py-2">{{ item.product.name }}</td>
                    <td class="py-2">{{ item.quantity }}</td>
                    <td class="py-2 text-right">
                      <Icon name="trash" class="cursor-pointer text-red-600" @click="handleRemoveFromPackage(item.id, pkg.id)" />
                    </td>
                  </tr>
                </tbody>
              </table>
          </div>
        </div>
      </FlexCell>
    </Flex>
  </div>
  </div>
</template>

<style scoped>
  .swal2-html-container label,
  .swal2-html-container select,
  .swal2-html-container input {
    color: inherit !important;
  }
</style>
