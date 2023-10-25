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
  <component :is="flat ? 'div' : Card" class="filter-bar">
    <Flex v-if="isMobile(screen)" gap="2" vertical>
      <FlexCell v-if="!unsearchable" grow>
        <SearchInput
          class="w-full"
          :model-value="searchValue"
          :disabled="unsearchable"
          @update:modelValue="(event) => $emit('filtered', { searchValue: event })"
        />
      </FlexCell>

      <FlexCell grow>
        <Flex gap="2" :vertical="!isWiderThan(screen, 367)" between>
          <FlexCell v-if="hasMore">
            <FilterButton
              style="margin-top: 1px"
              :class="{ 'w-full': !isWiderThan(screen, 367) }"
              @click="$emit('more-clicked')"
            />
          </FlexCell>

          <FlexCell v-if="sortable">
            <Selector
              :placeholder="t('shared.components.molecules.filterBar.sortPlaceholder')"
              label-by="name"
              value-by="id"
              class="w-44"
              dropdown-placement="bottom"
              :class="{ 'w-44': isWiderThan(screen, 367), 'w-full': !isWiderThan(screen, 367) }"
              :options="sortOptions"
              :model-value="sortOption"
              @update:modelValue="(value) => $emit('sorted', value)"
            />
          </FlexCell>
        </Flex>
      </FlexCell>
    </Flex>

    <Flex v-else gap="2" center between>
      <FlexCell v-if="hasMore">
        <FilterButton style="margin-top: 1px" @click="$emit('more-clicked')" />
      </FlexCell>

      <FlexCell v-if="!unsearchable" grow>
        <SearchInput
          ref="input"
          class="w-full"
          :model-value="searchValue"
          :disabled="unsearchable"
          @update:modelValue="(event) => $emit('filtered', { searchValue: event })"
        />
      </FlexCell>

      <FlexCell v-if="sortable">
        <Selector
          :placeholder="t('shared.components.molecules.filterBar.sortPlaceholder')"
          class="min-w-44"
          label-by="name"
          value-by="id"
          dropdown-placement="bottom"
          :options="sortOptions"
          :model-value="sortOption"
          @update:modelValue="(value) => $emit('sorted', value)"
        />
      </FlexCell>
    </Flex>
  </component>
</template>
