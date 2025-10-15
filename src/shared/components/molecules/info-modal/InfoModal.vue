<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '../../../../shared/components/atoms/button';
import { Icon } from '../../atoms/icon';
import { Modal } from '../../../../shared/components/atoms/modal';

withDefaults(
  defineProps<{
    disabled?: boolean;
    buttonClass?: string;
    label?: string;
    icon?: string | null;
  }>(),
  {
    disabled: false,
    buttonClass: '',
    label: '',
    icon: 'info-circle',
  },
);

const showModal = ref(false);

const onInfoClicked = () => {
  showModal.value = true;
};
</script>

<template>
  <div>
    <Button
      :disabled="disabled"
      :class="buttonClass"
      @click.stop.prevent="onInfoClicked"
    >
      <Icon
        v-if="icon"
        :name="icon"
        :class="label ? 'text-current' : 'text-gray-600'"
        size="sm"
      />
      <span v-if="label" class="text-sm font-medium">{{ label }}</span>
    </Button>

    <Modal v-model="showModal" @closed="showModal = false">
      <slot name="content"></slot>
    </Modal>
  </div>
</template>
