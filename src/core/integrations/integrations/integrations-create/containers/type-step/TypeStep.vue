<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { IntegrationTypes } from "../../../integrations";
// Import the images for integration types.
import magentoType from "../../../../../../assets/images/integration-types/magento.png";
import shopifyType from "../../../../../../assets/images/integration-types/shopify.png";
import { OptionSelector } from "../../../../../../shared/components/molecules/option-selector";
import {Image} from "../../../../../../shared/components/atoms/image";

const props = defineProps<{ type: IntegrationTypes }>();
const emit = defineEmits<{ (e: 'update:type', value: IntegrationTypes): void }>();

const { t } = useI18n();

const selectedType = ref(props.type);

watch(selectedType, (newVal) => {
  emit('update:type', newVal);
});

watch(
  () => props.type,
  (newVal) => {
    selectedType.value = newVal;
  }
);

const typeChoices = [
  { name: IntegrationTypes.Magento, disabled: false },
  { name: IntegrationTypes.Shopify, disabled: true }
];
</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">
      {{ t('integrations.create.wizard.step1.content') }}
    </h1>
    <hr />
    <!-- OptionSelector uses v-model bound to our local selectedType and the choices array -->
    <OptionSelector v-model="selectedType" :choices="typeChoices">
      <template #magento>
        <div>
          <h3 class="text-lg font-bold">{{ t('integrations.create.wizard.step1.magentoTitle') }}</h3>
          <p class="mb-4">{{ t('integrations.create.wizard.step1.magentoExample') }}</p>
          <Image :source="magentoType" alt="Magento" class="w-full max-h-[35rem] pt-20" />
        </div>
      </template>
      <template #shopify>
        <div>
          <h3 class="text-lg font-bold">{{ t('integrations.create.wizard.step1.shopifyTitle') }}</h3>
          <p class="mb-4">{{ t('integrations.create.wizard.step1.shopifyExample') }}</p>
          <Image :source="shopifyType" alt="Shopify" class="w-full max-h-[35rem]" />
        </div>
      </template>
    </OptionSelector>
  </div>
</template>
