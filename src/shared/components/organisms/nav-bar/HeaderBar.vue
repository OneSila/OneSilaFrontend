<script lang="ts" setup>
import {ref, onMounted, computed, reactive, watch, Ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { Icon } from "../../atoms/icon";
import { Dropdown } from "../../molecules/dropdown";
import LanguageDropdown from "../../molecules/languages-dropdown/LanguageDropdown.vue";
import UserProfileDropdown from "../user-profile-dropdown/UserProfileDropdown.vue";
import GeneralSearch from "../general-search/GeneralSearch.vue";
import { DropdownItem } from "../../molecules/dropdown/Dropdown.vue";

const { t } = useI18n();

const route = useRoute();
const emit = defineEmits(['show-sidebar']);
const showProfileDropdown = ref(false);
const createDropdownItems: Ref<DropdownItem[]> = ref([]);

const showSidebar = () => {
  emit('show-sidebar');
};

onMounted(() => {
    setActiveDropdown();
});

watch(route, (to, from) => {
    setActiveDropdown();
});

const setActiveDropdown = () => {
    const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
    if (selector) {
        selector.classList.add('active');
        const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
        for (let i = 0; i < all.length; i++) {
            all[0]?.classList.remove('active');
        }
        const ul: any = selector.closest('ul.sub-menu');
        if (ul) {
            let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
            if (ele) {
                ele = ele[0];
                setTimeout(() => {
                    ele?.classList.add('active');
                });
            }
        }
    }
};

const allowCreateDropdown = () => {
  showProfileDropdown.value = true;
  createDropdownItems.value = [
    {
      label: t('products.products.create.title'),
      icon: 'box',
      path: { name: 'products.products.create' },
    },
    {
      label: t('contacts.companies.create.title'),
      icon: 'envelope',
      path: { name: 'contacts.companies.create' },
    },
    {
      label: t('sales.orders.create.title'),
      icon: 'cart-shopping',
      path: { name: 'sales.orders.create' },
    },
    {
      label: t('purchasing.orders.create.title'),
      icon: 'receipt',
      path: { name: 'purchasing.orders.create' },
    },
    {
      label: t('inventory.inventory.create.title'),
      icon: 'warehouse',
      path: { name: 'inventory.inventory.create' },
    },
  ];
}



</script>

<template>
    <header class="z-40 light horizontal">
        <div class="shadow-sm">
            <div class="relative bg-white flex w-full items-center px-5 py-2.5 dark:bg-[#182434]">
                <div class="horizontal-logo flex lg:hidden justify-between items-center ltr:mr-2 rtl:ml-2">
                    <a
                        href="javascript:;"
                        class="collapse-icon flex-none dark:text-[#d0d2d6] hover:text-primary dark:hover:text-primary flex lg:hidden ltr:ml-2 rtl:mr-2 p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:bg-white-light/90 dark:hover:bg-dark/60"
                        @click="showSidebar()"
                    >
                        <Icon name="bars"/>
                    </a>
                </div>
                <div
                    class="sm:flex-1 ltr:sm:ml-0 ltr:ml-auto sm:rtl:mr-0 rtl:mr-auto flex items-center space-x-1.5 lg:space-x-2 rtl:space-x-reverse dark:text-[#d0d2d6]"
                >
                  <GeneralSearch />
                  <LanguageDropdown :show="false" class="ms-auto w-max" @language-set="allowCreateDropdown()"/>
                      <Dropdown v-if="showProfileDropdown" :items="createDropdownItems">
                        <template #trigger>
                          <button type="button" class="relative group block">
                            <Icon name="circle-plus" class="w-7 h-7 rounded-full object-cover saturate-50 group-hover:saturate-100 text-gray-600 hover:text-indigo-600" />
                          </button>
                        </template>
                      </Dropdown>
                  <UserProfileDropdown />
                </div>
            </div>
        </div>
    </header>
</template>
