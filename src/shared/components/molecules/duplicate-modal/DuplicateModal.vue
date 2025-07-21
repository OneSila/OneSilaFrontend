<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Modal } from '../../../../shared/components/atoms/modal';
import { Card } from '../../../../shared/components/atoms/card';
import { Button } from '../../../../shared/components/atoms/button';
import {Link} from "../../atoms/link";

interface DuplicateItem {
  label: string;
  urlParam: any;
}

const props = withDefaults(defineProps<{
  modelValue: boolean;
  title: string;
  content?: string;
  items?: DuplicateItem[];
}>(), {
  content: '',
  items: () => [],
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'create-anyway'): void;
}>();

const router = useRouter();
const { t } = useI18n();
const localShowModal = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  localShowModal.value = val;
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
    </Card>
  </Modal>
</template>
