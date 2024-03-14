<script setup lang="ts">
import { Label } from '../../../../atoms/label';
import { Icon } from '../../../../atoms/icon';
import { Link } from '../../../../atoms/link';
import { Image } from '../../../../atoms/image';
import { ImageField } from '../../showConfig';
import { computed } from 'vue';

const props = defineProps<{
  field: ImageField;
  modelValue: string;
}>();

const imageUrl = computed(() => {
  return props.field.basePath ? `${props.field.basePath}/${props.modelValue}${props.field.suffix || ''}` : props.modelValue;
});

</script>

<template>
  <div>
    <Icon v-if="field.icon" :name="field.icon" />
    <Label v-if="field.label && field.showLabel" semi-bold class="mb-2">{{ field.label }}</Label>

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
