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

</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">
      {{ t('integrations.create.wizard.step4.woocommerce.content') }}
    </h1>
    <hr />
    <Flex vertical>

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

  </div>
</template>
