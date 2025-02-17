<script setup lang="ts">
import {FormLayout} from "../../../../../../../../../../shared/components/organisms/general-form/containers/form-layout";
import {PrimaryButton} from "../../../../../../../../../../shared/components/atoms/button-primary";
import {useI18n} from "vue-i18n";
import {Package} from "../../../../configs";

const props = defineProps<{ packages: Package[] }>();

const emit = defineEmits(['save-package']);
const { t } = useI18n();


const savePackage = (pkg) => {
  emit('save-package', pkg);
};

</script>


<template>
  <div>
    <!-- Loop over packages and display the form -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
      <div v-for="(pkg, index) in packages" :key="pkg.id" class="mb-4">
        <div class="rounded-lg border border-gray-300 bg-white dark:bg-gray-800 shadow-md">
          <!-- Package Header -->
          <div class="rounded-t-lg bg-gray-800 text-white p-4">
            <h4 class="text-lg font-semibold">{{ t('inventory.packages.create.manual.assignItemsStep.packageName', { index: index + 1 }) }}</h4>
          </div>

          <!-- Package Form -->
          <div class="p-4">
            <FormLayout :config="pkg.config" :form="pkg.form" />
          </div>

          <!-- Save Button -->
          <div class="p-4 flex justify-end">
            <PrimaryButton @click="savePackage(pkg)">
              {{ t('shared.button.save') }}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>