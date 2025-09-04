<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import { TextInput } from '../../../../../../../shared/components/atoms/input-text';
import { Label } from '../../../../../../../shared/components/atoms/label';
import { Selector } from '../../../../../../../shared/components/atoms/selector';
import type { WebhookChannelInfo } from '../../../../integrations';

const props = defineProps<{ channelInfo: WebhookChannelInfo }>();
const { t } = useI18n();

const topicChoices = [
  { id: 'product', text: t('integrations.webhook.choices.topic.product') },
  { id: 'ean_code', text: t('integrations.webhook.choices.topic.ean_code') },
  { id: 'price_list', text: t('integrations.webhook.choices.topic.price_list') },
  { id: 'price_list_item', text: t('integrations.webhook.choices.topic.price_list_item') },
  { id: 'media', text: t('integrations.webhook.choices.topic.media') },
  { id: 'media_through', text: t('integrations.webhook.choices.topic.media_through') },
  { id: 'property', text: t('integrations.webhook.choices.topic.property') },
  { id: 'select_value', text: t('integrations.webhook.choices.topic.select_value') },
  { id: 'property_rule', text: t('integrations.webhook.choices.topic.property_rule') },
  { id: 'property_rule_item', text: t('integrations.webhook.choices.topic.property_rule_item') },
  { id: 'product_property', text: t('integrations.webhook.choices.topic.product_property') },
  { id: 'sales_channel_view_assign', text: t('integrations.webhook.choices.topic.sales_channel_view_assign') },
  { id: 'all', text: t('integrations.webhook.choices.topic.all') },
];

const versionChoices = [
  { id: '2025-08-01', text: t('integrations.webhook.choices.version.2025-08-01') },
];

const modeChoices = [
  { id: 'full', text: t('integrations.webhook.choices.mode.full') },
  { id: 'delta', text: t('integrations.webhook.choices.mode.delta') },
];

</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">{{ t('integrations.create.wizard.step4.webhook.content') }}</h1>
    <hr />
    <Flex vertical>
      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.url') }}<span class="text-red-500">*</span>
                </Label>
              </FlexCell>
              <FlexCell>
                <TextInput
                  class="w-96"
                  v-model="channelInfo.url"
                  :placeholder="t('integrations.placeholders.url')"
                />
              </FlexCell>
            </Flex>
            <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
              <p>{{ t('integrations.webhook.helpText.url') }}</p>
            </div>
          </FlexCell>
        </Flex>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.topic') }}<span class="text-red-500">*</span>
                </Label>
              </FlexCell>
              <FlexCell>
                <Selector
                  class="w-96"
                  v-model="channelInfo.topic"
                  :options="topicChoices"
                  value-by="id"
                  label-by="text"
                  :placeholder="t('integrations.placeholders.topic')"
                  :removable="false"
                />
              </FlexCell>
            </Flex>
            <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
              <p>{{ t('integrations.webhook.helpText.topic') }}</p>
            </div>
          </FlexCell>
        </Flex>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.version') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <Selector
                  class="w-96"
                  v-model="channelInfo.version"
                  :options="versionChoices"
                  value-by="id"
                  label-by="text"
                  :placeholder="t('integrations.placeholders.version')"
                  :removable="false"
                />
              </FlexCell>
            </Flex>
            <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
              <p>{{ t('integrations.webhook.helpText.version') }}</p>
            </div>
          </FlexCell>
        </Flex>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.timeoutMs') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <TextInput
                  class="w-96"
                  v-model="channelInfo.timeoutMs"
                  :number="true"
                  :max-number="10000"
                  :placeholder="t('integrations.placeholders.timeoutMs')"
                />
              </FlexCell>
            </Flex>
            <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
              <p>{{ t('integrations.webhook.helpText.timeoutMs') }}</p>
            </div>
          </FlexCell>
        </Flex>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.mode') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <Selector
                  class="w-96"
                  v-model="channelInfo.mode"
                  :options="modeChoices"
                  value-by="id"
                  label-by="text"
                  :placeholder="t('integrations.placeholders.mode')"
                  :removable="false"
                />
              </FlexCell>
            </Flex>
            <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
              <p>{{ t('integrations.webhook.helpText.mode') }}</p>
            </div>
          </FlexCell>
        </Flex>
      </FlexCell>
    </Flex>
  </div>
</template>
