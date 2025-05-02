<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import { TextInput } from "../../../../../../shared/components/atoms/input-text";
import { Label } from "../../../../../../shared/components/atoms/label";
import { Toggle } from "../../../../../../shared/components/atoms/toggle";
import { IntegrationGeneralInfo } from "../../../integrations";
import {Accordion} from "../../../../../../shared/components/atoms/accordion";

const props = defineProps<{
  generalInfo: IntegrationGeneralInfo,
  maxRequestsPerMinute: number | undefined
}>();

const { t } = useI18n();

const accordionItems = [
  { name: 'throttling', label: t('integrations.show.sections.throttling'), icon: 'gauge' }
];

</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">{{ t('integrations.create.wizard.step2.content') }}</h1>
    <hr />
    <Flex vertical>
      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.hostname') }}*
                </Label>
              </FlexCell>
              <FlexCell>
                <TextInput class="w-96" v-model="generalInfo.hostname" placeholder="https://example.com" />
              </FlexCell>
            </Flex>
          </FlexCell>
        </Flex>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex class="gap-2 w-96">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.verifySSL') }}*
                </Label>
              </FlexCell>
              <FlexCell>
                 <Toggle v-model="generalInfo.verifySsl" />
              </FlexCell>
            </Flex>
          </FlexCell>
        </Flex>
      </FlexCell>

      <FlexCell class="py-8 px-96"><hr /></FlexCell>

      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Accordion :items="accordionItems">
              <template #throttling>
              <FlexCell>
                <Flex class="mt-4 gap-4" center>
                  <FlexCell center>
                    <Flex vertical class="gap-2">
                      <FlexCell>
                        <Label class="font-semibold block text-sm leading-6 text-gray-900">
                          {{ t('integrations.labels.requestsPerMinute') }}
                        </Label>
                      </FlexCell>
                      <FlexCell>
                        <TextInput class="w-96" v-model="generalInfo.requestsPerMinute" :number="true" placeholder="60" :min-number="1" :max-number="maxRequestsPerMinute"  />
                        <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
                          <p>{{ t('integrations.salesChannel.helpText.requestsPerMinute') }}</p>
                          <p v-if="maxRequestsPerMinute" class="text-red-500">
                            {{ t(
                                'integrations.salesChannel.helpText.maxRequestsPerMinute',
                                { max: maxRequestsPerMinute }
                              )
                            }}
                          </p>
                        </div>
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
                          {{ t('integrations.labels.maxRetries') }}
                        </Label>
                      </FlexCell>
                      <FlexCell>
                        <TextInput class="w-96" v-model="generalInfo.maxRetries" :number="true" :min-number="1" :max-number="20" placeholder="3" />
                        <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
                          <p>{{ t('integrations.salesChannel.helpText.maxRetries') }}</p>
                        </div>
                      </FlexCell>
                    </Flex>
                  </FlexCell>
                </Flex>
              </FlexCell>
              </template>
            </Accordion>
          </FlexCell>
        </Flex>
      </FlexCell>

    </Flex>
  </div>
</template>