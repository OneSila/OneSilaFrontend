<script lang="ts" setup>

import { ref } from "vue";
import { Icon } from '../../../../shared/components/atoms/icon';
import {useI18n} from "vue-i18n";
import { isWiderThan, injectScreen } from "../../../../shared/modules/screen";

const screen = injectScreen();
const props = defineProps<{ activeTab: string; }>();

const { t } = useI18n();

const dropdownVisible = ref(false);

const isHomeTab = () => props.activeTab === 'home';

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;
};

const openModal = () => {
  // logic to open modal
  console.log(`Opening modal: ${props.activeTab}`);
  dropdownVisible.value = false;
};

</script>

<template>
  <div class="relative">
    <template v-if="isHomeTab()">
      <Popper :placement="'bottom-start'" offsetDistance="8" class="!block">
        <button v-if="isWiderThan(screen, 1024)"
          type="button"
          class="btn inline-flex justify-center items-center bg-primary text-white w-full"
          @click="toggleDropdown"
        >
          <i class="mgc_add_line text-lg me-2"></i> {{ t('shared.button.uploadNew') }}
        </button>
        <button v-else type="button" class="btn bg-primary text-white" @click="toggleDropdown" >
          <Icon name="circle-plus" />
        </button>
        <template #content="{ close }">
          <ul class="text-dark dark:text-white-dark !py-0 w-[230px] font-semibold dark:text-white-light/90 bg-white">
            <li>
              <button @click="openModal(); close()" class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
                <Icon name="image" class="w-4.5 h-4.5 mr-2 shrink-0" />
                {{ t('media.images.upload') }}
              </button>
            </li>
            <li>
              <button @click="openModal(); close()" class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
                <Icon name="video" class="w-4.5 h-4.5 mr-2 shrink-0" />
                {{ t('media.videos.upload') }}
              </button>
            </li>
            <li>
              <button @click="openModal(); close()" class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
                <Icon name="file-text" class="w-4.5 h-4.5 mr-2 shrink-0" />
                {{ t('media.documents.upload') }}
              </button>
            </li>
          </ul>
        </template>
      </Popper>
    </template>
    <template v-else>
      <button v-if="isWiderThan(screen, 1024)"
        type="button"
        class="btn inline-flex justify-center items-center bg-primary text-white w-full"
        @click="openModal()"
      >
        <i class="mgc_add_line text-lg me-2"></i> {{ t('shared.button.uploadNew') }}
      </button>
      <button v-else type="button" class="btn bg-primary text-white" @click="openModal()" >
        <Icon name="circle-plus" />
      </button>
    </template>
  </div>
</template>
