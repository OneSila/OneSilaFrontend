<script setup lang="ts">

import { FormConfig } from '../../formConfig';
import { Icon } from "../../../../atoms/icon";
import { getLength } from "../../../../../utils";

const props = defineProps<{ config: FormConfig }>();

</script>

<template>
  <div v-if="getLength(config.helpSections) > 0" class="px-4">
    <Flex center>
      <FlexCell center>
        <Icon class="mr-2" size="xl" name="circle-info" />
      </FlexCell>
      <FlexCell>
        <h1 class="font-semibold text-2xl leading-10 text-gray-900">Need help?</h1>
      </FlexCell>
    </Flex>
    <div v-for="section in config.helpSections" class="mt-2">
        <h2 v-if="section.header" class="text-base font-semibold leading-7 text-gray-900">{{ section.header }}</h2>
        <p class="mt-1 text-sm leading-6 text-gray-600">{{ section.content }}</p>
    </div>
  </div>
</template>
