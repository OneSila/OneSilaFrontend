<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import { Label } from "../../../../../../../shared/components/atoms/label";
import { TextInput } from "../../../../../../../shared/components/atoms/input-text";
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
      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.consumerKey') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <TextInput
                    class="w-96"
                    v-model="channelInfo.consumerKey"
                    :placeholder="t('integrations.placeholders.consumerKey')"
                />
              </FlexCell>
            </Flex>
          </FlexCell>
        </Flex>
      </FlexCell>
      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.consumerSecret') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <TextInput
                    class="w-96"
                    v-model="channelInfo.consumerSecret"
                    :placeholder="t('integrations.placeholders.consumerSecret')"
                />
              </FlexCell>
            </Flex>
          </FlexCell>
        </Flex>
      </FlexCell>
    </Flex>
  </div>
</template>
