<script setup lang="ts">

import { Link } from '../../../../atoms/link';
import { Image } from '../../../../atoms/image';
import { ImageField } from '../../showConfig';
import { computed } from 'vue';

const props = defineProps<{
  field: ImageField;
  modelValue: any;
}>();

const imageUrl = computed(() => {
  return props.field.basePath ? `${props.field.basePath}/${props.modelValue}${props.field.suffix || ''}` : props.modelValue;
});

</script>

<template>
  <div>
    <Link v-if="field.clickable && field.clickUrl" :path="field.clickUrl">
      <Image
        :source="imageUrl"
        :alt="field.alt"
        :class="field.customCssClass"
        :style="field.customCss"
        :width="field.width"
        :height="field.height"
      />
    </Link>

    <Image
      v-else
      :source="imageUrl"
      :alt="field.alt"
      :class="field.customCssClass"
      :style="field.customCss"
      :width="field.width"
      :height="field.height"
    />
  </div>
</template>
