<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { IntegrationTypes } from "../../../integrations";
import magentoType from "../../../../../../assets/images/integration-types/magento.png";
import shopifyType from "../../../../../../assets/images/integration-types/shopify.png";
import woocomerceType from "../../../../../../assets/images/integration-types/woo-commerce.jpg";
import amazonType from "../../../../../../assets/images/integration-types/amazon.png";
import webhooksType from "../../../../../../assets/images/integration-types/webhooks.webp";
import ebayType from "../../../../../../assets/images/integration-types/ebay.jpg";
import sheinType from "../../../../../../assets/images/integration-types/shein.png";
import { OptionSelector } from "../../../../../../shared/components/molecules/option-selector";
import { Image } from "../../../../../../shared/components/atoms/image";
import { Icon } from "../../../../../../shared/components/atoms/icon";
import { Modal } from "../../../../../../shared/components/atoms/modal";
import {Badge} from "../../../../../../shared/components/atoms/badge";
import {Button} from "../../../../../../shared/components/atoms/button";
import { MagentoInfoCard, WoocommerceInfoCard, ShopifyInfoCard, WebhookInfoCard } from "./info-cards";

const props = defineProps<{ type: IntegrationTypes }>();
const emit = defineEmits<{ (e: 'update:type', value: IntegrationTypes): void }>();

const { t } = useI18n();

const selectedType = ref(props.type);
const showInfoModal = ref(false);
const infoComponent = ref();

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
  { name: IntegrationTypes.Woocommerce, banner: t('shared.labels.beta') },
  { name: IntegrationTypes.Ebay, banner: t('shared.labels.beta') },
  { name: IntegrationTypes.Shein, banner: t('shared.labels.beta') },
  { name: IntegrationTypes.Webhook, disabled: false }
];

const onModalOpen = () => {
  infoComponent.value = MagentoInfoCard;
  showInfoModal.value = true;
};

const onShopifyModalOpen = () => {
  infoComponent.value = ShopifyInfoCard;
  showInfoModal.value = true;
};

const onWoocommerceModalOpen = () => {
  infoComponent.value = WoocommerceInfoCard;
  showInfoModal.value = true;
};

const onWebhookModalOpen = () => {
  infoComponent.value = WebhookInfoCard;
  showInfoModal.value = true;
};

const closeModal = () => {
  showInfoModal.value = false;
};

</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">
      {{ t('integrations.create.wizard.step1.content') }}
    </h1>
    <Modal v-if="showInfoModal" v-model="showInfoModal" @closed="showInfoModal = false">
      <component :is="infoComponent" @close="closeModal" />
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
          <Flex gap="2">
            <FlexCell center>
              <h3 class="text-lg font-bold">{{ t('integrations.create.wizard.step1.shopifyTitle') }}</h3>
            </FlexCell>
            <FlexCell center>
              <Icon class="text-gray-500" @click.stop="onShopifyModalOpen" name="circle-info" size="lg" />
            </FlexCell>
          </Flex>
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
          <Flex gap="2">
            <FlexCell center>
              <h3 class="text-lg font-bold">{{ t('integrations.create.wizard.step1.woocommerceTitle') }}</h3>
            </FlexCell>
            <FlexCell center>
              <Icon class="text-gray-500" @click.stop="onWoocommerceModalOpen" name="circle-info" size="lg" />
            </FlexCell>
          </Flex>
          <p class="mb-4">{{ t('integrations.create.wizard.step1.woocommerceExample') }}</p>
          <Image :source="woocomerceType" alt="woocommerce" class="w-full max-h-[35rem]" />
        </div>
      </template>
      <template #webhook>
        <div>
          <Flex gap="2">
            <FlexCell center>
              <h3 class="text-lg font-bold">{{ t('integrations.create.wizard.step1.webhookTitle') }}</h3>
            </FlexCell>
            <FlexCell center>
              <Icon class="text-gray-500" @click.stop="onWebhookModalOpen" name="circle-info" size="lg" />
            </FlexCell>
          </Flex>
          <p class="mb-4">{{ t('integrations.create.wizard.step1.webhookExample') }}</p>
          <Image :source="webhooksType" alt="Webhooks" class="w-full mt-10 max-h-[35rem]" />
        </div>
      </template>
      <template #ebay>
        <div>
          <Flex gap="2">
            <FlexCell center>
              <h3 class="text-lg font-bold">{{ t('integrations.create.wizard.step1.ebayTitle') }}</h3>
            </FlexCell>
<!--            <FlexCell center>-->
<!--              <Icon class="text-gray-500" @click.stop="ON" name="circle-info" size="lg" />-->
<!--            </FlexCell>-->
          </Flex>
          <p class="mb-4">{{ t('integrations.create.wizard.step1.ebayExample') }}</p>
          <Image :source="ebayType" alt="ebay" class="w-full max-h-[35rem]" />
        </div>
      </template>
      <template #shein>
        <div>
          <Flex gap="2">
            <FlexCell center>
              <h3 class="text-lg font-bold">{{ t('integrations.create.wizard.step1.sheinTitle') }}</h3>
            </FlexCell>
          </Flex>
          <p class="mb-4">{{ t('integrations.create.wizard.step1.sheinExample') }}</p>
          <Image :source="sheinType" alt="shein" class="w-full max-h-[35rem]" />
        </div>
      </template>
    </OptionSelector>
  </div>
</template>
