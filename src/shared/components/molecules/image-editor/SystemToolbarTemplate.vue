<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { isWiderThan, Screen } from '../../../modules/screen'

import { Label } from '../../atoms/label'

defineProps<{
  fileName?: string;
  uploaded?: boolean;
  unsavedChanges?: boolean;
  screen?: Screen;
}>()

const { t } = useI18n()
</script>

<template>
  <Flex class="system-toolbar-template" gap="2" v-if="isWiderThan(screen, 1035)" between>
    <FlexCell center>
      {{ fileName || 'Unnamed File' }}
    </FlexCell>

    <FlexCell center>
      <Label class="text-blue-600" v-if="unsavedChanges">{{ t('shared.components.molecules.imageEditor.unsavedChanges') }}</Label>
      <Label class="text-gray-600" v-else>{{ t('shared.components.molecules.imageEditor.noChanges') }}</Label>
    </FlexCell>

    <FlexCell>
      <Flex class="h-full" gap="2">
        <FlexCell v-if="!uploaded" grow center>
          <slot name="apply" />
        </FlexCell>

        <FlexCell v-if="!uploaded" grow center>
          <slot name="reset" />
        </FlexCell>

        <FlexCell grow center>
          <slot name="duplicate" />
        </FlexCell>
      </Flex>
    </FlexCell>
  </Flex>

  <Flex gap="2" v-else vertical>
    <FlexCell center>
      <Label class="text-blue-600" v-if="unsavedChanges">{{ t('shared.components.molecules.imageEditor.unsavedChanges') }}</Label>
      <Label class="text-gray-600" v-else>{{ t('shared.components.molecules.imageEditor.noChanges') }}</Label>
    </FlexCell>

    <FlexCell>
      <Flex gap="2" :vertical="!isWiderThan(screen, 648)" between>
        <FlexCell center>
          {{ fileName || 'Unnamed File' }}
        </FlexCell>

        <FlexCell>
          <Flex class="h-full" gap="2" v-if="isWiderThan(screen, 534)">
            <FlexCell v-if="!uploaded" grow center>
              <slot name="apply" />
            </FlexCell>

            <FlexCell v-if="!uploaded" grow center>
              <slot name="reset" />
            </FlexCell>

            <FlexCell grow center>
              <slot name="duplicate" />
            </FlexCell>
          </Flex>

          <Flex class="h-full" gap="2" v-else vertical>
            <FlexCell grow>
              <Flex gap="2">
                <FlexCell v-if="!uploaded" grow>
                  <slot name="reset" />
                </FlexCell>

                <FlexCell grow>
                  <slot name="duplicate" />
                </FlexCell>
              </Flex>
            </FlexCell>

            <FlexCell v-if="!uploaded">
              <slot name="apply" />
            </FlexCell>
          </Flex>
        </FlexCell>
      </Flex>
    </FlexCell>
  </Flex>
</template>
