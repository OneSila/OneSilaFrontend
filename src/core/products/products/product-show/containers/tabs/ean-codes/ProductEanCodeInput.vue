<script setup lang="ts">

import { computed, defineProps, watchEffect, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from "../../../../../../../../apollo-client";
import { eanCodesQuery } from "../../../../../../../shared/api/queries/eanCodes.js";
import { createEanCodeMutation, updateEanCodeMutation, deleteEanCodeMutation } from "../../../../../../../shared/api/mutations/eanCodes.js";
import { processGraphQLErrors } from "../../../../../../../shared/utils";
import { Toast } from "../../../../../../../shared/modules/toast";
import { PrimaryButton } from "../../../../../../../shared/components/atoms/button-primary";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../../shared/components/atoms/icon";
import { ValueFormField } from "../../../../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../../../../shared/utils/constants";
import { Label } from "../../../../../../../shared/components/atoms/label";
import ApolloAlertMutation from "../../../../../../../shared/components/molecules/apollo-alert-mutation/ApolloAlertMutation.vue";
import {
  FieldValue
} from "../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-value";

const { t } = useI18n();

const props = defineProps<{ product: any, initialEanCode: { id: string | null, ean: string | null, internal: boolean | null } | null }>();
const emit = defineEmits(['ean-updated']);

const errors = ref<Record<string, string>>({});
const eanCode = ref({
  id: props.initialEanCode?.id || null,
  ean: props.initialEanCode?.ean || '',
  internal: props.initialEanCode?.internal || null
});

const lastSavedEanCode = ref(props.initialEanCode?.ean || '');

watchEffect(() => {
  if (props.initialEanCode) {
    eanCode.value.id = props.initialEanCode.id || null;
    eanCode.value.ean = props.initialEanCode.ean || '';
    eanCode.value.internal = props.initialEanCode.internal || null;
    lastSavedEanCode.value = props.initialEanCode.ean || '';
  }
});


const getEanCode = (): ValueFormField => ({
  type: FieldType.Text,
  name: 'eanCode',
  label: t('products.eanCodes.labels.externalEanCode'),
  placeholder: t('products.eanCodes.placeholders.externalEanCode'),
});

const handleCreate = async () => {
  const inputData = {
    eanCode: eanCode.value.ean,
    product: { id: props.product.id },
    internal: false,
    alreadyUsed: true,
  };

  const { data } = await apolloClient.mutate({
    mutation: createEanCodeMutation,
    variables: { data: inputData },
  });

  if (data) {
    eanCode.value.id = data.createEanCode.id;
    Toast.success(t('products.eanCodes.createdSuccessfully'));
    await emit('ean-updated');
  }
};

const handleEdit = async () => {
  const inputData = {
    id: eanCode.value.id,
    eanCode: eanCode.value.ean,
    internal: false,
    alreadyUsed: true,
  };

  const { data } = await apolloClient.mutate({
    mutation: updateEanCodeMutation,
    variables: { data: inputData },
  });

  if (data) {
    Toast.success(t('products.eanCodes.updatedSuccessfully'));
    await emit('ean-updated');
  }
};

const deleteSuccess = async () => {
    Toast.success(t('products.eanCodes.deletedSuccessfully'));
    eanCode.value.ean = '';
    lastSavedEanCode.value = '';
    eanCode.value.id = null;
    await emit('ean-updated');
};

const handleDelete = async () => {
  if (!eanCode.value.id) return;

    const { data } = await apolloClient.mutate({
      mutation: deleteEanCodeMutation,
      variables: {  id: eanCode.value.id  },
    });

    if (data) {
      await deleteSuccess();
    }
};

const handleSave = async () => {
  errors.value = {};
  lastSavedEanCode.value = eanCode.value.ean;

  try {
    if (!eanCode.value.ean.trim()) {
      await handleDelete(); // If empty, delete the EAN code
    } else if (eanCode.value.id) {
      await handleEdit();
    } else {
      await handleCreate();
    }
  } catch (err) {
    errors.value = processGraphQLErrors(err, t);
  }
};

const isSaveDisabled = computed(() => lastSavedEanCode.value === eanCode.value.ean);

</script>

<template>
      <Flex vertical class="gap-4">
        <FlexCell>
          <Flex class="mt-4 gap-4" vertical>
            <FlexCell>
              <Flex vertical class="gap-2">
                <!-- Label for EAN Code -->
                <FlexCell>
                  <Label class="font-semibold block text-sm leading-6 text-gray-900">
                    {{ t('products.eanCodes.labels.externalEanCode') }}
                  </Label>
                </FlexCell>

                <!-- Help Text -->
                <FlexCell>
                  <span class="text-gray-500 text-xs">
                    {{ t('products.eanCodes.help.externalEanCode') }}
                  </span>
                </FlexCell>

                <!-- Error Message -->
                <FlexCell>
                  <div v-if="errors.eanCode" class="text-danger text-small blink-animation ml-1 mb-1">
                    <Icon size="sm" name="exclamation-circle" />
                    <span class="ml-1">{{ errors.eanCode }}</span>
                  </div>
                </FlexCell>

                <!-- EAN Code Input -->
                <FlexCell>
                  <FieldValue class="w-96" v-model="eanCode.ean" :field="getEanCode()" />
                </FlexCell>
              </Flex>
            </FlexCell>
          </Flex>
        </FlexCell>

        <!-- Save & Delete Buttons -->
        <FlexCell class="flex gap-2">
          <PrimaryButton :disabled="isSaveDisabled" @click="handleSave">
            {{ t('shared.button.save') }}
          </PrimaryButton>

          <!-- Delete Button -->
          <ApolloAlertMutation :mutation="deleteEanCodeMutation" :mutation-variables="{ id: eanCode.id }" @done="deleteSuccess">
            <template v-slot="{ loading, confirmAndMutate }">
              <Button :disabled="!eanCode.id" :customClass="'ltr:ml-auto rtl:mr-auto btn btn-outline-danger p-2'" @click="confirmAndMutate">
                <Icon name="trash" class="h-5 w-5" />
              </Button>
            </template>
          </ApolloAlertMutation>
        </FlexCell>
      </Flex>
</template>
