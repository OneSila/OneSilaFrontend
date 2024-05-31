<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from "vue-i18n";
import {FormType} from "../product";
import {Label} from "../../../../../../shared/components/atoms/label";
import {Checkbox} from "../../../../../../shared/components/atoms/checkbox";

const props = defineProps<{form: FormType}>();
const emit = defineEmits(['for-sale-changed']);
const { t } = useI18n();

const handleChanged = (newVal) => {
  emit('for-sale-changed', newVal)
}

</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">{{ t('products.products.create.wizard.stepThree.simple.content') }}</h1>
    <hr>
    <Flex vertical>
      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('products.products.create.wizard.stepThree.simple.forSale') }}</label>
          </FlexCell>
          <FlexCell center>
            <Checkbox :model-value="form.forSale"  @update:model-value="handleChanged" />
          </FlexCell>
        </Flex>
      </FlexCell>
    </Flex>
  </div>
</template>