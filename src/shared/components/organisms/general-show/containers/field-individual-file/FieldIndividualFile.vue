<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '../../../../atoms/icon';
import { Link } from '../../../../atoms/link';
import { useI18n } from 'vue-i18n';
import {IndividualFileField} from "../../showConfig";

const props = defineProps<{
  field: IndividualFileField;
  modelValue: any;
}>();

const { t } = useI18n();

const fileName = computed(() => {
  if (!props.modelValue || !props.modelValue.name) {
    return '-';
  }
  return props.modelValue.name.split(/(\\|\/)/g).pop();
});

</script>

<template>
  <div :class="field.customCssClass" :style="field.customCss">
    <Flex class="file-info flex items-center">
      <Icon v-if="props.modelValue?.url" name="file-text" size="xl" class="text-gray-600" />
      <span class="mx-2 text-gray-600">{{ fileName }}</span>
      <Link v-if="props.modelValue?.url" :path="props.modelValue.url" external target="_blank" class="ml-2">
        <Icon name="download" class="text-gray-600" />
      </Link>
    </Flex>
  </div>
</template>
