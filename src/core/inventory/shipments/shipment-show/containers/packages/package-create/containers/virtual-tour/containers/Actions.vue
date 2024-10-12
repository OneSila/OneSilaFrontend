<script setup lang="ts">
import { ref, computed } from 'vue';
import { PrimaryButton } from "../../../../../../../../../../shared/components/atoms/button-primary";
import { TextInput } from "../../../../../../../../../../shared/components/atoms/input-text";
import { DangerButton } from "../../../../../../../../../../shared/components/atoms/button-danger";
import { useI18n } from "vue-i18n";
import {StepType} from "../../../../configs";

const { t } = useI18n();
const props = defineProps<{ step: StepType }>();


const form = ref({ quantity: '' });

// Computed property for handling conditional rendering of the buttons
const availableQuantity = computed(() => props.step.availableLocation?.quantity || 1);

const showQuantityInput = computed(() => availableQuantity.value > 1);

const emit = defineEmits(['start', 'arrived', 'add-all', 'add-quantity', 'package-full', 'finish']);

const handleAddQuantity = () => {
  emit('add-quantity', form.value.quantity);
  form.value.quantity = '';
};

</script>

<template>
  <Flex between class="pb-6 pt-4 px-4 gap-2">
    <!-- Empty FlexCell to push everything to the right -->
    <FlexCell grow></FlexCell>

    <!-- Primary Action Buttons -->
    <!-- Prepare Step -->
    <FlexCell>
      <PrimaryButton v-if="props.step.type === 'prepare'" @click="$emit('start')">
        {{ t('inventory.packages.create.virtual.actions.start') }}
      </PrimaryButton>
    </FlexCell>

    <!-- Move Step -->
    <FlexCell>
      <PrimaryButton v-if="props.step.type === 'move'" @click="$emit('arrived')">
        {{ t('inventory.packages.create.virtual.actions.arrived') }}
      </PrimaryButton>
    </FlexCell>

    <FlexCell v-if="props.step.type === 'collect' && showQuantityInput" class="border border-gray-300 rounded-md p-1" center>
      <Flex>
        <!-- Show the quantity input only if needed -->
        <FlexCell>
          <TextInput
            v-model="form.quantity"
            number
            :placeholder="t('inventory.packages.create.virtual.actions.quantityInputPlaceholder')"
            class="w-40 mr-2"
          />
        </FlexCell>
        <FlexCell v-if="props.step.type === 'collect' && showQuantityInput">
          <PrimaryButton @click="handleAddQuantity">
            {{ t('inventory.packages.create.virtual.actions.addQuantity') }}
          </PrimaryButton>
        </FlexCell>
      </Flex>
    </FlexCell>

    <!-- Collect Step - Individual buttons for each action -->
    <FlexCell center>
      <PrimaryButton v-if="props.step.type === 'collect'" @click="$emit('add-all')">
        <template v-if="showQuantityInput">
          {{ t('inventory.packages.create.virtual.actions.addAll') }}
        </template>
        <template v-else>
          {{ t('shared.button.add' )}}
        </template>
      </PrimaryButton>
    </FlexCell>

    <!-- Package Full Button -->
    <FlexCell center>
      <DangerButton v-if="props.step.type === 'collect'" @click="$emit('package-full')">
        {{ t('inventory.packages.create.virtual.actions.packageFull') }}
      </DangerButton>
    </FlexCell>

    <!-- Confirm Step -->
    <FlexCell>
      <PrimaryButton v-if="props.step.type === 'confirm'" @click="$emit('finish')">
        {{ t('inventory.packages.create.virtual.actions.finish') }}
      </PrimaryButton>
    </FlexCell>
  </Flex>
</template>