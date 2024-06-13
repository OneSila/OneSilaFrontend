<script setup lang="ts">

import { Link } from '../../../../atoms/link';
import { TextField } from '../../showConfig';
import {Image} from "../../../../atoms/image";
import {Icon} from "../../../../atoms/icon";

const props = defineProps<{
  field: TextField;
  modelValue?: string | number;
  imageValue?: string;
}>();

</script>

<template>
  <div :class="field.customCssClass" :style="field.customCss">
    <Flex class="gap-4">
      <FlexCell v-if="field.addImage" center>
        <div v-if="field.clickable">
          <Link :path="field.clickUrl">
            <div v-if="imageValue" class="w-8 h-8 overflow-hidden">
              <Image class="w-8 h-8 rounded-md overflow-hidden object-cover" :source="imageValue" :alt="String(modelValue)" />
            </div>
            <div v-else class="w-8 h-8 overflow-hidden rounded-md bg-gray-200 flex justify-center items-center">
            </div>
          </Link>
        </div>
        <div v-else>
          <div v-if="imageValue" class="w-8 h-8 overflow-hidden">
            <Image class="w-8 h-8 rounded-md overflow-hidden object-cover" :source="imageValue" :alt="String(modelValue)" />
          </div>
          <div v-else class="w-8 h-8 overflow-hidden rounded-md bg-gray-200 flex justify-center items-center">
          </div>
        </div>
      </FlexCell>
      <FlexCell center grow>
        <Link v-if="field.clickable" :path="field.clickUrl">{{ modelValue }}</Link>
        <span v-else>{{ modelValue }}</span>
      </FlexCell>
    </Flex>
  </div>
</template>