<script setup lang="ts">

import { useRouter } from 'vue-router';
import { computed } from 'vue';
import { Button } from './../../atoms/button';
import { Icon } from './../../atoms/icon';
import { useI18n } from 'vue-i18n';

const props = withDefaults(
  defineProps<{
    pageInfo: {
      endCursor: string;
      startCursor: string;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    alignment?: 'start' | 'center' | 'end';
    buttonClass?: 'default' | 'solid' | 'rounded';
    useIcons?: boolean;
  }>(),
  {
    alignment: 'center',
    buttonClass: 'default',
    useIcons: false
  }
);

const { t } = useI18n();
const router = useRouter();

const buttonClasses = {
  default: `
    flex justify-center font-semibold px-3.5 py-2 rounded transition
    text-dark hover:text-primary border-2 border-[#e0e6ed]
    dark:border-[#191e3a] hover:border-primary dark:hover:border-primary dark:text-white-light
  `,
  solid: `
    flex justify-center font-semibold px-3.5 py-2 rounded transition
    bg-white-light text-dark hover:text-white hover:bg-primary
    dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary
  `,
  rounded: `
    flex justify-center font-semibold p-2 rounded-full transition
    bg-white-light text-dark hover:text-white hover:bg-primary
    dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary
  `
};

const alignmentClasses = computed(() => {
  switch (props.alignment) {
    case 'start':
      return 'justify-start';
    case 'end':
      return 'justify-end';
    default:
      return 'justify-center';
  }
});

const showPagination = computed(() => {
  return props.pageInfo.hasNextPage || props.pageInfo.hasPreviousPage;
});

const updateQueryParams = (updates) => {
  const newQuery = { ...router.currentRoute.value.query };
  const paginationKeys = ['before', 'after', 'first', 'last'];
  paginationKeys.forEach(key => {
    delete newQuery[key];
  });

  for (const key in updates) {
    if (updates[key] !== null) {
      newQuery[key] = updates[key];
    }
  }

  router.push({ query: newQuery });
};

// Pagination control methods
const clickFirst = () => updateQueryParams({first: 'true'});
const clickLast = () => updateQueryParams({ last: 'true' });
const clickNext = () => props.pageInfo.hasNextPage && updateQueryParams({ after: props.pageInfo.endCursor });
const clickPrevious = () => props.pageInfo.hasPreviousPage && updateQueryParams({ before: props.pageInfo.startCursor });

const buttons = computed(() => [
  {
    key: 'first',
    action: clickFirst,
    label: t('pagination.first'),
    icon: 'angle-double-left',
    disabled: !props.pageInfo.hasPreviousPage
  },
  {
    key: 'prev',
    action: clickPrevious,
    label: t('pagination.prev'),
    icon: 'chevron-left',
    disabled: !props.pageInfo.hasPreviousPage
  },
  {
    key: 'next',
    action: clickNext,
    label: t('pagination.next'),
    icon: 'chevron-right',
    disabled: !props.pageInfo.hasNextPage
  },
  {
    key: 'last',
    action: clickLast,
    label: t('pagination.last'),
    icon: 'angle-double-right',
    disabled: !props.pageInfo.hasNextPage
  }
]);

</script>


<template>
  <ul v-if="showPagination" :class="`flex items-center space-x-1 rtl:space-x-reverse m-auto ${alignmentClasses}`">
    <li v-for="button in buttons" :key="button.key" >
      <Button :customClass="buttonClasses[buttonClass]" @click="button.action" :disabled="button.disabled">
        <Icon v-if="useIcons && button.icon" :name="button.icon" />
        <span v-else>{{ button.label }}</span>
      </Button>
    </li>
  </ul>
</template>