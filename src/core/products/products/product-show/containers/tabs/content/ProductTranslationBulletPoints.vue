<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { TextInput } from '../../../../../../../shared/components/atoms/input-text';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { Label } from '../../../../../../../shared/components/atoms/label';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { VueDraggableNext } from 'vue-draggable-next';
import apolloClient from '../../../../../../../../apollo-client';
import { productTranslationBulletPointsQuery } from '../../../../../../../shared/api/queries/products.js';
import {
  createProductTranslationBulletPointsMutation,
  updateProductTranslationBulletPointMutation,
  deleteProductTranslationBulletPointsMutation,
} from '../../../../../../../shared/api/mutations/products.js';
import { processGraphQLErrors } from '../../../../../../../shared/utils';
import { Toast } from '../../../../../../../shared/modules/toast';

const { t } = useI18n();

const props = defineProps<{ translationId: string | null }>();
const emit = defineEmits<{ (e: 'update:bulletPoints', value: any[]): void }>();

const bulletPoints = ref<any[]>([]);
const initialBulletPoints = ref<any[]>([]);
const fieldErrors = ref<Record<string, string>>({});

const fetchPoints = async () => {
  if (!props.translationId) {
    bulletPoints.value = [];
    initialBulletPoints.value = [];
    emit('update:bulletPoints', bulletPoints.value);
    return;
  }
  try {
    const { data } = await apolloClient.query({
      query: productTranslationBulletPointsQuery,
      variables: { filter: { translation: { id: { exact: props.translationId } } } },
      fetchPolicy: 'network-only',
    });
    bulletPoints.value = data?.productTranslationBulletPoints.edges.map((e: any) => e.node) || [];
    initialBulletPoints.value = JSON.parse(JSON.stringify(bulletPoints.value));
    emit('update:bulletPoints', bulletPoints.value);
  } catch (e) {
    console.error('Failed to load bullet points', e);
  }
};

onMounted(fetchPoints);
watch(() => props.translationId, fetchPoints);
watch(bulletPoints, (val) => emit('update:bulletPoints', val), { deep: true });

const addBulletPoint = () => {
  if (bulletPoints.value.length >= 10) return;
  bulletPoints.value.push({ id: null, text: '', sortOrder: bulletPoints.value.length });
};

const removeBulletPoint = (index: number) => {
  bulletPoints.value.splice(index, 1);
  bulletPoints.value.forEach((bp, idx) => { bp.sortOrder = idx; });
};

const onReorder = () => {
  bulletPoints.value.forEach((bp, idx) => { bp.sortOrder = idx; });
};

const save = async (newTranslationId?: string) => {
  const tId = props.translationId || newTranslationId;
  if (!tId) return;

  const toCreate = bulletPoints.value
    .filter((bp) => !bp.id && bp.text.trim())
    .map((bp) => ({ text: bp.text, sortOrder: bp.sortOrder, translation: { id: tId } }));
  const toUpdate = bulletPoints.value
    .filter((bp) => {
      const orig = initialBulletPoints.value.find((o) => o.id === bp.id);
      return bp.id && orig && (bp.text !== orig.text || bp.sortOrder !== orig.sortOrder);
    })
    .map((bp) => ({ id: bp.id, text: bp.text, sortOrder: bp.sortOrder }));
  const toDelete = initialBulletPoints.value
    .filter((bp) => !bulletPoints.value.find((b) => b.id === bp.id))
    .map((bp) => bp.id);

  try {
    if (toCreate.length) {
      await apolloClient.mutate({
        mutation: createProductTranslationBulletPointsMutation,
        variables: { data: toCreate },
      });
    }
    for (const data of toUpdate) {
      await apolloClient.mutate({
        mutation: updateProductTranslationBulletPointMutation,
        variables: { data },
      });
    }
    if (toDelete.length) {
      await apolloClient.mutate({
        mutation: deleteProductTranslationBulletPointsMutation,
        variables: { ids: toDelete },
      });
    }
    await fetchPoints();
  } catch (errors) {
    const validationErrors = processGraphQLErrors(errors, t);
    fieldErrors.value = validationErrors;
    if (validationErrors['__all__']) {
      Toast.error(validationErrors['__all__']);
    }
    throw errors;
  }
};

defineExpose({ save });
</script>

<template>
  <div class="mt-4">
    <Label semi-bold>{{ t('products.translation.labels.bulletPoints') }}</Label>
    <VueDraggableNext v-model="bulletPoints" class="mt-2 space-y-2" @end="onReorder">
      <div v-for="(point, index) in bulletPoints" :key="point.id || index" class="flex items-start gap-2">
        <TextInput v-model="point.text" class="w-full" />
        <Button class="btn btn-outline-danger" @click="removeBulletPoint(index)">
          <Icon name="trash" />
        </Button>
      </div>
    </VueDraggableNext>
    <div v-if="bulletPoints.length < 10" class="mt-2">
      <Button class="btn btn-outline-primary" @click="addBulletPoint">
        <Icon name="plus" />
      </Button>
    </div>
  </div>
</template>
