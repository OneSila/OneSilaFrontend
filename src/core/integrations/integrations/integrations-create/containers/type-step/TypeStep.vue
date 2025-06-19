<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { IntegrationTypes } from "../../../integrations";
import magentoType from "../../../../../../assets/images/integration-types/magento.png";
import shopifyType from "../../../../../../assets/images/integration-types/shopify.png";
import woocomerceType from "../../../../../../assets/images/integration-types/woo-commerce.jpg";
import amazonType from "../../../../../../assets/images/integration-types/amazon.png";
import { OptionSelector } from "../../../../../../shared/components/molecules/option-selector";
import { Image } from "../../../../../../shared/components/atoms/image";
import { Icon } from "../../../../../../shared/components/atoms/icon";
import { Modal } from "../../../../../../shared/components/atoms/modal";
import { Card } from "../../../../../../shared/components/atoms/card";
import {Badge} from "../../../../../../shared/components/atoms/badge";
import {Button} from "../../../../../../shared/components/atoms/button";

const props = defineProps<{ type: IntegrationTypes }>();
const emit = defineEmits<{ (e: 'update:type', value: IntegrationTypes): void }>();

const { t } = useI18n();

const selectedType = ref(props.type);
const showMagentoInfoModal = ref(false);

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
  { name: IntegrationTypes.Shopify, disabled: false, banner: t('shared.labels.beta') },
  { name: IntegrationTypes.Amazon, banner: t('shared.labels.beta') },
  { name: IntegrationTypes.Woocommerce, disabled: true }
];

const onModalOpen = () => {
  showMagentoInfoModal.value = true;
}

const closeModal = () => {
  showMagentoInfoModal.value = false;
}

</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">
      {{ t('integrations.create.wizard.step1.content') }}
    </h1>
    <Modal v-if="showMagentoInfoModal" v-model="showMagentoInfoModal" @closed="showMagentoInfoModal = false">
      <Card class="modal-content w-[80%] px-10 pt-10">
        <div class="mb-6">
          <h3 class="text-xl font-semibold leading-7 text-gray-900">
            {{ t('integrations.create.wizard.step1.magentoInfoModal.section.integrationTitle') }}
          </h3>
        </div>
        <div class="space-y-6 pr-2 mb=4 overflow-y-auto max-h-96">
          <div>
            <p class="text-sm text-gray-700">
              {{ t('integrations.create.wizard.step1.magentoInfoModal.section.integrationDescription') }}
            </p>
            <ul class="list-disc list-inside text-sm text-gray-700 mt-2">
              <li>{{ t('integrations.create.wizard.step1.magentoInfoModal.section.integrationStep1') }}</li>
              <li>{{ t('integrations.create.wizard.step1.magentoInfoModal.section.integrationStep2') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="text-lg font-semibold">{{ t('integrations.create.wizard.step1.magentoInfoModal.section.apiSettingsTitle') }}</h4>
            <p class="text-sm text-gray-700">
              {{ t('integrations.create.wizard.step1.magentoInfoModal.section.apiSettingsDescription') }}
            </p>
            <ul class="list-disc list-inside text-sm text-gray-700 mt-2">
              <li>{{ t('integrations.create.wizard.step1.magentoInfoModal.section.apiSetting1') }}</li>
              <li>{{ t('integrations.create.wizard.step1.magentoInfoModal.section.apiSetting2') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="text-lg font-semibold text-red-500">{{ t('integrations.create.wizard.step1.magentoInfoModal.section.legacyAuthTitle') }}</h4>
            <p class="text-sm text-gray-700">
              {{ t('integrations.create.wizard.step1.magentoInfoModal.section.legacyAuthWarning') }}
            </p>
          </div>

          <div>
            <h4 class="text-lg font-semibold">{{ t('integrations.create.wizard.step1.magentoInfoModal.section.importTitle') }}</h4>
            <p class="text-sm text-gray-700">
              {{ t('integrations.create.wizard.step1.magentoInfoModal.section.importRecommendation') }}
            </p>
          </div>

          <div>
            <h4 class="text-lg font-semibold">{{ t('integrations.create.wizard.step1.magentoInfoModal.section.eanTitle') }}</h4>
            <p class="text-sm text-gray-700">
              {{ t('integrations.create.wizard.step1.magentoInfoModal.section.eanDescription') }}
            </p>
          </div>
        </div>

        <hr/>
        <div class="flex justify-end gap-4 mt-4">
          <Button class="btn btn-outline-dark" @click="closeModal">{{ t('shared.button.cancel') }}</Button>
        </div>
      </Card>
    </Modal>
    <hr />
    <!-- OptionSelector uses v-model bound to our local selectedType and the choices array -->
    <OptionSelector v-model="selectedType" :choices="typeChoices">
      <template #magento>
        <div>
          <Flex gap="2">
            <FlexCell center>
              <h3 class="text-lg font-bold">{{ t('integrations.create.wizard.step1.magentoTitle') }}</h3>
            </FlexCell>
            <FlexCell center>
              <Icon class="text-gray-500" @click.stop="onModalOpen" name="circle-info" size="lg" />
            </FlexCell>
          </Flex>
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
      <template #amazon>
        <div>
          <h3 class="text-lg font-bold">{{ t('integrations.create.wizard.step1.amazonTitle') }}</h3>
          <p class="mb-4">{{ t('integrations.create.wizard.step1.amazonExample') }}</p>
          <Image :source="amazonType" alt="Amazon" class="w-full max-h-[35rem]" />
        </div>
      </template>
      <template #woocommerce>
        <div>
          <h3 class="text-lg font-bold">{{ t('integrations.create.wizard.step1.woocommerceTitle') }}</h3>
          <p class="mb-4">{{ t('integrations.create.wizard.step1.woocommerceExample') }}</p>
          <Image :source="woocomerceType" alt="woocommerce" class="w-full max-h-[35rem]" />
        </div>
      </template>
    </OptionSelector>
  </div>
</template>
