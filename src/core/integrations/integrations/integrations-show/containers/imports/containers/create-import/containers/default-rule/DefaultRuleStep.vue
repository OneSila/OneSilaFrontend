<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Toggle } from '../../../../../../../../../../shared/components/atoms/toggle';
import { Button } from '../../../../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../../../../shared/components/atoms/icon';

const props = defineProps<{
  attributeSets: any[];
  initialSelectedAttributeSet?: number | null;
}>();

const emit = defineEmits(['update:selectedAttributeSet']);
const { t } = useI18n();

const currentPage = ref(1);
const pageSize = ref(20);
const selectedAttributeSetId = ref<number | null>(null);

const filteredAttributeSets = computed(() => props.attributeSets);

const paginatedAttributeSets = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredAttributeSets.value.slice(start, start + pageSize.value);
});

const totalPages = computed(() => Math.ceil(filteredAttributeSets.value.length / pageSize.value));

watch(
  selectedAttributeSetId,
  (val) => {
    emit('update:selectedAttributeSet', val);
  },
  { deep: true }
);

const toggleAttributeSet = (attributeSet: any) => {
  if (selectedAttributeSetId.value === attributeSet.id) {
    selectedAttributeSetId.value = null;
  } else {
    selectedAttributeSetId.value = attributeSet.id;
  }
};


// Pagination
const goToFirst = () => (currentPage.value = 1);
const goToPrev = () => {
  if (currentPage.value > 1) currentPage.value--;
};
const goToNext = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const goToLast = () => (currentPage.value = totalPages.value);

if (props.initialSelectedAttributeSet) {
  selectedAttributeSetId.value = props.initialSelectedAttributeSet;
    const found = props.attributeSets.find((set) => set.id == props.initialSelectedAttributeSet);
    if (found) {
      toggleAttributeSet(found);
    }
}


</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="text-2xl text-center mb-2">
      {{ t('integrations.imports.create.wizard.step3.content') }}
    </h1>
    <hr />

    <div class="my-1 text-sm leading-6 text-gray-400">
      <p>*{{ t('integrations.imports.create.wizard.step3.helpText') }}</p>
    </div>

    <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
      <thead>
        <tr class="bg-gray-100 dark:bg-[#191e3a]">
          <th class="p-2">{{ t('shared.labels.name') }}</th>
          <th class="p-2 text-end">
            {{ t('integrations.imports.create.wizard.step3.attributeSetSelected') }}
          </th>
        </tr>
      </thead>
     <tbody class="divide-y divide-gray-200 bg-white">
        <tr
          v-for="set in paginatedAttributeSets"
          :key="set.id"
          class="border-b dark:border-[#191e3a] cursor-pointer"
          @click="toggleAttributeSet(set)"
        >
          <td class="p-2">{{ set.name }}</td>
          <td class="p-2" @click.stop>
            <div class="flex justify-end">
              <Toggle
                :model-value="selectedAttributeSetId === set.id"
                @click.stop="toggleAttributeSet(set)"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex justify-center items-center gap-2 mt-4">
      <Button
        :customClass="`
          flex justify-center font-semibold p-2 rounded-full transition
          bg-white-light text-dark hover:text-white hover:bg-primary
          dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary
        `"
        :disabled="currentPage === 1"
        @click="goToFirst"
      >
        <Icon name="angle-double-left" class="w-4 h-4" />
      </Button>

      <Button
        :customClass="`
          flex justify-center font-semibold p-2 rounded-full transition
          bg-white-light text-dark hover:text-white hover:bg-primary
          dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary
        `"
        :disabled="currentPage === 1"
        @click="goToPrev"
      >
        <Icon name="chevron-left" class="w-4 h-4" />
      </Button>

      <span class="text-sm text-gray-600 dark:text-white-light">
        {{ currentPage }} / {{ totalPages }}
      </span>

      <Button
        :customClass="`
          flex justify-center font-semibold p-2 rounded-full transition
          bg-white-light text-dark hover:text-white hover:bg-primary
          dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary
        `"
        :disabled="currentPage === totalPages"
        @click="goToNext"
      >
        <Icon name="chevron-right" class="w-4 h-4" />
      </Button>

      <Button
        :customClass="`
          flex justify-center font-semibold p-2 rounded-full transition
          bg-white-light text-dark hover:text-white hover:bg-primary
          dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary
        `"
        :disabled="currentPage === totalPages"
        @click="goToLast"
      >
        <Icon name="angle-double-right" class="w-4 h-4" />
      </Button>
    </div>
  </div>
</template>
