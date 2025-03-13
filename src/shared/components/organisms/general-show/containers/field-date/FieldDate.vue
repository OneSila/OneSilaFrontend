<script setup lang="ts">

import {accessNestedProperty, DateField, TextField} from '../../showConfig';
import {computed} from "vue";
import {FieldType} from "../../../../../utils/constants";
import {FieldText} from "../field-text";

const props = defineProps<{
  field: DateField;
  modelValue: string;
}>();

const dateValue = computed(() => formatDate(props.modelValue));

const formatDate = (dateString) => {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
};

const modifiedField = computed(() => ({
  ...props.field,
  type: FieldType.Text,
}));

</script>

<template>
  <div :class="field.customCssClass" :style="field.customCss">
    <FieldText v-if="dateValue !== null" :field="modifiedField as TextField" :model-value="dateValue" />
  </div>
</template>
