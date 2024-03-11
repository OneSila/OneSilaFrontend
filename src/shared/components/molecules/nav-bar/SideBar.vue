<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import Logo from "../logo/Logo.vue";
import { Icon } from "../../atoms/icon";
import SideItems from "./SideItems.vue";
import SideSettingsItems from "./SideSettingsItems.vue";

const emit = defineEmits(['hide-sidebar']);

const toggleSidebar = () => {
  emit('hide-sidebar');
};

onMounted(() => {
    const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
    if (selector) {
        selector.classList.add('active');
        const ul: any = selector.closest('ul.sub-menu');
        if (ul) {
            let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
            if (ele.length) {
                ele = ele[0];
                setTimeout(() => {
                    ele.click();
                });
            }
        }
    }
});

</script>


<template>
    <div class="dark text-white-dark">
        <nav class="sidebar fixed min-h-screen h-full top-0 bottom-0 w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] z-50 transition-all duration-300">
            <div class="bg-white dark:bg-[#0e1726] h-full">
                <div class="flex justify-between items-center px-4 py-3">
                    <Logo src="/src/assets/images/auth/logo-white.svg" alt="Logo" to="/" />
                    <a
                        href="javascript:;"
                        class="collapse-icon w-8 h-8 rounded-full flex items-center hover:bg-gray-500/10 dark:hover:bg-dark-light/10 dark:text-white-light transition duration-300 rtl:rotate-180 hover:text-primary"
                        @click="toggleSidebar()"
                    >
                        <Icon name="angles-left"/>
                    </a>
                </div>
                <perfect-scrollbar
                    :options="{
                        swipeEasing: true,
                        wheelPropagation: false,
                    }"
                    class="h-[calc(100vh-80px)] relative perfect-scrollbar"
                >
                    <SideItems />
                    <SideSettingsItems />
                </perfect-scrollbar>
            </div>
        </nav>
    </div>
</template>

<style scoped>
.perfect-scrollbar {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
}

.side-settings-items {
  margin-top: auto;
}
</style>