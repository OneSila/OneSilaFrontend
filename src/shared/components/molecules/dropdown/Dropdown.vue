<script setup lang="ts">

import { Icon } from "../../atoms/icon";
import { Link } from "../../atoms/link";

interface DropdownItem {
  label: string;
  icon?: string;
  path: { name: string };
}

const props = defineProps<{
  items: DropdownItem[];
}>();

</script>


<template>
  <div class="dropdown shrink-0">
    <Popper :placement="'bottom-start'" offsetDistance="8" class="!block">
      <slot name="trigger"></slot>
      <template #content="{ close }">
        <ul class="text-dark dark:text-white-dark !py-0 w-[230px] font-semibold dark:text-white-light/90">
          <li v-for="(item, index) in items" :key="index">
            <Link :path="item.path" class="dark:hover:text-white" @click="close()" block>
              <Icon v-if="item.icon" :name="item.icon" class="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />
              {{ item.label }}
            </Link>
          </li>
        </ul>
      </template>
    </Popper>
  </div>
</template>
