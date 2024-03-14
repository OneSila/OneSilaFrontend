<script setup lang="ts">

import { defineProps, computed } from 'vue';
import Icon from "../../atoms/icon/Icon.vue";
import {MeCompanyData} from "../../../../core/profile/company/meCompanyData";

const props = defineProps<{ platform: string }>();

const iconName = computed(() => {
  switch (props.platform) {
    case 'google':
      return 'google';
    case 'office365':
      return 'office365'; // You might need to add an appropriate icon for Office 365 in your FontAwesome setup
    default:
      return '';
  }
});

const iconSVG = computed(() => {
  switch (props.platform) {
    case 'google':
      return `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                  <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M13.8512 7.15912C13.8512 6.66275 13.8066 6.18548 13.7239 5.72729H7.13116V8.43503H10.8984C10.7362 9.31003 10.243 10.0514 9.50162 10.5478V12.3041H11.7639C13.0875 11.0855 13.8512 9.29094 13.8512 7.15912Z"
                                            fill="white"
                                        />
                                        <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M7.13089 14C9.0209 14 10.6054 13.3731 11.7636 12.3041L9.50135 10.5477C8.87454 10.9677 8.07272 11.2159 7.13089 11.2159C5.30771 11.2159 3.76452 9.9845 3.21407 8.32996H0.875427V10.1436C2.02725 12.4313 4.39453 14 7.13089 14Z"
                                            fill="white"
                                        />
                                        <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M3.21435 8.32997C3.07435 7.90997 2.99481 7.46133 2.99481 6.99997C2.99481 6.5386 3.07435 6.08996 3.21435 5.66996V3.85632H0.875712C0.40162 4.80133 0.131165 5.87042 0.131165 6.99997C0.131165 8.12951 0.40162 9.19861 0.875712 10.1436L3.21435 8.32997Z"
                                            fill="white"
                                        />
                                        <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M7.13089 2.7841C8.15862 2.7841 9.08135 3.13728 9.80681 3.83092L11.8145 1.82319C10.6023 0.693638 9.01772 0 7.13089 0C4.39453 0 2.02725 1.56864 0.875427 3.85637L3.21407 5.67001C3.76452 4.01546 5.30771 2.7841 7.13089 2.7841Z"
                                            fill="white"
                                        />
        </svg>
      `;
    case 'office365':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="16" height="16">
            <path d="M44.257,5.333l-12.412-3.3c-0.192-0.051-0.396-0.044-0.582,0.021l-25.588,8.8C5.271,10.993,5,11.373,5,11.8V36v1.2v1.065 v0.01c0,0.363,0.286,0.737,0.675,0.871l25.588,8.8C31.368,47.981,31.478,48,31.588,48c0.086,0,0.173-0.011,0.257-0.033l12.412-3.3 C44.695,44.55,45,44.153,45,43.7V6.3C45,5.847,44.695,5.45,44.257,5.333z M30,10.827v29.532L8.153,37.476l7.191-2.637 C15.738,34.695,16,34.32,16,33.9V13.715L30,10.827z" fill="#FFFFFF"/>
        </svg>`;
    default:
      return '';
  }
});

const isSVG = computed(() => {
  return ['google', 'office365'].includes(props.platform);
});

const iconClass = computed(() => {
  return 'inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110';
});

const iconStyle = computed(() => {
  return 'background: linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)';
});

const handleLogin = () => {
  switch (props.platform) {
    case 'office365':
      // Handle the Office 365 login logic here
      break;
    // ... handle other platforms as needed
  }
};
</script>


<template>
  <button @click="handleLogin" :class="iconClass" :style="iconStyle">
    <template v-if="isSVG">
      <div v-html="iconSVG" class="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"></div>
    </template>
    <template v-else>
      <Icon :name="iconName" />
    </template>
  </button>
</template>