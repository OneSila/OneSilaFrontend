<script setup lang="ts">
import { injectNetwork } from '../../../modules/network'

// import { Link } from '../../atoms/link'
import { Icon } from '../../atoms/icon'

import ProfilePopover from './ProfilePopover.vue'

const network = injectNetwork()
</script>

<template>
  <Flex class="user-nav" gap="4">
    <!-- <FlexCell>
      <Link gutter="3" path="/" inline-block>
        <Icon name="bell" size="2x" class="text-gray-400" />
      </Link>
    </FlexCell> -->

    <FlexCell class="p-3" v-if="!network.connected">
      <Icon name="exclamation-triangle" size="2x" class="text-red-500" title="There is a network connection error" />
    </FlexCell>

    <FlexCell>
      <ProfilePopover class="mr-5" />
    </FlexCell>
  </Flex>
</template>
