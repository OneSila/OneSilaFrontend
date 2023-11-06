<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { isIntegrated } from './shared/utils';
import {injectAuth, refreshUser, isAuthenticated, removeAuth} from './shared/modules/auth';

import MeQuery from './shared/api/queries/MeQuery.vue';

import { NavBar } from './shared/components/molecules/nav-bar';

const { locale } = useI18n();
const route = useRoute();
const auth = injectAuth();

if (import.meta.env.MODE === 'development') {
  document.title = `DEV ${document.title}`;
}

const onMeLoaded = (me) => {
  if (me) {
    refreshUser(auth, {
      id: parseInt(me.id),
      username: me.username,
      language: me.language.toLowerCase(),
      showOnboarding: me.showOnboarding,
    });

    locale.value = auth.user.language;
  }
};

</script>

<template>
    <Flex class="app" vertical>
      <FlexCell v-if="isAuthenticated(auth)">
        <NavBar />
      </FlexCell>

      <FlexCell
          v-if="isAuthenticated(auth)"
        :class="{
          'py-6 px-8 md:px-16': !isIntegrated(),
          'py-3 px-4 md:px-8': isIntegrated(),
        }"
        grow
      >
        <router-view :key="route.path" />
      </FlexCell>
      <FlexCell v-else grow>
        <router-view :key="route.path" />
      </FlexCell>
    </Flex>

  <div id="modals" />
</template>
