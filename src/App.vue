<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { hasCompany, injectAuth, isActive, isAuthenticated } from './shared/modules/auth';
import { ref } from "vue";
import { useAppStore } from './shared/plugins/store';
import SideBar from './shared/components/organisms/nav-bar/SideBar.vue';
import HeaderBar from './shared/components/organisms/nav-bar/HeaderBar.vue';
const sidebar: any = ref(false);

const { locale } = useI18n();
const route = useRoute();
const auth = injectAuth();
const app = useAppStore();

if (import.meta.env.MODE === 'development') {
  document.title = `DEV ${document.title}`;
}

const toggleSidebar = () => {
  sidebar.value = !sidebar.value;
};

</script>

<template>
    <div class="app">

      <div v-if="isAuthenticated(auth) && hasCompany(auth) && isActive(auth)" class="main-section antialiased relative font-nunito text-sm font-normal vertical"
                :class="[sidebar ? 'toggle-sidebar' : '', app.rtlClass]">

        <div class="relative">
          <div class="fixed inset-0 bg-[black]/60 z-50 lg:hidden" :class="{ hidden: !sidebar }" @click="toggleSidebar()"></div>


          <div class="main-container text-black dark:text-white-dark min-h-screen">
                <SideBar :sidebar="sidebar" @hide-sidebar="toggleSidebar()" />

                <div class="main-content flex flex-col min-h-screen">
                    <HeaderBar :sidebar="sidebar" @show-sidebar="toggleSidebar()" />

                   <div class="p-6 animation">
                        <router-view :key="route.path" />
                    </div>
                </div>
            </div>
        </div>
      </div>
      <FlexCell v-else grow>
        <router-view :key="route.path" />
      </FlexCell>
    </div>

  <div id="modals" />
</template>

