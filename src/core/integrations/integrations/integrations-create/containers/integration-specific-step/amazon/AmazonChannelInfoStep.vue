<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import { Label } from "../../../../../../../shared/components/atoms/label";
import { Selector } from "../../../../../../../shared/components/atoms/selector";
import { AmazonChannelInfo, AmazonRegions } from '../../../../integrations';

const props = defineProps<{
  channelInfo: AmazonChannelInfo
}>();

const { t } = useI18n();

const regionChoices = [
  { id: AmazonRegions.NORTH_AMERICA, text: t('integrations.regions.northAmerica') },
  { id: AmazonRegions.EUROPE, text: t('integrations.regions.europe') },
  { id: AmazonRegions.FAR_EAST, text: t('integrations.regions.farEast') },
];
</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">
      {{ t('integrations.create.wizard.step4.amazon.content') }}
    </h1>
    <hr />
    <Flex vertical>
      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.region') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <div class="w-96">
                  <Selector
                    class="w-full"
                    v-model="channelInfo.region"
                    :options="regionChoices"
                    value-by="id"
                    label-by="text"
                    :removable="false"
                  />
                </div>
              </FlexCell>
            </Flex>
          </FlexCell>
        </Flex>
      </FlexCell>
    </Flex>
  </div>
</template>
