<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Popover } from '../../atoms/popover';
import { Card } from '../../atoms/card';
import { List } from '../../atoms/list';

import NavItem from './NavItem.vue';

import { navItems } from './navItems';

const { t } = useI18n();
</script>

<template>
  <Flex class="nav-items" gap="4">
    <FlexCell v-for="navItem in navItems" :key="navItem.title">
      <Popover v-if="navItem.items" position="left-2 top-12" hover>
        <template #trigger>
          <NavItem>{{ t(navItem.title) }}</NavItem>
        </template>

        <Card compact>
          <List class="w-44" :items="navItem.items">
            <template #default="{ item }">
              <NavItem :route="item.route" compact>{{ t(item.title) }}</NavItem>
            </template>
          </List>
        </Card>
      </Popover>

      <NavItem v-else :route="navItem.route">{{ t(navItem.title) }}</NavItem>
    </FlexCell>
  </Flex>
</template>
