<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Ref, ref } from 'vue'
import { useRouter } from 'vue-router'

import { Button } from '../../atoms/button'
import { Card } from '../../atoms/card'
import { Popover } from '../../atoms/popover'
import { Icon } from '../../atoms/icon'

import { injectAuth, removeAuth, isAuthenticated } from '../../../modules/auth'

import NavItem from './NavItem.vue'

import { navItems } from './navItems'

const { t } = useI18n()
const router = useRouter()
const auth = injectAuth()

const selectedItem: Ref<any> = ref(null)

const getNavItems = () => {
  if (selectedItem.value) {
    return (selectedItem.value || {}).items || []
  }

  return navItems
}

const onLoggedOut = () => {
  removeAuth(auth)

  router.replace({ name: 'auth.login' })
}
</script>

<template>
  <Popover class="nav-popover" position="top-16 left-2" @hidden="selectedItem = null">
    <template v-slot:trigger>
      <Icon class="mt-3 ml-4" name="bars" size="2x" />
    </template>

    <Card class="max-h-64 overflow-y-auto" style="min-width: 12rem" compact>
      <Flex class="nav-items" gap="2" v-if="isAuthenticated(auth)" vertical>
        <FlexCell v-if="selectedItem">
          <NavItem @click.stop="selectedItem = null" compact>&lt; {{ t('shared.components.molecules.navBar.back') }}</NavItem>
        </FlexCell>

        <FlexCell v-if="selectedItem">
          <hr />
        </FlexCell>

        <FlexCell v-for="item in getNavItems()" :key="item.title">
          <NavItem v-if="item.items" @click.stop="selectedItem = item" compact>{{ t(item.title) }}</NavItem>

          <NavItem :route="item.route" compact v-else>{{ t(item.title) }}</NavItem>
        </FlexCell>

        <FlexCell v-if="!selectedItem">
          <hr />
        </FlexCell>

        <FlexCell v-if="!selectedItem">
          <NavItem :route="{ name: 'auth.profile' }" compact>{{ t('shared.components.molecules.navBar.userItems.profile') }}</NavItem>
        </FlexCell>

        <FlexCell v-if="!selectedItem">
          <NavItem :route="{ name: 'activity' }" compact>{{ t('shared.components.molecules.navBar.userItems.activity') }}</NavItem>
        </FlexCell>

        <FlexCell v-if="!selectedItem">
          <NavItem :route="{ name: 'translations' }" compact>{{ t('shared.components.molecules.navBar.userItems.translations') }}</NavItem>
        </FlexCell>

        <FlexCell v-if="!selectedItem">
          <Button class="px-2" @click="onLoggedOut()">{{ t('shared.components.molecules.navBar.userItems.logout') }}</Button>
        </FlexCell>
      </Flex>

      <NavItem :route="{ name: 'auth.login' }" v-else>{{ t('shared.components.molecules.navBar.userItems.login') }}</NavItem>
    </Card>
  </Popover>
</template>
