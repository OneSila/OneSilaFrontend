<script setup lang="ts">

const apiGraphqlUrl = import.meta.env.VITE_APP_API_GRAPHQL_URL;
const backendBaseUrl = apiGraphqlUrl.replace(/\/graphql\/?$/, '');

const props = defineProps<{
  path: string;
  target?: string;
  inlineBlock?: boolean;
  block?: boolean;
  disabled?: boolean;
  gutter?: string;
  verticalGutter?: string;
  horizontalGutter?: string;
  selectable?: boolean;
}>();

const target = props.target || '_self';
</script>

<template>
  <span
    class="link"
    :class="{
      'inline-block': props.inlineBlock,
      block: props.block,
      [`px-${props.horizontalGutter}`]: props.horizontalGutter,
      [`py-${props.verticalGutter}`]: props.verticalGutter,
      [`p-${props.gutter}`]: props.gutter,
      'select-text': props.selectable,
    }"
  >
    <a
      v-if="!props.disabled"
      class="hover:text-gray-600"
      :href="backendBaseUrl + props.path"
      :target="target"
    >
      <slot />
    </a>

    <span
      v-else
      class="cursor-pointer hover:text-gray-600"
    >
      <slot />
    </span>
  </span>
</template>
