<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Label } from "../../../../../../../shared/components/atoms/label";
import { TextInput } from "../../../../../../../shared/components/atoms/input-text";
import type { MiraklChannelInfo } from '../../../../integrations';

defineProps<{
  channelInfo: MiraklChannelInfo;
  marketplaceName?: string;
}>();

const { t } = useI18n();
</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">
      {{ t('integrations.create.wizard.step4.marketplace.content', { marketplace: marketplaceName || t('integrations.integrationTypes.mirakl') }) }}
    </h1>
    <hr />
    <Flex vertical>
      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.shopId') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <TextInput
                  :model-value="channelInfo.shopId ?? ''"
                  :number="true"
                  :min-number="1"
                  class="w-96"
                  :placeholder="t('integrations.placeholders.shopId')"
                  @update:modelValue="(value) => { channelInfo.shopId = Number.isNaN(value) ? null : value; }"
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
    </Flex>
  </div>
</template>
