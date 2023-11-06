<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Card } from '../../atoms/card';
import { Selector } from '../../atoms/selector';

import { SearchInput } from '../../molecules/search-input';
import { FilterButton } from '../../molecules/filter-button';

import { injectScreen, isMobile, isWiderThan } from '../../../modules/screen';

defineProps<{
  searchValue?: string;
  sortOptions?: any[];
  sortOption?: string;
  hasMore?: boolean;
  sortable?: boolean;
  unsearchable?: boolean;
  flat?: boolean;
}>();

defineEmits<{
  (e: 'filtered', filterMap: any): void;
  (e: 'sorted', sortOption: string): void;
  (e: 'more-clicked'): void;
}>();

const { t } = useI18n();
const screen = injectScreen();
</script>

<template>
</template>
