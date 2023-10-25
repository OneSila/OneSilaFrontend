<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { List } from '../../atoms/list'
import { Button } from '../../atoms/button'
import { Link } from '../../atoms/link'
import { Card } from '../../atoms/card'
import { Popover } from '../../atoms/popover'
import { Icon } from '../../atoms/icon'

import { injectAuth, removeAuth } from '../../../modules/auth'

const router = useRouter()

const items: any = ref([])

const { t } = useI18n()
const auth = injectAuth()

watchEffect(() => {
  if (auth.token) {
    items.value = [
      { name: t('shared.components.molecules.navBar.userItems.logout'), onClicked: () => {
        removeAuth(auth)

        router.replace({ name: 'auth.login' })
      } },
    ]

    if (!auth.shareLink) {
      items.value = [
        { name: t('shared.components.molecules.navBar.userItems.profile'), path: { name: 'auth.profile' } },
        { name: t('shared.components.molecules.navBar.userItems.activity'), path: { name: 'activity' } },
        { name: t('shared.components.molecules.navBar.userItems.translations'), path: { name: 'translations' } },
      ].concat(items.value)
    }
  } else {
    items.value = [
      { name: t('shared.components.molecules.navBar.userItems.login'), path: { name: 'auth.login' } },
    ]
  }
})
</script>

<template>
  <Popover class="profile-popover" position="right-2 top-14">
    <template v-slot:trigger>
      <Icon class="m-3 text-gray-400" name="user" size="2x" />
    </template>

    <Card>
      <List class="w-44" :items="items">
        <template v-slot="{ item }">
          <Link :path="item.path" v-if="item.path">{{ item.name }}</Link>

          <Button v-else-if="item.onClicked" @click="item.onClicked">{{ item.name }}</Button>
        </template>
      </List>
    </Card>
  </Popover>
</template>
