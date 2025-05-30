<script setup lang="ts">
import {ref, computed, watch} from 'vue';
import {useI18n} from 'vue-i18n';
import {DiscreteLoader} from '../../../../../../../../../../../shared/components/atoms/discrete-loader';
import {Toggle} from '../../../../../../../../../../../shared/components/atoms/toggle';
import {Button} from '../../../../../../../../../../../shared/components/atoms/button';
import {Modal} from '../../../../../../../../../../../shared/components/atoms/modal';
import {
  AiRemotePropertyDetector
} from '../../../../../../../../../../../shared/components/organisms/ai-remote-property-detector';
import {Icon} from "../../../../../../../../../../../shared/components/atoms/icon";
import CreateRemoteEanCodeModal from './CreateRemoteEanCodeModal.vue';

const props = defineProps<{
  salesChannelId: string;
  attributes: any[];
  syncEanCodes?: boolean;
  initialEanCode?: string | null;
}>();

const emit = defineEmits(['update:selectedAttributes', 'update:eanCodeAttribute']);
const {t} = useI18n();

const search = ref('');
const currentPage = ref(1);
const pageSize = ref(20);
const selectedIds = ref<string[]>([]);
const eanCodeAttribute = ref<{ name: string; attributeCode: string; isNew: boolean } | null>(null);
const showCreateEanCodeModal = ref(false);

const filteredAttributes = computed(() => {
  return props.attributes.filter(attr =>
      attr.name.toLowerCase().includes(search.value.toLowerCase()) ||
      attr.attributeCode.toLowerCase().includes(search.value.toLowerCase())
  );
});


const paginatedAttributes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredAttributes.value.slice(start, start + pageSize.value);
});

const totalPages = computed(() => Math.ceil(filteredAttributes.value.length / pageSize.value));

watch(
  selectedIds,
  (val) => {
    emit('update:selectedAttributes', val);
  },
  { deep: true }
);

watch(
  eanCodeAttribute,
  (val) => {
    emit('update:eanCodeAttribute', val);
  },
  { deep: true }
);

const isAllSelected = computed(() => {
  return filteredAttributes.value.length > 0 &&
      filteredAttributes.value.every(attr => selectedIds.value.includes(attr.id));
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // Unselect all
    selectedIds.value = selectedIds.value.filter(id =>
        !filteredAttributes.value.some(attr => attr.id === id)
    );
  } else {
    // Select all visible
    const newIds = filteredAttributes.value.map(attr => attr.id);
    selectedIds.value = Array.from(new Set([...selectedIds.value, ...newIds]));
  }
};


const toggleRow = (id: string) => {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter(i => i !== id);
  } else {
    selectedIds.value.push(id);
  }
};

const onToggleClick = (attribute: any) => {
  if (eanCodeAttribute.value?.attributeCode === attribute.attributeCode) {
    eanCodeAttribute.value = null;
  } else {
    eanCodeAttribute.value = {
      name: attribute.name,
      attributeCode: attribute.attributeCode,
      isNew: false,
    };
  }
};

const openCreateEanModal = () => {
  showCreateEanCodeModal.value = true;
};

const onEanCodeCreated = (form: any) => {
  eanCodeAttribute.value = {
    name: form.name,
    attributeCode: form.attributeCode,
    isNew: true,
  };
  showCreateEanCodeModal.value = false;
};

const onEanCodeCancel = () => {
  showCreateEanCodeModal.value = false;
};

const handleDetectedProperties = (result: string) => {
  try {
    const parsed = JSON.parse(result);
    selectDetectedRows(parsed);
    emit('update:selectedAttributes', selectedIds.value);
  } catch (err) {
    console.error('Invalid JSON from AI', err);
  }
};

const selectDetectedRows = (detected: any[]) => {
  detected.forEach((attr) => {
    if (!selectedIds.value.includes(attr.id)) {
      selectedIds.value.push(attr.id);
    }
  });
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


if (props.initialEanCode) {
  const found = props.attributes.find(attr => attr.attributeCode === props.initialEanCode);
  if (found) {
    eanCodeAttribute.value = {
      name: found.name,
      attributeCode: found.attributeCode,
      isNew: false,
    };
  }
}


</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="text-2xl text-center mb-2">
      {{ t('integrations.imports.create.wizard.step2.content') }}
    </h1>
    <hr/>

    <div>
      <p class="text-gray-600 border-l-2 py-1 px-1 border-primary mb-1">
        {{ t('integrations.imports.create.wizard.step2.description.attributes') }}
      </p>

      <p v-if="props.syncEanCodes" class="text-gray-600 border-l-2 py-1 px-1 border-primary">
        {{ t('integrations.imports.create.wizard.step2.description.eanCode') }}
      </p>
    </div>



    <div v-if="props.attributes.length === 0" class="text-center py-4">
      <DiscreteLoader :loading="true"/>
    </div>

    <div v-else class="flex flex-col gap-4">
      <div v-if="props.syncEanCodes" class="text-md font-medium text-gray-700">
        {{ t('integrations.imports.create.wizard.step2.eanCodeSelected') }}:
        <span v-if="eanCodeAttribute" class="font-bold">
          {{ eanCodeAttribute.name }} ({{ eanCodeAttribute.attributeCode }})
        </span>
      </div>

      <div class="text-md font-medium text-gray-700">
        {{ t('integrations.imports.create.wizard.step2.selectedAttributes') }}
        <span class="font-bold">({{ selectedIds.length }})</span>
      </div>

      <Flex cl gap="4" between center wrap>
        <FlexCell grow>
          <input
              v-model="search"
              type="text"
              class="form-input w-64 mb-2 md:mb-0"
              :placeholder="t('shared.button.search') + '...'"
          />
        </FlexCell>
        <FlexCell>
          <AiRemotePropertyDetector :salesChannelId="salesChannelId" @detected="handleDetectedProperties"/>
        </FlexCell>
        <FlexCell>
          <Button
              v-if="props.syncEanCodes"
              :customClass="'btn btn-primary p-2 rounded'"
              :disabled="eanCodeAttribute !== null"
              @click="openCreateEanModal"
          >
            {{ t('integrations.imports.create.wizard.step2.createEanCode') }}
          </Button>
        </FlexCell>
      </Flex>

      <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
        <thead>
        <tr class="bg-gray-100 dark:bg-[#191e3a]">
          <th class="p-2 text-center">
            <input
                type="checkbox"
                class="cursor-pointer w-3 h-3 md:h-5 md:w-5"
                :checked="isAllSelected"
                @change="toggleSelectAll"
            />
          </th>
          <th class="p-2">{{ t('shared.labels.name') }}</th>
          <th class="p-2">{{ t('shared.labels.remoteCode') }}</th>
          <th v-if="props.syncEanCodes" class="p-2 text-end">{{
              t('integrations.imports.create.wizard.step2.isEanCode')
            }}
          </th>
        </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
        <tr
            v-for="attribute in paginatedAttributes"
            :key="attribute.id"
            class="border-b dark:border-[#191e3a] cursor-pointer"
            @click="toggleRow(attribute.id)"
        >
          <td class="p-2 text-center">
            <input
                class="cursor-pointer w-3 h-3 md:h-5 md:w-5"
                type="checkbox"
                :value="attribute.id"
                v-model="selectedIds"
                @click.stop
                @change="() => emit('update:selectedAttributes', selectedIds)"
            />
          </td>
          <td class="p-2">{{ attribute.name }}</td>
          <td class="p-2">{{ attribute.attributeCode }}</td>
          <td v-if="props.syncEanCodes" class="p-2" @click.stop>
            <Flex end>
              <FlexCell>
                <Toggle
                    :model-value="eanCodeAttribute?.attributeCode === attribute.attributeCode"
                    @click="() => onToggleClick(attribute)"
                />
              </FlexCell>
            </Flex>

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
          <Icon name="angle-double-left" class="w-4 h-4"/>
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
          <Icon name="chevron-left" class="w-4 h-4"/>
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
          <Icon name="chevron-right" class="w-4 h-4"/>
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
          <Icon name="angle-double-right" class="w-4 h-4"/>
        </Button>
      </div>


      <Modal v-if="syncEanCodes" v-model="showCreateEanCodeModal" @closed="onEanCodeCancel">
        <CreateRemoteEanCodeModal @submit="onEanCodeCreated" @cancel="onEanCodeCancel"/>
      </Modal>
    </div>
  </div>
</template>