<script setup lang="ts">
import {defineProps, watch} from 'vue';
import {useI18n} from 'vue-i18n';
import {Label} from "../../../../../../../shared/components/atoms/label";
import {TextInput} from "../../../../../../../shared/components/atoms/input-text";
import {Selector} from "../../../../../../../shared/components/atoms/selector";
import type {MagentoChannelInfo} from '../../../../integrations';
import {AuthenticationMethod} from '../../../../integrations';

const props = defineProps<{
  channelInfo: MagentoChannelInfo
}>();

const {t} = useI18n();

const authMethodChoices = [
  {id: AuthenticationMethod.TOKEN, text: t('integrations.create.authMethod.token')},
  {id: AuthenticationMethod.PASSWORD, text: t('integrations.create.authMethod.password')}
];


watch(() => props.channelInfo.authenticationMethod, (newVal) => {
  if (newVal !== AuthenticationMethod.PASSWORD) {
    props.channelInfo.hostApiUsername = null;
  }
  props.channelInfo.hostApiKey = '';
});

</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">
      {{ t('integrations.create.wizard.step4.magento.content') }}
    </h1>
    <hr/>
    <Flex vertical>
      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.authenticationMethod') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <div class="w-96">
                  <Selector
                      class="w-full"
                      v-model="channelInfo.authenticationMethod"
                      :options="authMethodChoices"
                      value-by="id"
                      label-by="text"
                      :removable="false"
                  />
                </div>
              </FlexCell>
            </Flex>
          </FlexCell>
        </Flex>

        <Flex v-if="channelInfo.authenticationMethod === AuthenticationMethod.PASSWORD" class="mt-4 gap-4" center>
          <FlexCell center>
            <Flex vertical class="gap-2">
              <FlexCell>
                <Label class="font-semibold block text-sm leading-6 text-gray-900">
                  {{ t('integrations.labels.hostApiUsername') }}
                </Label>
              </FlexCell>
              <FlexCell>
                <TextInput
                    class="w-96"
                    v-model="channelInfo.hostApiUsername"
                    :placeholder="t('integrations.placeholders.hostApiUsername')"
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
                  {{
                    channelInfo.authenticationMethod === AuthenticationMethod.PASSWORD
                        ? t('auth.register.labels.password')
                        : t('integrations.labels.hostApiKey')
                  }}
                </Label>
              </FlexCell>
              <FlexCell>
                <TextInput
                    class="w-96"
                    v-model="channelInfo.hostApiKey"
                    :placeholder="channelInfo.authenticationMethod === AuthenticationMethod.PASSWORD
            ? t('auth.register.placeholders.password')
            : t('integrations.placeholders.hostApiKey')"
                    :secret="channelInfo.authenticationMethod === AuthenticationMethod.PASSWORD"
                />
              </FlexCell>
            </Flex>
            <div class="mt-1 text-sm leading-6 text-gray-400 w-96">
              <p>
                {{
                  channelInfo.authenticationMethod === AuthenticationMethod.PASSWORD
                      ? t('integrations.salesChannel.helpText.password')
                      : t('integrations.salesChannel.helpText.hostApiKey')
                }}
              </p>
            </div>
          </FlexCell>
        </Flex>
      </FlexCell>

    </Flex>
  </div>
</template>
