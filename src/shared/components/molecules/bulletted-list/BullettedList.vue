<script setup lang="ts">
import { ref } from "vue";

import { List } from "../../atoms/list";

const props = defineProps<{ items: string[]; perColumn?: string; columnGap?: string }>()

const perColumnNumber = ref(Number(props.perColumn))
const columns = ref(Math.ceil(props.items.length / perColumnNumber.value))
</script>

<template>
  <Flex class="numbered-list" :gap="columnGap" v-if="perColumn">
    <FlexCell v-for="column in columns" :key="column">
      <List :items="items.slice((column - 1) * perColumnNumber, ((column - 1) * perColumnNumber) + perColumnNumber)">
        <template v-slot="{ item }">
          - {{ item }}
        </template>
      </List>
    </FlexCell>
  </Flex>

  <List class="numbered-list" :items="items" v-else>
    <template v-slot="{ item }">
      - {{ item }}
    </template>
  </List>
</template>
