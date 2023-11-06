<template>
  <div class="dropdown">
    <Popper :placement="store.rtlClass === 'rtl' ? 'bottom-start' : 'bottom-end'" offsetDistance="8">
      <button
        type="button"
        class="flex items-center gap-2.5 rounded-lg border border-white-dark/30 bg-white px-2 py-1.5 text-white-dark hover:border-primary hover:text-primary dark:bg-black"
      >
        <div>
          <img :src="currentFlag" alt="image" class="h-5 w-5 rounded-full object-cover" />
        </div>
        <div class="text-base font-bold uppercase">{{ locale.toUpperCase() }}</div>
        <span class="shrink-0">
          <Icon name="angle-down" />
        </span>
      </button>
      <template #content="{ close }">
        <ul class="!px-2 text-dark dark:text-white-dark grid grid-cols-2 gap-2 font-semibold dark:text-white-light/90 w-[280px]">
          <template v-for="item in store.languageList" :key="item.code">
            <li>
              <button
                type="button"
                class="w-full hover:text-primary"
                :class="{ 'bg-primary/10 text-primary': locale === item.code }"
                @click="changeLanguage(item), close()"
              >
                <img
                  class="w-5 h-5 object-cover rounded-full"
                  :src="`/src/assets/images/flags/${item.code.toUpperCase()}.svg`"
                  alt=""
                />
                <span class="ltr:ml-3 rtl:mr-3">{{ item.name }}</span>
              </button>
            </li>
          </template>
        </ul>
      </template>
    </Popper>
  </div>
</template>

<script setup lang="ts">
import { defineProps, reactive, computed } from 'vue';
import Icon from "../../atoms/icon/Icon.vue";
import Popper from 'vue3-popper';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const store = {
  rtlClass: 'ltr',
  locale: 'EN',
  languageList: [
    { code: 'en', name: 'English' },
    { code: 'nl', name: 'Dutch' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
  ]
};



const changeLanguage = (item: any) => {
  locale.value = item.code;
};

const currentFlag = computed(() => {
  return `/src/assets/images/flags/${locale.value.toUpperCase()}.svg`;
});

</script>
