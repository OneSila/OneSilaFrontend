<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue';

import { injectScreen, isWiderThan } from '../../../modules/screen';

import { Icon } from '../../atoms/icon';

import { Pagination } from '../pagination';

const screen = injectScreen();

const props = withDefaults(
  defineProps<{
    perPage?: number;
    total?: number;
    itemsCount?: number;
    page?: number;
    loading?: boolean;
    showAbove?: boolean;
  }>(),
  { perPage: 20, total: 0, itemsCount: 0, page: 1, showAbove: false },
);

const emit = defineEmits<{
  (e: 'update:page', page: number): void;
}>();

const showBelowPagination = computed(() => {
  return !(props.showAbove && props.loading);
});

const hasNext = ref(false);
const pages = ref(0);

const onNextPage = (newPage: number) => {
  emit('update:page', newPage);
};

const onPreviousPage = (newPage: number) => {
  emit('update:page', newPage);
};

watchEffect(() => {
  pages.value = Math.ceil(props.total / props.perPage);
  hasNext.value = props.page < pages.value;
});
</script>

<template>
  <Flex gap="4" vertical>
    <FlexCell v-if="(hasNext || page > 1) && showAbove">
      <Flex between>
        <FlexCell></FlexCell>

        <FlexCell :class="{ 'w-full': !isWiderThan(screen, 664) }">
          <Pagination
            :page="page"
            :pages="pages"
            :has-next="hasNext"
            :break-rows="!isWiderThan(screen, 664)"
            @next="onNextPage"
            @previous="onPreviousPage"
          />
        </FlexCell>
      </Flex>
    </FlexCell>

    <FlexCell v-if="loading" class="text-center text-gray-500">
      <Icon name="circle-notch" size="4x" spin />
    </FlexCell>

    <FlexCell v-else>
      <slot />
    </FlexCell>

    <FlexCell
      v-if="(hasNext || page > 1) && !(props.showAbove && props.loading)"
    >
      <Flex between>
        <FlexCell></FlexCell>

        <FlexCell>
          <Pagination
            :page="page"
            :pages="pages"
            :has-next="hasNext"
            :break-rows="!isWiderThan(screen, 664)"
            @next="onNextPage"
            @previous="onPreviousPage"
          />
        </FlexCell>
      </Flex>
    </FlexCell>
  </Flex>
</template>
