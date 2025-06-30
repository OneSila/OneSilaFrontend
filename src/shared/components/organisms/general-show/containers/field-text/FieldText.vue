<script setup lang="ts">

import { Link } from '../../../../atoms/link';
import { TextField } from '../../showConfig';
import {Image} from "../../../../atoms/image";
import { shortenText } from "../../../../../utils";
import {Icon} from "../../../../atoms/icon";

const props = defineProps<{
  field: TextField;
  modelValue?: string | number;
  imageValue?: string;
  hideImage?: boolean;
}>();

</script>

<template>
  <div :class="field.customCssClass" :style="field.customCss">
    <Flex class="gap-4">
      <FlexCell v-if="field.addImage && !hideImage" center>
        <div v-if="field.clickable">
          <Link :path="field.clickUrl">
            <div v-if="imageValue" class="w-12 h-12 overflow-hidden">
              <Image class="w-12 h-12 rounded-md overflow-hidden object-cover" :source="imageValue" :alt="String(modelValue)" />
            </div>
            <div v-else class="w-12 h-12 overflow-hidden rounded-md bg-gray-200 flex justify-center items-center">
            </div>
          </Link>
        </div>
        <div v-else>
          <div v-if="imageValue" class="w-12 h-12 overflow-hidden">
            <Image class="w-12 h-12 rounded-md overflow-hidden object-cover" :source="imageValue" :alt="String(modelValue)" />
          </div>
            <div v-else class="w-12 h-12 overflow-hidden rounded-md bg-gray-200 flex justify-center items-center">
          </div>
        </div>
      </FlexCell>
      <FlexCell center grow>
        <Link v-if="field.clickable" :path="field.clickUrl" :title="modelValue">{{ shortenText(modelValue, 64) }}</Link>
        <span
          v-else
          :title="modelValue != null ? String(modelValue) : undefined">
          {{ shortenText(modelValue, 64) }}
        </span>
      </FlexCell>
    </Flex>
  </div>
</template>