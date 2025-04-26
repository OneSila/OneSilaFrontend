<script setup lang="ts">
import {useRoute} from 'vue-router';
import {useI18n} from 'vue-i18n';
import {
  hasCompany,
  injectAuth,
  isActive,
  isAuthenticated,
  isChangingAuthState,
  isUserPageLoading,
  removeAuth,
  resetLoadingStates
} from './shared/modules/auth';
import {computed, onMounted, onUpdated, ref, watch} from "vue";
import {useAppStore} from './shared/plugins/store';
import SideBar from './shared/components/organisms/nav-bar/SideBar.vue';
import HeaderBar from './shared/components/organisms/nav-bar/HeaderBar.vue';
import {Loader} from "./shared/components/atoms/loader";
import {DiscreteLoader} from "./shared/components/atoms/discrete-loader";

const {t} = useI18n();
const route = useRoute();
const auth = injectAuth();
const app = useAppStore();

const defaultTitle = 'OneSila';

const updateDocumentTitle = () => {
  document.title = route.meta.title
      ? `${t(route.meta.title as string)} | ${defaultTitle}`
      : defaultTitle;

  if (import.meta.env.MODE === 'development') {
    document.title = `DEV ${document.title}`;
  }
};

const sidebar = ref(
    auth.user?.preferences?.sidebarToggle ?? false
);

watch(
    () => auth.user?.preferences?.sidebarToggle,
    (newVal) => {
      if (newVal !== undefined) {
        sidebar.value = newVal;
      }
    }
);

const toggleSidebar = () => {
  const newState = !sidebar.value;
  sidebar.value = newState;
  if (auth.user && auth.user.preferences) {
    auth.user.preferences.sidebarToggle = newState;
    localStorage.setItem('auth_user', JSON.stringify(auth.user));
  }
};

watch(
    () => route.name,
    () => {
      resetLoadingStates(auth);
      updateDocumentTitle();
    }
);

const isLoggedIn = computed(() =>
    isAuthenticated(auth) &&
    hasCompany(auth) &&
    isActive(auth)
);

onMounted(() => {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === 'auth_user') {
      if (!e.newValue) {
        removeAuth(auth);
      }
    }
  });
});

</script>

<template>
  <div class="app">
    <div v-if="isLoggedIn" class="main-section antialiased relative font-nunito text-sm font-normal vertical"
         :class="[sidebar ? 'toggle-sidebar' : '', app.rtlClass]">

      <div class="relative">
        <div class="fixed inset-0 bg-[black]/60 z-50 lg:hidden" :class="{ hidden: !sidebar }"
             @click="toggleSidebar()"></div>


        <div class="main-container text-black dark:text-white-dark min-h-screen">
          <SideBar :sidebar="sidebar" @hide-sidebar="toggleSidebar()"/>

          <div class="main-content flex flex-col min-h-screen">
            <HeaderBar :sidebar="sidebar" @show-sidebar="toggleSidebar()"/>

            <div class="p-6 animation">
              <DiscreteLoader :loading="isUserPageLoading(auth)"/>
              <router-view :key="route.path"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <FlexCell v-else grow>
      <router-view :key="route.path"/>
    </FlexCell>
  </div>

  <div id="modals"/>
</template>

