<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '../../atoms/icon';

const { t } = useI18n();
const router = useRouter();
const navigating = ref(false);

const goBack = async () => {
  const getBasePath = (url?: string | null) => {
    if (!url) return null;
    return url.split('?')[0];
  };

  const initialRoute = getBasePath(router.options.history.state.current as string | undefined);
  let backRoute = getBasePath(router.options.history.state.back as string | undefined);

  if (backRoute === null) {
    router.back();
  } else {
    // keep going back until the route base path changes
    while (true) {
      navigating.value = true;
      const trimmedBack = getBasePath(backRoute);

      if (trimmedBack !== initialRoute) {
        router.back();
        navigating.value = false;
        break;
      }

      router.back();
      await new Promise((resolve) => setTimeout(resolve, 50));
      backRoute = getBasePath(router.options.history.state.back as string | undefined);
      navigating.value = false;
      if (backRoute === null) break;
    }
  }
};
</script>

<template>
  <div class="relative">
    <button type="button" class="group block" @click="goBack">
      <Icon name="chevron-left" class="w-8 h-8 rounded-full object-cover saturate-50 group-hover:saturate-100 text-gray-600 hover:text-indigo-600" />
      <span class="sr-only">{{ t('shared.button.back') }}</span>
    </button>
    <div
      v-show="navigating"
      class="overlay w-full bg-black bg-opacity-30 p-2 text-white"
    ></div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
