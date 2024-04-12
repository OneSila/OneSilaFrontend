<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { SearchConfig, OrderCriteria } from '../../searchConfig';
import { Icon } from "../.././../../atoms/icon"
import { Button } from "../.././../../atoms/button"
import { getSelectedOrderIndex } from '../../../../../utils'

const props = defineProps<{ searchConfig: SearchConfig }>();
const router = useRouter();
const showDropdown = ref(false);

const handleOrderSelection = (orderName: string, type: string) => {
  const newQuery = { ...router.currentRoute.value.query };
  newQuery[props.searchConfig.orderKey || 'sort'] = type === 'DESC' ? `-${orderName}` : orderName;
  router.replace({ query: newQuery });
  showDropdown.value = false;
};

const selectedOrderIndex = computed(() => {
  return getSelectedOrderIndex(props.searchConfig.orders, router.currentRoute.value.query, props.searchConfig.orderKey);
});


</script>

<template>
  <div class="dropdown shrink-0">
    <Popper :placement="'bottom-start'" offsetDistance="8" class="!block">
        <Button custom-class="flex items-center ml-2 p-2 w-10 h-10 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60">
          <Icon name="sort" class="mx-auto" />
        </Button>
      <template #content="{ close }">
          <ul class="text-dark dark:text-white-dark !py-0 w-[230px] font-semibold dark:text-white-light/90">
            <template v-for="(order, index) in props.searchConfig.orders" :key="order.name">
              <li :class="{'bg-gray-100': index === selectedOrderIndex}">
              <button
                type="button"
                class="order-button w-full hover:text-primary"
                @click="handleOrderSelection(order.name, order.type), close()"
              >
                <span>{{ order.label }}</span>
                <Icon :name="order.type === 'ASC' ? 'arrow-down-wide-short' : 'arrow-up-wide-short'" />
              </button>
            </li>
          </template>
          </ul>
      </template>
    </Popper>
  </div>
</template>


<style>
.order-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

</style>
