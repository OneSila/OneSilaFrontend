<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Modal } from '../../../../shared/components/atoms/modal';
import { Card } from '../../../../shared/components/atoms/card';
import { Button } from '../../../../shared/components/atoms/button';
import { Link } from '../../atoms/link';
import { Icon } from '../../atoms/icon';

interface DuplicateItem {
  label: string;
  urlParam: any;
}

const props = withDefaults(defineProps<{
  modelValue: boolean;
  title: string;
  content?: string;
  items?: DuplicateItem[];
  loading?: boolean;
  modalTitle?: string;
  steps?: string[];
}>(), {
  content: '',
  items: () => [],
  loading: false,
  modalTitle: '',
  steps: () => [],
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'create-anyway'): void;
}>();

const router = useRouter();
const { t } = useI18n();
const localShowModal = ref(props.modelValue);
const simulatedProgress = ref(0);
let progressInterval: ReturnType<typeof setInterval> | null = null;

watch(() => props.modelValue, (val) => {
  localShowModal.value = val;
});

const startSimulatedProgress = () => {
  simulatedProgress.value = 0;
  progressInterval = setInterval(() => {
    if (simulatedProgress.value < props.steps.length) {
      simulatedProgress.value += 1;
    } else {
      clearInterval(progressInterval!);
      progressInterval = null;
    }
  }, 1000);
};

const stopSimulatedProgress = () => {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
};

watch(() => props.loading, (val) => {
  if (val) {
    startSimulatedProgress();
  } else {
    stopSimulatedProgress();
    simulatedProgress.value = 0;
  }
});

onUnmounted(() => {
  stopSimulatedProgress();
});

const close = () => {
  localShowModal.value = false;
  emit('update:modelValue', false);
};

const createAnyway = () => {
  emit('create-anyway');
  close();
};


</script>

<template>
  <Modal v-model="localShowModal" @closed="close">
    <Card class="modal-content w-1/3">
      <template v-if="props.loading">
        <h3 class="text-lg text-center font-bold mb-2">{{ t(props.modalTitle) }}</h3>
        <hr />
        <ul class="mt-2">
          <li
            v-for="(step, index) in props.steps"
            :key="index"
            class="flex items-center mb-1 py-2 px-4"
          >
            <template v-if="simulatedProgress > index">
              <Icon name="check-circle" class="text-green-600 w-5 h-5 mr-2" />
              <span class="text-green-600">{{ step }}</span>
            </template>
            <template v-else>
              <Icon name="circle" class="text-gray-400 w-5 h-5 mr-2" />
              <span class="text-gray-400">{{ step }}</span>
            </template>
          </li>
        </ul>
        <div class="flex justify-end gap-4 mt-4">
          <Button class="btn btn-primary" @click="createAnyway">{{ t('shared.button.skip') }}</Button>
        </div>
      </template>
      <template v-else>
        <h1 class="text-xl font-semibold text-center mb-4">{{ title }}</h1>
        <p v-if="content" class="mb-4">{{ content }}</p>
        <ul v-if="items.length" class="list-disc pl-5 mb-4">
          <li v-for="(item, index) in items" :key="index">
            <Link :path="item.urlParam" target="_blank">
              {{ item.label }}
            </Link>
          </li>
        </ul>
        <div class="flex justify-end gap-4 mt-4">
          <Button class="btn btn-primary" @click="createAnyway">{{ t('shared.button.createAnyway') }}</Button>
          <Button class="btn btn-outline-dark" @click="close">{{ t('shared.button.abort') }}</Button>
        </div>
      </template>
    </Card>
  </Modal>
</template>
