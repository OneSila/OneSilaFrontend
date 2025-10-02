<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import { Toggle } from '../../../../../../shared/components/atoms/toggle';
import { Label } from '../../../../../../shared/components/atoms/label';
import { TextInput } from '../../../../../../shared/components/atoms/input-text';
import type { SalesChannelInfo } from '../../../integrations';

const props = defineProps<{
  salesChannelInfo: SalesChannelInfo
}>();

const { t } = useI18n();

</script>

<template>
  <div>

    <h1 class="text-2xl text-center mb-2">{{ t('integrations.create.wizard.step3.content') }}</h1>
    <hr />
    <Flex vertical>

      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.syncContents') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <Toggle v-model="salesChannelInfo.syncContents" />
              </FlexCell>
            </Flex>
            <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
              <p>{{ t('integrations.salesChannel.helpText.syncContents') }}</p>
            </div>
          </FlexCell>
        </Flex>
      </FlexCell>

      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.syncEanCodes') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <Toggle v-model="salesChannelInfo.syncEanCodes" />
              </FlexCell>
            </Flex>
            <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
              <p>{{ t('integrations.salesChannel.helpText.syncEanCodes') }}</p>
            </div>
          </FlexCell>
        </Flex>
      </FlexCell>

      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.syncPrices') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <Toggle v-model="salesChannelInfo.syncPrices" />
              </FlexCell>
            </Flex>
            <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
              <p>{{ t('integrations.salesChannel.helpText.syncPrices') }}</p>
            </div>
          </FlexCell>
        </Flex>
      </FlexCell>

      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.importOrders') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <Toggle v-model="salesChannelInfo.importOrders" />
              </FlexCell>
            </Flex>
            <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
              <p>{{ t('integrations.salesChannel.helpText.importOrders') }}</p>
            </div>
          </FlexCell>
        </Flex>
      </FlexCell>

      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex class="gap-2 items-center">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.startingStock') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <TextInput
                  :model-value="salesChannelInfo.startingStock ?? ''"
                  :number="true"
                  :min-number="0"
                  class="w-full md:w-24"
                  @update:modelValue="(value) => { salesChannelInfo.startingStock = Number.isNaN(value) ? null : value; }"
                />
              </FlexCell>
            </Flex>
            <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
              <p>{{ t('integrations.salesChannel.helpText.startingStock') }}</p>
            </div>
          </FlexCell>
        </Flex>
      </FlexCell>

      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.useConfigurableName') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <Toggle v-model="salesChannelInfo.useConfigurableName" />
              </FlexCell>
            </Flex>
            <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
              <p>{{ t('integrations.salesChannel.helpText.useConfigurableName') }}</p>
            </div>
          </FlexCell>
        </Flex>
      </FlexCell>

    </Flex>
  </div>
</template>
