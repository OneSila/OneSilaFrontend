<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    path?: string | object;
    inlineBlock?: boolean;
    block?: boolean;
    disabled?: boolean;
    external?: boolean;
    gutter?: string;
    verticalGutter?: string;
    horizontalGutter?: string;
    target?: string;
    selectable?: boolean;
  }>(),
  { external: false },
);

const onClicked = (event, navigationCallback) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target === '_blank') {
    return;
  }

  if (!props.selectable) {
    return navigationCallback();
  }

  event.preventDefault();

  const selection = window.getSelection()?.toString();

  if (selection?.length) {
    return;
  }

  navigationCallback();
};
</script>

<template>
  <span
    class="link"
    :class="{
      'inline-block': inlineBlock,
      block,
      [`px-${horizontalGutter}`]: horizontalGutter,
      [`py-${verticalGutter}`]: verticalGutter,
      [`p-${gutter}`]: gutter,
      'select-text': selectable,
    }"
  >
    <a
      v-if="external && !disabled"
      class="hover:text-gray-600"
      target="_blank"
      :href="String(path)"
    >
      <slot />
    </a>

    <router-link
      v-if="!external && path && !disabled"
      v-slot="{ href, navigate }"
      :to="path"
      custom
    >
      <a
        :href="href"
        :target="target"
        class="hover:text-gray-600"
        :draggable="!selectable"
        @click.stop="(event) => onClicked(event, navigate)"
      >
        <slot />
      </a>
    </router-link>

    <span
      v-if="(!external && !path) || disabled"
      class="cursor-pointer hover:text-gray-600"
      :to="path"
      ><slot
    /></span>
  </span>
</template>
