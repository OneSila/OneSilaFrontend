<script setup lang="ts">
import { isTablet, injectScreen } from '../../../modules/screen';
import { injectAuth, isAuthenticated } from '../../../modules/auth';

import { Link } from '../../atoms/link';

import { Logo } from '../logo';

import NavItems from './NavItems.vue';
import UserNav from './UserNav.vue';
import NavPopover from './NavPopover.vue';

const screen = injectScreen();
const auth = injectAuth();
</script>

<template>
  <Flex
    v-if="isTablet(screen)"
    class="nav-bar border-b-2 border-gray-300 bg-white"
    gap="4"
  >
    <FlexCell>
      <NavPopover />
    </FlexCell>

    <FlexCell>
      <Link path="/" inline-block>
        <Logo />
      </Link>
    </FlexCell>
  </Flex>

  <Flex v-else class="nav-bar border-b-2 border-gray-300 bg-white" gap="4">
    <FlexCell>
      <Link class="ml-5" path="/" inline-block>
        <Logo />
      </Link>
    </FlexCell>

    <FlexCell class="py-1" grow>
        <template #default="{ environment }">
          <Flex class="h-full" gap="6">
            <FlexCell center>
              <NavItems v-if="isAuthenticated(auth) && !auth.shareLink" />
            </FlexCell>

            <FlexCell
              v-if="isAuthenticated(auth) && !auth.shareLink"
              center
              grow
            >
              <GlobalSearch />
            </FlexCell>

            <FlexCell v-if="environment?.environment === 'dev'" center>
              <div class="rounded-xl bg-blue-500 px-3 py-1 text-white">
                You're on DEV
              </div>
            </FlexCell>
          </Flex>
        </template>
    </FlexCell>

    <FlexCell v-if="isAuthenticated(auth)" class="border-gray-300">
      <UserNav />
    </FlexCell>
  </Flex>
</template>
