<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from "vue-i18n";
import {FormType} from "../product";
import {TextInput} from "../../../../../../shared/components/atoms/input-text";
import {PrimaryButton} from "../../../../../../shared/components/atoms/button-primary";
import {ProductType} from "../../../../../../shared/utils/constants";
import {Label} from "../../../../../../shared/components/atoms/label";

interface Props {
  form: FormType;
}

const props = defineProps<{form: FormType}>();
const emit = defineEmits(['trigger-next-step']);
const { t } = useI18n();

</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">{{ t('products.products.create.wizard.stepTwo.content') }}</h1>
    <hr>
    <Flex vertical>
      <FlexCell>
        <Flex class="mt-4 gap-4" center>
          <FlexCell center>
            <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('shared.labels.name') }}</label>
          </FlexCell>
          <FlexCell center>
            <TextInput class="w-96" v-model="form.name" :placeholder="'Pen'" />
          </FlexCell>
        </Flex>
      </FlexCell>
      <FlexCell v-if="form.type !== ProductType.Umbrella" class="py-8 px-96"><hr></FlexCell>
      <FlexCell v-if="form.type !== ProductType.Umbrella">
        <Flex center class="gap-4">
          <FlexCell center>
            <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('shared.labels.sku') }}</label>
          </FlexCell>
          <FlexCell center>
            <TextInput v-model="form.sku" :placeholder="'SKU-123'" />
          </FlexCell>
          <FlexCell center>
            <h1 class="text-lg font-bold uppercase">{{ t('shared.labels.or') }}</h1>
          </FlexCell>
          <FlexCell center>
            <PrimaryButton @click="emit('trigger-next-step')" :disabled="form.name.length == 0">
              {{ t('products.products.create.wizard.stepTwo.generate') }}
            </PrimaryButton>
          </FlexCell>
        </Flex>
      </FlexCell>

    </Flex>
  </div>
</template>