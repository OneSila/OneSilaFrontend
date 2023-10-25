<script setup lang="ts">
import { TertiaryButton } from '../tertiary-button';

const props = withDefaults(
  defineProps<{
    page?: number;
    pages?: number;
    hasNext?: boolean;
    breakRows?: boolean;
  }>(),
  { page: 1, pages: 1, hasNext: true },
);

const visiblePages = () => {
  const pages: number[] = [];

  for (let page = 1; page <= props.pages; page++) {
    const pagesLeft = props.pages - props.page;

    if (props.page > 4 && props.page - page > 3) {
      continue;
    }

    if (pagesLeft > 3 && page < props.page + 4) {
      pages.push(page);
    }

    if (pagesLeft <= 3) {
      pages.push(page);
    }
  }

  return pages;
};

const showPreviousButton = () => {
  return props.page > 1;
};

const showPreviousEllipses = () => {
  return props.page > 5;
};

const showFirstPageButton = () => {
  return props.page > 4;
};

const showNextButton = () => {
  return props.page < props.pages || props.hasNext;
};

const showNextEllipses = () => {
  return props.pages - props.page > 4;
};

const showLastPageButton = () => {
  return props.pages - props.page > 3;
};

const isActivePage = (page: number) => {
  return page === props.page;
};
</script>

<template>
  <div class="pagination">
    <Flex v-if="breakRows" class="broken-pagination" gap="2" vertical>
      <FlexCell>
        <Flex gap="2">
          <FlexCell v-if="showFirstPageButton()" grow>
            <TertiaryButton
              class="w-full px-2"
              :inverse="isActivePage(1)"
              @click="$emit('next', 1)"
              >&laquo;&laquo; First</TertiaryButton
            >
          </FlexCell>

          <FlexCell v-if="showLastPageButton()" grow>
            <TertiaryButton
              class="w-full px-2"
              :inverse="isActivePage(pages)"
              @click="$emit('next', pages)"
              >Last ({{ pages }}) &raquo;&raquo;</TertiaryButton
            >
          </FlexCell>
        </Flex>
      </FlexCell>

      <FlexCell>
        <Flex gap="2" between>
          <FlexCell
            v-for="currentPage in visiblePages()"
            :key="`page-item-${currentPage}`"
            class="page-item w-full"
          >
            <TertiaryButton
              class="px-2 w-full"
              :inverse="isActivePage(currentPage)"
              @click="$emit('next', currentPage)"
              >{{ currentPage }}</TertiaryButton
            >
          </FlexCell>
        </Flex>
      </FlexCell>

      <FlexCell>
        <Flex gap="2">
          <FlexCell v-if="showPreviousButton()" grow>
            <TertiaryButton
              class="w-full px-2"
              @click="$emit('previous', page - 1)"
              >&laquo; Prev</TertiaryButton
            >
          </FlexCell>

          <FlexCell v-if="showNextButton()" grow>
            <TertiaryButton class="w-full px-2" @click="$emit('next', page + 1)"
              >Next &raquo;</TertiaryButton
            >
          </FlexCell>
        </Flex>
      </FlexCell>
    </Flex>

    <Flex v-else class="unbreakable-pagination" gap="2" wrap>
      <FlexCell>
        <TertiaryButton
          v-if="showPreviousButton()"
          class="px-2"
          @click="$emit('previous', page - 1)"
          >&laquo; Prev</TertiaryButton
        >
      </FlexCell>

      <FlexCell v-if="showFirstPageButton()" class="page-item">
        <TertiaryButton
          class="px-2"
          :inverse="isActivePage(1)"
          @click="$emit('next', 1)"
          >1</TertiaryButton
        >
      </FlexCell>

      <FlexCell v-if="showPreviousEllipses()">..</FlexCell>

      <FlexCell
        v-for="currentPage in visiblePages()"
        :key="`page-item-${currentPage}`"
        class="page-item"
      >
        <TertiaryButton
          class="px-2"
          :inverse="isActivePage(currentPage)"
          @click="$emit('next', currentPage)"
          >{{ currentPage }}</TertiaryButton
        >
      </FlexCell>

      <FlexCell v-if="showNextEllipses()">..</FlexCell>

      <FlexCell v-if="showLastPageButton()" class="page-item">
        <TertiaryButton
          class="px-2"
          :inverse="isActivePage(pages)"
          @click="$emit('next', pages)"
          >{{ pages }}</TertiaryButton
        >
      </FlexCell>

      <FlexCell>
        <TertiaryButton
          v-if="showNextButton()"
          class="px-2"
          @click="$emit('next', page + 1)"
          >Next &raquo;</TertiaryButton
        >
      </FlexCell>
    </Flex>
  </div>
</template>
