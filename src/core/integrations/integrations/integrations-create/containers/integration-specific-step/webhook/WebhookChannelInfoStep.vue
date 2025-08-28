<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import { TextInput } from '../../../../../../../shared/components/atoms/input-text';
import { Label } from '../../../../../../../shared/components/atoms/label';
import WebhookInfoBlock from './WebhookInfoBlock.vue';
import type { WebhookChannelInfo } from '../../../integrations';

const props = defineProps<{ channelInfo: WebhookChannelInfo }>();
const { t } = useI18n();
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
                <TextInput
                  class="w-96"
                  v-model="channelInfo.topic"
                  :placeholder="t('integrations.placeholders.topic')"
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
                <TextInput
                  class="w-96"
                  v-model="channelInfo.version"
                  :placeholder="t('integrations.placeholders.version')"
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
                  {{ t('integrations.labels.userAgent') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <TextInput
                  class="w-96"
                  v-model="channelInfo.userAgent"
                  :placeholder="t('integrations.placeholders.userAgent')"
                />
              </FlexCell>
            </Flex>
            <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
              <p>{{ t('integrations.webhook.helpText.userAgent') }}</p>
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
                <TextInput
                  class="w-96"
                  v-model="channelInfo.mode"
                  :placeholder="t('integrations.placeholders.mode')"
                />
              </FlexCell>
            </Flex>
            <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
              <p>{{ t('integrations.webhook.helpText.mode') }}</p>
            </div>
          </FlexCell>
        </Flex>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.retentionPolicy') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <TextInput
                  class="w-96"
                  v-model="channelInfo.retentionPolicy"
                  :placeholder="t('integrations.placeholders.retentionPolicy')"
                />
              </FlexCell>
            </Flex>
            <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
              <p>{{ t('integrations.webhook.helpText.retentionPolicy') }}</p>
            </div>
          </FlexCell>
        </Flex>
      </FlexCell>
    </Flex>
    <WebhookInfoBlock class="mt-8" />
  </div>
</template>
