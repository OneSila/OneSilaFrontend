<template>
  <div class="sm:ltr:mr-auto sm:rtl:ml-auto flex w-80">
      <form
          class="sm:relative absolute inset-x-0 sm:top-0 top-1/2 sm:translate-y-0 -translate-y-1/2 sm:mx-0 z-10 w-full sm:w-1/3"
          :class="{ '!block': search }"
          @submit.prevent="search = false"
      >
          <div class="relative">
              <input
                  type="text"
                  class="form-input w-full ltr:pl-9 rtl:pr-9 ltr:sm:pr-4 rtl:sm:pl-4 peer sm:bg-transparent bg-gray-100 placeholder:tracking-widest"
                  placeholder="Search..."
              />
              <button type="button" class="absolute w-9 h-9 inset-0 ltr:right-auto rtl:left-auto appearance-none peer-focus:text-primary">
                  <Icon name="search"/>
              </button>
              <button
                  type="button"
                  class="hover:opacity-80 sm:hidden block absolute top-1/2 -translate-y-1/2 ltr:right-2 rtl:left-2"
                  @click="search = false"
              >
                  <Icon name="close"/>
              </button>
          </div>
      </form>

      <button
          type="button"
          class="search_btn sm:hidden p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:bg-white-light/90 dark:hover:bg-dark/60"
          @click="search = !search"
      >
          <Icon name="search" class="w-4.5 h-4.5 mx-auto dark:text-[#d0d2d6]"/>
      </button>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "../../atoms/icon";
import { ref } from 'vue';

const search = ref(false);
const notifications = ref([
    {
        id: 1,
        profile: 'user-profile.jpeg',
        message: '<strong class="text-sm mr-1">John Doe</strong>invite you to <strong>Prototyping</strong>',
        time: '45 min ago',
    },
    {
        id: 2,
        profile: 'profile-34.jpeg',
        message: '<strong class="text-sm mr-1">Adam Nolan</strong>mentioned you to <strong>UX Basics</strong>',
        time: '9h Ago',
    },
    {
        id: 3,
        profile: 'profile-16.jpeg',
        message: '<strong class="text-sm mr-1">Anna Morgan</strong>Upload a file',
        time: '9h Ago',
    },
]);

const removeNotification = (value: number) => {
    notifications.value = notifications.value.filter((d) => d.id !== value);
};

</script>