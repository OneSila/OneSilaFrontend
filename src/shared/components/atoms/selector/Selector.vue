<script setup lang="ts">
import VueSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import { createPopper, Placement } from '@popperjs/core';
import { onMounted, Ref, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { Button } from '../../../../shared/components/atoms/button';

const props = withDefaults(
  defineProps<{
    options?: any[];
    modelValue?: any;
    labelBy?: string;
    valueBy?: string;
    placeholder?: string;
    dropdownPosition?: string;
    openOnEmpty?: boolean;
    boolean?: boolean;
    strict?: boolean;
    multiple?: boolean;
    unfilterable?: boolean;
    addable?: boolean;
    removable?: boolean;
    more?: boolean;
    transparent?: boolean;
    limit?: number;
  }>(),
  { options: [] as any, dropdownPosition: 'top', removable: true },
);

</script>

<template>
</template>
