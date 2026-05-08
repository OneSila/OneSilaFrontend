<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { withIntegrationRouteContext } from '../../../utils/integrationRoutes';

const props = defineProps<{
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
}>();

const route = useRoute();

const resolvedPath = computed(() => {
  if (!props.path || typeof props.path === 'string') {
    return props.path;
  }

  const path = props.path as { name?: unknown; params?: Record<string, any> };
  return {
    ...path,
    params: withIntegrationRouteContext(route, path.name, path.params),
  } as any;
});

const externalHref = computed(() => {
  if (props.external && typeof props.path === 'string') {
    if (!props.path.startsWith('http://') && !props.path.startsWith('https://')) {
      return `https://${props.path}`;
    }
  }

  return props.path;
});

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
      :href="String(externalHref)"
    >
      <slot />
    </a>

    <router-link
      v-if="!external && path && !disabled"
      v-slot="{ href, navigate }"
      :to="resolvedPath"
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
