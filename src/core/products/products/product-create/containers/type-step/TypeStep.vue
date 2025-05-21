<script setup lang="ts">

import {computed, defineProps} from 'vue';
import { useI18n } from "vue-i18n";
import { Image } from "../../../../../../shared/components/atoms/image";
import { OptionSelector } from "../../../../../../shared/components/molecules/option-selector";
import variableType from "../../../../../../assets/images/product-types/simple.png";
import configurableType from "../../../../../../assets/images/product-types/configurable.png";
import bundleType from "../../../../../../assets/images/product-types/bundle.png";
import aliasType from "../../../../../../assets/images/product-types/alias.png";
import {ProductType} from "../../../../../../shared/utils/constants";
import {FormType} from "../product";

const props = defineProps<{form: FormType}>();
const emit = defineEmits(['for-sale-changed', 'empty-variations']);

const typeChoice = [
  { name: ProductType.Simple },
  { name: ProductType.Configurable },
  { name: ProductType.Bundle },
  { name: ProductType.Alias }
];


// when we select the type we always make for sale true in case we go back
emit('empty-variations');

const { t } = useI18n();

</script>

<template>
  <div>
    <h1 class="text-2xl text-center mb-2">{{ t('products.products.create.wizard.stepOne.content') }}</h1>
    <hr>
    <OptionSelector v-model="form.type" :choices="typeChoice" >

      <template #SIMPLE>
        <div>
          <h3 class="text-lg font-bold">{{ t('products.products.create.wizard.stepOne.variable.title') }}</h3>
          <p>{{ t('products.products.create.wizard.stepOne.variable.example') }}</p>
          <Image :source="variableType" alt="Variable" class="w-full max-h-[35rem]" />
        </div>
      </template>

      <template #CONFIGURABLE>
        <div>
          <h3 class="text-lg font-bold">{{ t('products.products.create.wizard.stepOne.configurable.title') }}</h3>
          <p>{{ t('products.products.create.wizard.stepOne.configurable.example') }}</p>
          <Image :source="configurableType" alt="Configurable" class="w-full max-h-[35rem]" />
        </div>
      </template>


      <template #BUNDLE>
        <div>
          <h3 class="text-lg font-bold">{{ t('products.products.create.wizard.stepOne.bundle.title') }}</h3>
          <p>{{ t('products.products.create.wizard.stepOne.bundle.example') }}</p>
          <Image :source="bundleType" alt="Bundle" class="w-full max-h-[35rem]" />
        </div>
      </template>

      <template #ALIAS>
        <div>
          <h3 class="text-lg font-bold">{{ t('products.products.create.wizard.stepOne.alias.title') }}</h3>
          <p>{{ t('products.products.create.wizard.stepOne.alias.example') }}</p>
          <Image :source="aliasType" alt="Alias" class="w-full max-h-[35rem]" />
        </div>
      </template>

    </OptionSelector>
  </div>
</template>