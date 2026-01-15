<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Toggle } from "../../../../../../../../../../../shared/components/atoms/toggle";

const props = defineProps<{
  modelValue: {
    updateOnly: boolean;
    overrideOnly: boolean;
    skipBrokenRecords: boolean;
  };
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: {
    updateOnly: boolean;
    overrideOnly: boolean;
    skipBrokenRecords: boolean;
  }): void;
}>();

const { t } = useI18n();

const updateSetting = (key: "updateOnly" | "overrideOnly" | "skipBrokenRecords", value: boolean) => {
  emit("update:modelValue", {
    ...props.modelValue,
    [key]: value,
  });
};

const updateOnlyValue = computed({
  get: () => props.modelValue.updateOnly,
  set: (value) => updateSetting("updateOnly", value),
});

const overrideOnlyValue = computed({
  get: () => props.modelValue.overrideOnly,
  set: (value) => updateSetting("overrideOnly", value),
});

const skipBrokenRecordsValue = computed({
  get: () => props.modelValue.skipBrokenRecords,
  set: (value) => updateSetting("skipBrokenRecords", value),
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <h1 class="text-2xl text-center">{{ t("integrations.imports.create.wizard.generalSettings.title") }}</h1>
      <p class="text-sm text-gray-500 text-center">
        {{ t("integrations.imports.create.wizard.generalSettings.description") }}
      </p>
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
        <div class="flex items-start justify-between gap-4">
          <div class="flex flex-col gap-1">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ t("integrations.imports.create.wizard.generalSettings.options.updateOnly.title") }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ t("integrations.imports.create.wizard.generalSettings.options.updateOnly.description") }}
            </p>
          </div>
          <Toggle v-model="updateOnlyValue" />
        </div>
      </div>

      <div class="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
        <div class="flex items-start justify-between gap-4">
          <div class="flex flex-col gap-1">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ t("integrations.imports.create.wizard.generalSettings.options.overrideOnly.title") }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ t("integrations.imports.create.wizard.generalSettings.options.overrideOnly.description") }}
            </p>
          </div>
          <Toggle v-model="overrideOnlyValue" />
        </div>
      </div>

      <div class="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
        <div class="flex items-start justify-between gap-4">
          <div class="flex flex-col gap-1">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ t("integrations.imports.create.wizard.generalSettings.options.skipBrokenRecords.title") }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ t("integrations.imports.create.wizard.generalSettings.options.skipBrokenRecords.description") }}
            </p>
          </div>
          <Toggle v-model="skipBrokenRecordsValue" />
        </div>
      </div>
    </div>
  </div>
</template>
