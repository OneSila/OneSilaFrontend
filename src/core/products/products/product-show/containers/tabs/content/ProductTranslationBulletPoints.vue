<script setup lang="ts">
import {ref, watch, onMounted, computed} from 'vue';
import {useI18n} from 'vue-i18n';
import {TextInput} from '../../../../../../../shared/components/atoms/input-text';
import {Button} from '../../../../../../../shared/components/atoms/button';
import {Label} from '../../../../../../../shared/components/atoms/label';
import {Icon} from '../../../../../../../shared/components/atoms/icon';
import {VueDraggableNext} from 'vue-draggable-next';
import apolloClient from '../../../../../../../../apollo-client';
import {productTranslationBulletPointsQuery} from '../../../../../../../shared/api/queries/products.js';
import {
  createProductTranslationBulletPointsMutation,
  updateProductTranslationBulletPointMutation,
  deleteProductTranslationBulletPointsMutation,
} from '../../../../../../../shared/api/mutations/products.js';
import {processGraphQLErrors} from '../../../../../../../shared/utils';
import {Toast} from '../../../../../../../shared/modules/toast';
import {AiBulletPointsGenerator} from '../../../../../../../shared/components/organisms/ai-bullet-points-generator';
import {AiContentTranslator} from '../../../../../../../shared/components/organisms/ai-content-translator';
import {BULLET_POINT_SEPARATOR} from '../../../../../../../shared/utils/constants';

const {t} = useI18n();

const props = defineProps<{ translationId: string | null; productId: string | number; languageCode: string | null; salesChannelId?: string }>();
const emit = defineEmits<{
  (e: 'update:bulletPoints', value: any[]): void;
  (e: 'initial-bullet-points', value: any[]): void;
}>();

const bulletPoints = ref<any[]>([]);
const initialBulletPoints = ref<any[]>([]);
const fieldErrors = ref<Record<string, string>>({});

const handleGeneratedBulletPoints = (list: any[]) => {
  bulletPoints.value = list.map((bp, idx) => ({
    id: null,
    text: bp.text,
    sortOrder: idx,
  }));
};

const handleTranslatedBulletPoints = (text: string) => {
  const points = text
      ? text.split(BULLET_POINT_SEPARATOR).filter((p) => p.trim())
      : [];
  bulletPoints.value = points.map((bp, idx) => ({
    id: null,
    text: bp,
    sortOrder: idx,
  }));
};

const fetchPoints = async () => {
  if (!props.translationId) {
    bulletPoints.value = [];
    initialBulletPoints.value = [];
    return [];
  }
  try {
    const {data} = await apolloClient.query({
      query: productTranslationBulletPointsQuery,
      variables: {filter: {productTranslation: {id: {exact: props.translationId}}}},
      fetchPolicy: 'network-only',
    });
    bulletPoints.value =
        data?.productTranslationBulletPoints.edges.map((e: any) => ({...e.node})) || [];
    initialBulletPoints.value = JSON.parse(JSON.stringify(bulletPoints.value));
    emit('initial-bullet-points', initialBulletPoints.value);
    return [...initialBulletPoints.value];
  } catch (e) {
    console.error('Failed to load bullet points', e);
  }

  return [];
};

onMounted(fetchPoints);
watch(() => props.translationId, fetchPoints);

const addBulletPoint = () => {
  if (bulletPoints.value.length >= 10) return;
  bulletPoints.value.push({id: null, text: '', sortOrder: bulletPoints.value.length});
};

const removeBulletPoint = (index: number) => {
  bulletPoints.value.splice(index, 1);
  bulletPoints.value.forEach((bp, idx) => {
    bp.sortOrder = idx;
  });
};

const onReorder = () => {
  bulletPoints.value.forEach((bp, idx) => {
    bp.sortOrder = idx;
  });
};

const save = async (newTranslationId?: string) => {
  const tId = props.translationId || newTranslationId;
  if (!tId) return;

  const toCreate = bulletPoints.value
      .filter((bp) => !bp.id && bp.text.trim())
      .map((bp) => ({text: bp.text, sortOrder: bp.sortOrder, productTranslation: {id: tId}}));

  const toUpdate = bulletPoints.value
      .filter((bp) => {
        const orig = initialBulletPoints.value.find((o) => o.id === bp.id);
        // Only update if it’s NOT empty after trimming
        return bp.id && orig && bp.text.trim() && (bp.text !== orig.text || bp.sortOrder !== orig.sortOrder);
      })
      .map((bp) => ({id: bp.id, text: bp.text, sortOrder: bp.sortOrder}));

  // Add: Delete bullet points that were present initially, but now are either gone OR emptied out
  const toDelete = [
    // Deleted entirely (removed from the array)
    ...initialBulletPoints.value
        .filter((bp) => !bulletPoints.value.find((b) => b.id === bp.id))
        .map((bp) => ({id: bp.id})),
    // Or cleared text (exists, but text is empty)
    ...bulletPoints.value
        .filter((bp) => bp.id && !bp.text.trim())
        .map((bp) => ({id: bp.id}))
  ];


  try {
    if (toCreate.length) {
      await apolloClient.mutate({
        mutation: createProductTranslationBulletPointsMutation,
        variables: {data: toCreate},
      });
    }
    for (const data of toUpdate) {
      await apolloClient.mutate({
        mutation: updateProductTranslationBulletPointMutation,
        variables: {data},
      });
    }
    if (toDelete.length) {
      await apolloClient.mutate({
        mutation: deleteProductTranslationBulletPointsMutation,
        variables: {data: toDelete},
      });
    }
    await fetchPoints();
    return [...bulletPoints.value];
  } catch (errors) {
    const validationErrors = processGraphQLErrors(errors, t);
    fieldErrors.value = validationErrors;
    if (validationErrors['__all__']) {
      Toast.error(validationErrors['__all__']);
    }
    return [];
  }
};
const hasChanges = computed(() => JSON.stringify(bulletPoints.value) !== JSON.stringify(initialBulletPoints.value));

defineExpose({save, fetchPoints, hasChanges});
</script>

<template>
  <div class="my-4">
    <Flex gap="4" middle between>
      <FlexCell>
        <Label semi-bold>{{ t('products.translation.labels.bulletPoints') }}</Label>
      </FlexCell>
      <FlexCell grow>
        <Flex gap="2">
          <FlexCell>
            <AiBulletPointsGenerator
                :product-id="props.productId"
                :language-code="props.languageCode"
                @generated="handleGeneratedBulletPoints"
            />
          </FlexCell>
          <FlexCell v-if="props.languageCode && props.languageCode !== 'en'">
            <AiContentTranslator
                :product="{ id: props.productId }"
                productContentType="BULLET_POINTS"
                toTranslate=""
                fromLanguageCode="en"
                :toLanguageCode="props.languageCode"
                :sales-channel-id="props.salesChannelId"
                @translated="handleTranslatedBulletPoints"
            />
          </FlexCell>

        </Flex>
      </FlexCell>
      <FlexCell>
        <div v-if="bulletPoints.length < 10">
          <Button class="btn btn-outline-primary btn-sm" @click="addBulletPoint">
            <Icon name="plus"/>
          </Button>
        </div>
      </FlexCell>
    </Flex>
    <VueDraggableNext v-model="bulletPoints" class="mt-4 space-y-2" @end="onReorder">
      <Flex between middle v-for="(point, index) in bulletPoints" :key="point.id || index" class="gap-2 w-full">
        <FlexCell>
          <Icon class="text-primary" name="fa-up-down-left-right"/>
        </FlexCell>
        <FlexCell grow>
          <TextInput v-model="point.text" class="w-full"/>
        </FlexCell>
        <FlexCell>
          <Button class="btn btn-sm btn-outline-danger" @click="removeBulletPoint(index)">
            <Icon name="trash"/>
          </Button>
        </FlexCell>
      </Flex>
    </VueDraggableNext>
  </div>
</template>
