<script setup lang="ts">
import { onBeforeUnmount, onMounted } from '@vue/runtime-core'
import { ref } from '@vue/reactivity'

import { Button } from '../../atoms/button';

const props = defineProps<{ position: string; hover?: boolean; ignoreOutside?: string; }>()

const emit = defineEmits<{
  (e: 'hidden'): void
}>()

const isPopoverOpen = ref(false)

const popover: any = ref(null)

const onOutsideAccessed = (event: MouseEvent) => {
  const elementClass = [...(event.target as any)?.classList].join(' ')

  if (
    !(popover.value === event.target || popover.value.contains(event.target)) &&
    elementClass !== props.ignoreOutside
  ) {
    isPopoverOpen.value = false

    emit('hidden')
  }
}

onMounted(() => {
  if(props.hover) {
    window.addEventListener('mouseout', onOutsideAccessed)
  }

  if(!props.hover) {
    window.addEventListener('click', onOutsideAccessed)
  }
})

onBeforeUnmount(() => {
  if(props.hover) {
    window.removeEventListener('mouseout', onOutsideAccessed)
  }

  if(!props.hover) {
    window.removeEventListener('click', onOutsideAccessed)
  }
})
</script>

<template>
  <div class="popover relative" ref="popover">
    <Button @click="hover ? () => {} : (isPopoverOpen = !isPopoverOpen)" @mouseover="hover && (isPopoverOpen = true)">
      <slot name="trigger" />
    </Button>

    <div class="popover-content z-50 absolute" v-if="isPopoverOpen" :class="position">
      <slot />
    </div>
  </div>
</template>
