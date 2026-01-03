<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { TextInput } from '../../atoms/input-text';
import { TextHtmlEditor } from '../../atoms/input-text-html-editor';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { getContentFieldRules } from '../../../../core/products/products/product-show/containers/tabs/content/contentFieldRules';

type Status = 'pending' | 'approved' | 'rejected';

interface PreviewItem {
  key: string;
  integrationLabel: string;
  integrationType?: string | null;
  language: string;
}

interface PreviewContent {
  name: string;
  subtitle: string;
  shortDescription: string;
  description: string;
  urlKey: string;
  bulletPoints: string[];
}

const props = defineProps<{
  items: PreviewItem[];
  currentKey: string | null;
  contentByKey: Record<string, PreviewContent>;
  statusByKey: Record<string, Status>;
}>();

const emit = defineEmits<{ (e: 'update:currentKey', key: string): void }>();

const { t } = useI18n();

const currentItem = computed(() => props.items.find((item) => item.key === props.currentKey) || null);
const currentContent = computed(() => (props.currentKey ? props.contentByKey[props.currentKey] : null));

const fieldRules = computed(() =>
  getContentFieldRules(currentItem.value?.integrationType || 'default'),
);

const getLimitRange = (field: keyof PreviewContent) => {
  const limit = fieldRules.value.limits?.[field as any];
  if (typeof limit === 'number') {
    return { min: 0, max: limit };
  }
  return { min: limit?.min || 0, max: limit?.max };
};

const getFieldCount = (value: string) => value?.length || 0;

const getFieldCounterClass = (field: keyof PreviewContent, value: string) => {
  const limit = getLimitRange(field);
  const count = getFieldCount(value || '');
  if (limit.max && count > limit.max) return 'text-red-500';
  if (limit.min && count < limit.min) return 'text-red-500';
  return 'text-gray-400';
};

const bulletPointMaxCount = 5;

const addBulletPoint = () => {
  if (!currentContent.value) return;
  if (!currentContent.value.bulletPoints) {
    currentContent.value.bulletPoints = [];
  }
  if (currentContent.value.bulletPoints.length >= bulletPointMaxCount) return;
  currentContent.value.bulletPoints.push('');
};

const removeBulletPoint = (index: number) => {
  if (!currentContent.value?.bulletPoints) return;
  currentContent.value.bulletPoints.splice(index, 1);
};

const getTabClass = (status?: Status) => {
  if (status === 'approved') return 'border-green-400 bg-green-50 text-green-700';
  if (status === 'rejected') return 'border-red-400 bg-red-50 text-red-700';
  return 'border-gray-200 bg-white text-gray-600';
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap gap-2">
      <button
        v-for="item in props.items"
        :key="item.key"
        type="button"
        class="rounded-full border px-3 py-1 text-xs font-medium transition"
        :class="getTabClass(props.statusByKey[item.key])"
        @click="emit('update:currentKey', item.key)"
      >
        {{ item.integrationLabel }} - {{ item.language }}
      </button>
    </div>

    <div v-if="currentItem && currentContent" class="space-y-5">
      <div v-if="fieldRules.name" class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-sm font-semibold">{{ t('shared.labels.name') }}</label>
          <span v-if="getLimitRange('name').max" class="text-xs" :class="getFieldCounterClass('name', currentContent.name)">
            {{ getFieldCount(currentContent.name) }} / {{ getLimitRange('name').max }}
          </span>
        </div>
        <TextInput v-model="currentContent.name" class="w-full" :placeholder="t('products.translation.placeholders.name')" />
      </div>

      <div v-if="fieldRules.subtitle" class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-sm font-semibold">{{ t('products.translation.labels.subtitle') }}</label>
          <span v-if="getLimitRange('subtitle').max" class="text-xs" :class="getFieldCounterClass('subtitle', currentContent.subtitle)">
            {{ getFieldCount(currentContent.subtitle) }} / {{ getLimitRange('subtitle').max }}
          </span>
        </div>
        <TextInput v-model="currentContent.subtitle" :placeholder="t('products.translation.placeholders.subtitle')" />
      </div>

      <div v-if="fieldRules.shortDescription" class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-sm font-semibold">{{ t('shared.labels.shortDescription') }}</label>
          <span v-if="getLimitRange('shortDescription').max" class="text-xs" :class="getFieldCounterClass('shortDescription', currentContent.shortDescription)">
            {{ getFieldCount(currentContent.shortDescription) }} / {{ getLimitRange('shortDescription').max }}
          </span>
        </div>
        <TextHtmlEditor
          v-model="currentContent.shortDescription"
          :placeholder="t('products.translation.placeholders.shortDescription')"
        />
      </div>

      <div v-if="fieldRules.description" class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-sm font-semibold">{{ t('products.translation.labels.description') }}</label>
          <span v-if="getLimitRange('description').max" class="text-xs" :class="getFieldCounterClass('description', currentContent.description)">
            {{ getFieldCount(currentContent.description) }} / {{ getLimitRange('description').max }}
          </span>
        </div>
        <TextHtmlEditor
          v-model="currentContent.description"
          :placeholder="t('products.translation.placeholders.description')"
        />
      </div>

      <div v-if="fieldRules.urlKey" class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-sm font-semibold">{{ t('products.translation.labels.urlKey') }}</label>
          <span v-if="getLimitRange('urlKey').max" class="text-xs" :class="getFieldCounterClass('urlKey', currentContent.urlKey)">
            {{ getFieldCount(currentContent.urlKey) }} / {{ getLimitRange('urlKey').max }}
          </span>
        </div>
        <TextInput v-model="currentContent.urlKey" :placeholder="t('products.translation.placeholders.urlKey')" />
      </div>

      <div v-if="fieldRules.bulletPoints" class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-sm font-semibold">{{ t('products.translation.labels.bulletPoints') }}</label>
          <div class="text-xs" :class="currentContent.bulletPoints.length > bulletPointMaxCount ? 'text-red-500' : 'text-gray-400'">
            {{ currentContent.bulletPoints.length }} / {{ bulletPointMaxCount }}
          </div>
        </div>

        <div class="space-y-2">
          <div
            v-for="(point, index) in currentContent.bulletPoints"
            :key="`${currentItem.key}-bp-${index}`"
            class="flex items-center gap-2"
          >
            <TextInput
              v-model="currentContent.bulletPoints[index]"
              class="flex-1"
              :placeholder="t('shared.components.organisms.advancedContentGenerator.bulletPointPlaceholder', { index: index + 1 })"
            />
            <Button class="btn btn-outline-danger btn-sm" @click="removeBulletPoint(index)">
              <Icon name="trash" />
            </Button>
          </div>
        </div>

        <div>
          <Button
            class="btn btn-outline-primary btn-sm"
            :disabled="currentContent.bulletPoints.length >= bulletPointMaxCount"
            @click="addBulletPoint"
          >
            <Icon name="plus" class="mr-1" />
            {{ t('shared.components.organisms.advancedContentGenerator.addBulletPoint') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
