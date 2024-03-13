<script setup lang="ts">
import { Link } from '../../atoms/link';
import VueCollapsible from 'vue-height-collapsible/vue3';
import Icon from "../../atoms/icon/Icon.vue";

const props = defineProps<{ item:  object; activeDropdown?: string|null }>();
const emit = defineEmits(['update:activeDropdown']);

const handleDropdownClick = () => {
  const newValue = props.activeDropdown === props.item.subItemsKey ? null : props.item.subItemsKey;
  emit('update:activeDropdown', newValue);
};
</script>

<template>
  <li v-if="item.subItemsKey && item.subItems" class="menu nav-item">
  <button
      type="button"
      class="nav-link group w-full flex justify-between items-center"
      :class="{ active: activeDropdown === item.subItemsKey }"
      @click="handleDropdownClick"
  >
      <div>
          <Icon v-if="item.icon" :name="item.icon"/>
          <span class="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
              {{ $t(item.title) }}
          </span>
      </div>
      <div :class="{ 'rtl:rotate-90 -rotate-90': activeDropdown !== item.subItemsKey }">
          <Icon name="chevron-down"/>
      </div>
  </button>
    <vue-collapsible :isOpen="activeDropdown === item.subItemsKey">
        <ul class="sub-menu text-gray-500">
            <li v-for="subItem in item.subItems">
                <Link
                  horizontal-gutter="2"
                  :path="subItem.route"
                  inline-block
                  >{{ $t(subItem.title) }}</Link>
            </li>
        </ul>
    </vue-collapsible>
  </li>
  <li v-else class="nav-item">
    <Link :path="item.route" class="group" >
      <div class="flex items-center">
          <Icon v-if="item.icon" :name="item.icon"/>
          <span class="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
            {{ $t(item.title)}}
          </span>
      </div>
    </Link>
  </li>
</template>