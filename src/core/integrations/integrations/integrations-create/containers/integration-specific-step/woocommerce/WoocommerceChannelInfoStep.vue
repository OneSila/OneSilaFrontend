<script setup lang="ts">
import { defineProps, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Label } from "../../../../../../../shared/components/atoms/label";
import { TextInput } from "../../../../../../../shared/components/atoms/input-text";
import { Icon } from "../../../../../../../shared/components/atoms/icon";
import { Modal } from "../../../../../../../shared/components/atoms/modal";
import { Card } from "../../../../../../../shared/components/atoms/card";
import type { WoocommerceChannelInfo } from '../../../../integrations';

const props = defineProps<{ channelInfo: WoocommerceChannelInfo }>();
const { t } = useI18n();

const showWooCommerceInfoModal = ref(false);

const onModalOpen = () => {
  showWooCommerceInfoModal.value = true;
};

const closeModal = () => {
  showWooCommerceInfoModal.value = false;
};
</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">
      {{ t('integrations.create.wizard.step4.woocommerce.content') }}
    </h1>
    <hr />
    <Flex vertical>
      <!-- Info Icon with Modal -->
      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Icon class="text-gray-500 cursor-pointer" @click="onModalOpen" name="circle-info" size="lg" />
          </FlexCell>
        </Flex>
      </FlexCell>

      <!-- API Key Field -->
      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.apiKey') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <TextInput
                    class="w-96"
                    v-model="channelInfo.apiKey"
                    :placeholder="t('integrations.placeholders.apiKey')"
                />
              </FlexCell>
            </Flex>
          </FlexCell>
        </Flex>
      </FlexCell>

      <!-- API Secret Field -->
      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.apiSecret') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <TextInput
                    class="w-96"
                    v-model="channelInfo.apiSecret"
                    :placeholder="t('integrations.placeholders.apiSecret')"
                />
              </FlexCell>
            </Flex>
          </FlexCell>
        </Flex>
      </FlexCell>
    </Flex>

    <!-- WooCommerce Info Modal -->
    <Modal v-model="showWooCommerceInfoModal">
      <Card>
        <template #header>
          <h3 class="text-lg font-semibold">{{ t('integrations.create.wizard.step1.woocommerceInfoModal.title') }}</h3>
        </template>
        <template #body>
          <div class="space-y-6">
            <!-- Integration Section -->
            <div>
              <h4 class="font-semibold mb-2">{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationTitle') }}</h4>
              <p class="mb-4">{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationDescription') }}</p>
              <ol class="list-decimal list-inside space-y-2">
                <li>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep1') }}</li>
                <li>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep2') }}</li>
                <li>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep3') }}</li>
              </ol>
            </div>

            <!-- API Settings Section -->
            <div>
              <h4 class="font-semibold mb-2">{{ t('integrations.create.wizard.step1.woocommerceInfoModal.apiSettingsTitle') }}</h4>
              <p class="mb-4">{{ t('integrations.create.wizard.step1.woocommerceInfoModal.apiSettingsDescription') }}</p>
              <ul class="list-disc list-inside space-y-2">
                <li>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.apiSetting1') }}</li>
                <li>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.apiSetting2') }}</li>
              </ul>
            </div>

            <!-- Import Section -->
            <div>
              <h4 class="font-semibold mb-2">{{ t('integrations.create.wizard.step1.woocommerceInfoModal.importTitle') }}</h4>
              <p>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.importRecommendation') }}</p>
            </div>

            <!-- EAN Codes Section -->
            <div>
              <h4 class="font-semibold mb-2">{{ t('integrations.create.wizard.step1.woocommerceInfoModal.eanTitle') }}</h4>
              <p>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.eanDescription') }}</p>
            </div>
          </div>
        </template>
      </Card>
    </Modal>
  </div>
</template>
