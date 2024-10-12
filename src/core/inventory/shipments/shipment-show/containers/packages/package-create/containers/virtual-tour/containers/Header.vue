<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {Icon} from "../../../../../../../../../../shared/components/atoms/icon";
import {Item, Package, StepType} from "../../../../configs";

const props = defineProps<{
  toShipItems: Item[],
  packages: Package[],
  progressPercentage: number,
  step: number,
  currentStep: StepType
}>();


const emit = defineEmits(['update-items']);

const { t } = useI18n();
const draggingIndex = ref(null);

const getPackageName = (index) => {
  return t('inventory.packages.create.virtual.virtualTour.packageName', { index: index + 1 });
};

// Handle dragging
const dragStart = (index) => {
  draggingIndex.value = index;
};

const dragEnter = (index) => {
  if (draggingIndex.value === null || draggingIndex.value === index) return;

  // Swap the items when dragging over another one
  const newItems = [...props.toShipItems];
  const [draggedItem] = newItems.splice(draggingIndex.value, 1);
  newItems.splice(index, 0, draggedItem);

  draggingIndex.value = index;

  // Emit to parent for update
  emit('update-items', newItems);
};

const dragEnd = () => {
  draggingIndex.value = null;
};

// Function to handle sorting of items
const handleSortOrderChange = (index, direction) => {
  const newItems = [...props.toShipItems]; // Create a new array from the existing items

  // Handle moving the item up or down
  if (direction === 'up' && index > 0) {
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
  } else if (direction === 'down' && index < newItems.length - 1) {
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
  }

  // Emit the updated items array to the parent component
  emit('update-items', newItems);
};

const isCurrentCollectStep = (item) => {
  return props.currentStep.type === 'collect' && props.currentStep.item !== null && props.currentStep.item.id === item.id;
};

const isCurrentMoveStep = (item) => {
  return props.currentStep.type === 'move' && props.currentStep.item !== null && props.currentStep.item.id === item.id;
};


</script>

<template>
  <div class="header p-6 rounded-t-lg border-gray-300 border-t-2 border-l-2 border-r-2 bg-gray-50">
    <!-- Left: Items to Ship -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="overflow-y-auto max-h-60">
        <h3 class="text-lg font-bold">{{ t('inventory.packages.create.virtual.virtualTour.itemsToShip') }}</h3>
        <table class="table-auto w-full">
          <thead>
            <tr>
              <th>{{ t('shared.labels.name') }}</th>
              <th>{{ t('shared.labels.quantity') }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in toShipItems"
              :key="item.id"
              draggable="true"
              @dragstart="step === 0 ? dragStart(index) : null"
              @dragenter="step === 0 ? dragEnter(index) : null"
              @dragend="step === 0 ? dragEnd() : null"
              :class="[
                step === 0 ? 'cursor-move' : '',
                item.quantity === 0 ? 'line-through' : '',
                isCurrentCollectStep(item) ? 'bg-yellow-50' : '',
                isCurrentMoveStep(item) ? 'bg-blue-50' : '',
              ]"
            >
              <td>
                <span v-if="isCurrentCollectStep(item)">
                  <Icon name="caret-right" class="mr-2 text-indigo-600" />
                </span>
                <span v-if="isCurrentMoveStep(item)">
                  <Icon name="person-walking" class="mr-2 text-indigo-600" />
                </span>
                {{ item.product.name }}
              </td>
              <td>{{ item.quantity }}</td>
              <td v-if="step === 0">
                <Icon
                  v-if="index !== 0"
                  name="arrow-up"
                  class="cursor-pointer text-primary mr-2"
                  @click="handleSortOrderChange(index, 'up')"
                />
                <Icon
                  v-if="index !== props.toShipItems.length - 1"
                  name="arrow-down"
                  class="cursor-pointer text-primary"
                  @click="handleSortOrderChange(index, 'down')"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Right: Packages -->
      <div>
        <h3 class="text-lg font-bold">{{ t('inventory.packages.create.virtual.virtualTour.packages') }}</h3>
        <div v-if="packages.length === 0" class="text-gray-500">
          {{ t('inventory.packages.create.virtual.virtualTour.noPackagesYet') }}
        </div>
        <div class="overflow-y-auto max-h-60">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(pkg, index) in packages"
            :key="pkg.id"
            :class="['package-box', { 'closed': index < packages.length - 1 }]">
            <!-- Package Header -->
            <div class="package-header">
              <div class="package-title">{{ getPackageName(index) }}</div>
              <div class="package-items">{{ pkg.items.length }} {{ t('shared.tabs.items') }}</div>
            </div>

            <!-- Package Items -->
            <table class="package-content">
              <tbody>
                <tr v-for="item in pkg.items" :key="item.id" class="package-item">
                  <td>{{ item.product.name }}</td>
                  <td>x{{ item.quantity }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>

    <div class="my-8">
      <hr>
    </div>
    <!-- Progress Bar -->
    <div>
      <div class="mb-6 grid grid-cols-3 text-sm font-medium text-gray-600">
          <div class="text-indigo-600">{{ t('inventory.packages.create.virtual.virtualTour.prepare') }}</div>
          <div class="text-center" :class="{ 'text-indigo-600': progressPercentage >= 20 }">{{ t('inventory.packages.create.virtual.virtualTour.collect') }}</div>
          <div class="text-right" :class="{ 'text-indigo-600': progressPercentage === 100 }">{{ t('inventory.packages.create.virtual.virtualTour.confirm') }}</div>
        </div>
        <div class="overflow-hidden rounded-full bg-gray-200">
          <div class="h-2 rounded-full bg-indigo-600" :style="{ width: `${progressPercentage}%` }" />
        </div>
      </div>
  </div>
</template>

<style scoped>

.package-box {
  position: relative;
  background-color: #f5f5f5;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  overflow: hidden; /* Ensures the pseudo-elements (flaps) stay within bounds */
}

.package-box:hover {
  transform: translateY(-5px);
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2);
}

/* Opened Box Look */
.package-box::before,
.package-box::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 30px;
  background-color: #f5f5f5;
  border-left: 2px solid #d1d5db;
  border-right: 2px solid #d1d5db;
  transition: all 0.3s ease;
}

/* Simulating the open flaps */
.package-box::before {
  top: -30px;
  border-top: 2px solid #d1d5db;
  border-radius: 10px 10px 0 0;
  transform: perspective(200px) rotateX(30deg); /* Adjusted for better open-flap effect */
  transform-origin: bottom;
}

.package-box::after {
  bottom: -30px;
  border-bottom: 2px solid #d1d5db;
  border-radius: 0 0 10px 10px;
  transform: perspective(200px) rotateX(-30deg);
  transform-origin: top;
}

/* Closed Box Look */
.package-box.closed::before,
.package-box.closed::after {
  height: 5px;
  background-color: #d1d5db;
  transform: rotate(0deg);
}

/* Package Header Styling */
.package-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed #d1d5db;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.package-title {
  font-weight: bold;
  color: #374151;
}

.package-items {
  font-size: 14px;
  color: #6b7280;
}

/* Table Styles */
.package-content {
  width: 100%;
  margin-top: 10px;
  border-collapse: collapse;
}

.package-content td {
  padding: 8px 0;
  border-top: 1px dashed #e5e7eb;
}

.package-item + .package-item td {
  border-top: 1px dashed #e5e7eb;
}

/* Custom scrollbar for webkit browsers */
.overflow-y-auto {
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #4a5568 #edf2f7; /* Firefox */
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #edf2f7; /* Light gray background for the scrollbar track */
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #4a5568; /* Dark gray for the scrollbar handle */
  border-radius: 10px;
  border: 2px solid #edf2f7; /* Padding around the scrollbar handle */
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #2d3748; /* Darker gray when hovering */
}


</style>