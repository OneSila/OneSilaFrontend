<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import AdvancedContentGeneratorModal from './AdvancedContentGeneratorModal.vue';

interface Props {
  productIds: Array<string | number>;
  btnClass?: string;
  small?: boolean;
  iconClass?: string;
  label?: string;
  initialSalesChannelIds?: string[];
  useDefaultButtonStyles?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  btnClass: 'btn-outline-primary',
  small: true,
  iconClass: 'text-purple-600',
  label: 'shared.components.organisms.advancedContentGenerator.button',
  initialSalesChannelIds: () => [],
  useDefaultButtonStyles: true,
});

const emit = defineEmits<{ (e: 'started'): void }>();

const { t } = useI18n();

const showModal = ref(false);

const normalizedProductIds = computed(() =>
  (props.productIds || []).map((id) => String(id)).filter(Boolean),
);

const buttonClass = computed(() => {
  if (props.useDefaultButtonStyles) {
    return `btn ${props.small ? 'btn-sm' : ''} ${props.btnClass}`;
  }
  return props.btnClass;
});

const openModal = () => {
  if (!normalizedProductIds.value.length) return;
  showModal.value = true;
};
</script>

<template>
  <div class="inline-flex items-center">
    <Button
      :class="buttonClass"
      :disabled="!normalizedProductIds.length"
      @click="openModal"
    >
      <Icon name="gem" size="lg" :class="`${props.iconClass} mr-2`" />
      {{ t(props.label) }}
    </Button>

    <AdvancedContentGeneratorModal
      v-model="showModal"
      :product-ids="normalizedProductIds"
      :initial-sales-channel-ids="props.initialSalesChannelIds"
      @started="emit('started')"
    />
  </div>
</template>
