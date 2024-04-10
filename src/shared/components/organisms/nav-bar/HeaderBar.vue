<script lang="ts" setup>
import { ref, onMounted, computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import {Icon} from "../../atoms/icon";
import LanguageDropdown from "../../molecules/languages-dropdown/LanguageDropdown.vue";
import UserProfileDropdown from "../user-profile-dropdown/UserProfileDropdown.vue";
import GeneralSearch from "../general-search/GeneralSearch.vue";

const route = useRoute();
const emit = defineEmits(['show-sidebar']);

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
                  <LanguageDropdown class="ms-auto w-max"/>
                  <UserProfileDropdown />
                </div>
            </div>
        </div>
    </header>
</template>