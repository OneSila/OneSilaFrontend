<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { Button } from "../../../../../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../../../../../shared/components/atoms/icon";
import {createFormConfigConstructor} from "../../../../configs";
import {FormLayout} from "../../../../../../../../../../shared/components/organisms/general-form/containers/form-layout";
import {PackageStatus} from "../../../../../../../../../../shared/utils/constants";

const props = defineProps<{
  shipmentId: string;
  packages: Array<any>;
}>();

const emit = defineEmits(['update-packages', 'remove-package', 'add-package']);

const { t } = useI18n();

const addPackage = () => {
  const packageId = `package-${props.packages.length + 1}`;
  const formConfig = createFormConfigConstructor(t, props.shipmentId);

  const packageForm = {
    id: packageId,
    form: {
      shipment: {id: props.shipmentId },
      type: 'BOX',
      status: PackageStatus.PACKED,
      trackingCode: '',
      trackingLink: '',
      shippingLabel: null,
      customsDocument: null,
    },
    items: [],
    isOpen: true,
    config: formConfig,
  };

  emit('add-package', packageForm);
};

const removePackage = (index) => {
  emit('remove-package', index);
};

const togglePackage = (pkg) => {
  pkg.isOpen = !pkg.isOpen;
};
</script>

<template>
  <div>
    <p class="text-center text-gray-600 mb-6">{{ t('inventory.packages.create.manual.createStep.description') }}</p>
    <hr>

    <Flex class="mt-6" vertical>

      <FlexCell>
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <div v-for="(pkg, index) in packages" :key="pkg.id" class="mb-4">
            <div class="rounded-lg border border-gray-300 bg-white dark:bg-gray-800 shadow-md">
              <!-- Header with collapsible icon -->
              <div class="rounded-t-lg bg-gray-800 text-white p-4 flex justify-between items-center cursor-pointer" @click="togglePackage(pkg)">
                <h4 class="text-lg font-semibold">{{ `Package ${index + 1}` }}</h4>
                <Icon :name="pkg.isOpen ? 'chevron-up' : 'chevron-down'" size="lg" class="text-white" />
              </div>

              <!-- Collapsible Package Form -->
              <div v-if="pkg.isOpen" class="p-4">
                <FormLayout :config="pkg.config" :form="pkg.form" />
              </div>

              <!-- Remove Button -->
              <div class="p-4 flex justify-end">
                <Button class="text-red-600" @click="removePackage(index)">
                  {{ t('inventory.packages.create.manual.button.remove') }}
                </Button>
              </div>
            </div>
          </div>
        </div>

        </FlexCell>

      <!-- Add Package Button -->
      <Flex class="mt-6">
        <FlexCell>
          <Button class="btn btn-primary" @click="addPackage">
            {{ t('inventory.packages.create.manual.button.add') }}
          </Button>
        </FlexCell>
      </Flex>

    </Flex>
  </div>
</template>
