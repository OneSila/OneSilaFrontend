<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '../../../../shared/components/atoms/button';
import { Icon } from '../../atoms/icon';
import { Modal } from '../../../../shared/components/atoms/modal';

withDefaults(
  defineProps<{
    disabled?: boolean;
    buttonClass?: string;
  }>(),
  {
    disabled: false,
    buttonClass: '',
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
      <Icon class="text-gray-600" name="info-circle" size="sm" />
    </Button>

    <Modal v-model="showModal" @closed="showModal = false">
      <slot name="content"></slot>
    </Modal>
  </div>
</template>
