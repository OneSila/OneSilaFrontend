<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { TextInput } from '../../../../../../../shared/components/atoms/input-text';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { Label } from '../../../../../../../shared/components/atoms/label';

export interface BulletPoint {
  id?: string;
  text: string;
  sortOrder: number;
}

const props = defineProps<{ modelValue: BulletPoint[]; max?: number }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: BulletPoint[]): void }>();
const { t } = useI18n();

const bulletPoints = ref(props.modelValue);

const update = () => emit('update:modelValue', bulletPoints.value);

const addBulletPoint = () => {
  if (bulletPoints.value.length >= (props.max || 10)) return;
  bulletPoints.value.push({ text: '', sortOrder: bulletPoints.value.length });
  update();
};

const removePoint = (index: number) => {
  bulletPoints.value.splice(index, 1);
  bulletPoints.value.forEach((p, i) => (p.sortOrder = i));
  update();
};

const moveUp = (index: number) => {
  if (index === 0) return;
  const item = bulletPoints.value.splice(index, 1)[0];
  bulletPoints.value.splice(index - 1, 0, item);
  bulletPoints.value.forEach((p, i) => (p.sortOrder = i));
  update();
};

const moveDown = (index: number) => {
  if (index === bulletPoints.value.length - 1) return;
  const item = bulletPoints.value.splice(index, 1)[0];
  bulletPoints.value.splice(index + 1, 0, item);
  bulletPoints.value.forEach((p, i) => (p.sortOrder = i));
  update();
};

</script>

<template>
  <div class="mt-4">
    <Label semi-bold>{{ t('products.translation.labels.bulletPoints') }}</Label>
    <div v-for="(point, index) in bulletPoints" :key="point.id || index" class="flex items-start gap-2 mt-2">
      <TextInput v-model="point.text" class="flex-1" :placeholder="t('products.translation.placeholders.bulletPoint')" />
      <Button :disabled="index === 0" @click="moveUp(index)"><Icon name="arrow-up" /></Button>
      <Button :disabled="index === bulletPoints.length - 1" @click="moveDown(index)"><Icon name="arrow-down" /></Button>
      <Button @click="removePoint(index)"><Icon name="trash" /></Button>
    </div>
    <Button v-if="bulletPoints.length < (props.max || 10)" class="btn btn-secondary mt-2" @click="addBulletPoint">
      <Icon name="plus" />
    </Button>
  </div>
</template>
