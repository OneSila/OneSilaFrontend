<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from "vue-i18n";
import {FormType} from "../product";
import {PrimaryButton} from "../../../../../../shared/components/atoms/button-primary";

const props = defineProps<{form: FormType}>();
const emit = defineEmits(['for-sale-changed']);
const { t } = useI18n();

const handleChanged = (newVal) => {
  emit('for-sale-changed', newVal, true)
}

</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">{{ t('products.products.create.wizard.stepThree.simple.content') }}</h1>
    <hr>
    <Flex vertical>
      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell>
              <PrimaryButton @click="handleChanged(true)" >
                {{ t('shared.labels.yes') }}
              </PrimaryButton>
          </FlexCell>
          <FlexCell>
            <PrimaryButton @click="handleChanged(false)" >
              {{ t('shared.labels.no') }}
            </PrimaryButton>
          </FlexCell>
        </Flex>
      </FlexCell>
    </Flex>
  </div>
</template>