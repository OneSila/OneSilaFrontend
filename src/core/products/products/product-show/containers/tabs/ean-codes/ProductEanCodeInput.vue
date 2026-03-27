<script setup lang="ts">
import { computed, defineProps, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import apolloClient from "../../../../../../../../apollo-client";
import { eanCodesQuery } from "../../../../../../../shared/api/queries/eanCodes.js";
import {
  createEanCodeMutation,
  deleteEanCodeMutation,
  manualAssignEanCodeMutation,
  updateEanCodeMutation
} from "../../../../../../../shared/api/mutations/eanCodes.js";
import { processGraphQLErrors } from "../../../../../../../shared/utils";
import { Toast } from "../../../../../../../shared/modules/toast";
import { PrimaryButton } from "../../../../../../../shared/components/atoms/button-primary";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../../shared/components/atoms/icon";
import { ValueFormField } from "../../../../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../../../../shared/utils/constants";
import { Label } from "../../../../../../../shared/components/atoms/label";
import ApolloAlertMutation from "../../../../../../../shared/components/molecules/apollo-alert-mutation/ApolloAlertMutation.vue";
import { FieldValue } from "../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-value";

interface ExistingEanCodeNode {
  id: string;
  internal: boolean;
  alreadyUsed: boolean;
  product?: {
    id?: string | null;
  } | null;
}

const { t } = useI18n();

const props = defineProps<{ product: any, initialEanCode: { id: string | null, ean: string | null, internal: boolean | null } | null }>();
const emit = defineEmits(['ean-updated']);

const errors = ref<Record<string, string>>({});
const saving = ref(false);
const matchingExistingEan = ref(false);
const eanCode = ref({
  id: props.initialEanCode?.id ?? null,
  ean: props.initialEanCode?.ean ?? '',
  internal: props.initialEanCode?.internal ?? null
});
const lastSavedEanCode = ref(props.initialEanCode?.ean ?? '');

const defaultSwalOptions = {
  title: t('products.eanCodes.invalidEanCodeAlert.title'),
  text: t('products.eanCodes.invalidEanCodeAlert.text'),
  confirmButtonText: t('shared.alert.mutationAlert.confirmButtonTextSimpleYes'),
  cancelButtonText: t('shared.alert.mutationAlert.cancelButtonText'),
  icon: 'warning',
  showCancelButton: true,
  reverseButtons: true,
  padding: '2em'
};

const defaultSwalClasses = {
  popup: 'sweet-alerts',
  confirmButton: 'btn btn-secondary',
  cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3'
};

const swalWithBootstrapButtons = Swal.mixin({
  customClass: defaultSwalClasses,
  buttonsStyling: false
});

watchEffect(() => {
  if (props.initialEanCode) {
    eanCode.value.id = props.initialEanCode.id ?? null;
    eanCode.value.ean = props.initialEanCode.ean ?? '';
    eanCode.value.internal = props.initialEanCode.internal ?? null;
    lastSavedEanCode.value = props.initialEanCode.ean ?? '';
  }
});

const isBusy = computed(() => saving.value || matchingExistingEan.value);

const getEanCode = (): ValueFormField => ({
  type: FieldType.Text,
  name: 'eanCode',
  label: t('products.eanCodes.labels.externalEanCode'),
  placeholder: t('products.eanCodes.placeholders.externalEanCode'),
  disabled: isBusy.value
});

const buildExternalEanCodeInput = (value: string) => ({
  eanCode: value,
  product: { id: props.product.id },
  internal: false,
  alreadyUsed: true,
});

const createExternalEanCode = async (value: string) => {
  return apolloClient.mutate({
    mutation: createEanCodeMutation,
    variables: { data: buildExternalEanCodeInput(value) },
  });
};

const updateExternalEanCode = async (id: string, value: string) => {
  return apolloClient.mutate({
    mutation: updateEanCodeMutation,
    variables: {
      data: {
        id,
        eanCode: value,
        internal: false,
        alreadyUsed: true,
      },
    },
  });
};

const deleteAssignedEanCode = async (id: string) => {
  return apolloClient.mutate({
    mutation: deleteEanCodeMutation,
    variables: { id },
  });
};

const handleCreate = async (value: string) => {
  const { data } = await createExternalEanCode(value);

  if (data) {
    eanCode.value.id = data.createEanCode.id;
    eanCode.value.ean = value;
    lastSavedEanCode.value = value;
    Toast.success(t('products.eanCodes.createdSuccessfully'));
    await emit('ean-updated');
  }
};

const handleEdit = async (value: string) => {
  if (!eanCode.value.id) {
    return;
  }

  const { data } = await updateExternalEanCode(eanCode.value.id, value);

  if (data) {
    eanCode.value.ean = value;
    lastSavedEanCode.value = value;
    Toast.success(t('products.eanCodes.updatedSuccessfully'));
    await emit('ean-updated');
  }
};

const deleteSuccess = async () => {
  Toast.success(t('products.eanCodes.deletedSuccessfully'));
  errors.value = {};
  matchingExistingEan.value = false;
  eanCode.value.ean = '';
  eanCode.value.internal = null;
  eanCode.value.id = null;
  lastSavedEanCode.value = '';
  await emit('ean-updated');
};

const handleDelete = async () => {
  if (!eanCode.value.id) {
    return;
  }

  const { data } = await deleteAssignedEanCode(eanCode.value.id);

  if (data) {
    await deleteSuccess();
  }
};

const isValidEan13 = (ean: string): boolean => {
  if (!/^\d{13}$/.test(ean)) {
    return false;
  }

  const digits = ean.split('').map(Number);
  const checkDigit = digits.pop();

  const sum = digits.reduce((acc, digit, idx) => {
    return acc + digit * (idx % 2 === 0 ? 1 : 3);
  }, 0);

  const calculatedCheck = (10 - (sum % 10)) % 10;
  return calculatedCheck === checkDigit;
};

const displayGraphqlErrors = (error: unknown) => {
  const validationErrors = processGraphQLErrors(error, t);
  errors.value = validationErrors;
  const messages = Object.values(validationErrors).filter(Boolean);

  if (messages.length) {
    messages.forEach((message) => {
      Toast.error(String(message));
    });
    return;
  }

  Toast.error(t('shared.alert.toast.unexpectedResult'));
};

const getGraphQLErrorMessages = (error: unknown): string[] => {
  if (!error || typeof error !== 'object' || !('graphQLErrors' in error)) {
    return [];
  }

  const graphQLErrors = (error as { graphQLErrors?: Array<{ message?: string }> }).graphQLErrors;
  if (!Array.isArray(graphQLErrors)) {
    return [];
  }

  return graphQLErrors
    .map((graphQLError) => graphQLError?.message)
    .filter((message): message is string => Boolean(message));
};

const isDuplicateEanError = (error: unknown): boolean => {
  const normalizedMessages = Object.values(processGraphQLErrors(error, t)).map((message) => String(message));
  const messages = [...getGraphQLErrorMessages(error), ...normalizedMessages];

  return messages.some((message) => /ean code/i.test(message) && /already exists/i.test(message));
};

const setExistingEanBlockedError = () => {
  errors.value = {
    __all__: t('products.eanCodes.messages.matchExistingBlocked')
  };
};

const fetchMatchingEanCode = async (value: string): Promise<ExistingEanCodeNode | null> => {
  const { data } = await apolloClient.query({
    query: eanCodesQuery,
    variables: {
      first: 1,
      filter: {
        eanCode: { exact: value }
      }
    },
    fetchPolicy: 'network-only'
  });

  return data?.eanCodes?.edges?.[0]?.node ?? null;
};

const isReclaimableEanCode = (existingEanCode: ExistingEanCodeNode | null): existingEanCode is ExistingEanCodeNode => {
  return Boolean(
    existingEanCode &&
    existingEanCode.internal &&
    existingEanCode.alreadyUsed === false &&
    !existingEanCode.product?.id
  );
};

const rollbackPreviousExternalEan = async (previousEan: string) => {
  if (!previousEan) {
    return;
  }

  await createExternalEanCode(previousEan);
  lastSavedEanCode.value = previousEan;
};

const tryMatchExistingEanCode = async (value: string): Promise<boolean> => {
  matchingExistingEan.value = true;
  errors.value = {};

  const previousExternalEanId = eanCode.value.id;
  const previousExternalEan = lastSavedEanCode.value.trim();

  try {
    const existingEanCode = await fetchMatchingEanCode(value);

    if (!isReclaimableEanCode(existingEanCode)) {
      setExistingEanBlockedError();
      return false;
    }

    if (previousExternalEanId) {
      await deleteAssignedEanCode(previousExternalEanId);
      eanCode.value.id = null;
    }

    const { data } = await apolloClient.mutate({
      mutation: manualAssignEanCodeMutation,
      variables: {
        data: {
          product: { id: props.product.id },
          eanCode: { id: existingEanCode.id }
        }
      }
    });

    if (!data) {
      if (previousExternalEanId && previousExternalEan) {
        await rollbackPreviousExternalEan(previousExternalEan);
        await emit('ean-updated');
      }
      setExistingEanBlockedError();
      return false;
    }

    errors.value = {};
    eanCode.value.ean = value;
    lastSavedEanCode.value = value;
    Toast.success(t('products.eanCodes.assignSuccessfully'));
    await emit('ean-updated');
    return true;
  } catch (error) {
    if (previousExternalEanId && previousExternalEan && !eanCode.value.id) {
      try {
        await rollbackPreviousExternalEan(previousExternalEan);
        await emit('ean-updated');
      } catch (rollbackError) {
        console.error('Failed to restore previous external EAN code.', rollbackError);
      }
    }

    displayGraphqlErrors(error);
    return false;
  } finally {
    matchingExistingEan.value = false;
  }
};

const handleSave = async () => {
  errors.value = {};

  const trimmedEan = eanCode.value.ean.trim();

  if (!trimmedEan) {
    try {
      saving.value = true;
      await handleDelete();
    } catch (error) {
      displayGraphqlErrors(error);
    } finally {
      saving.value = false;
    }
    return;
  }

  if (!isValidEan13(trimmedEan)) {
    const result = await swalWithBootstrapButtons.fire(defaultSwalOptions as SweetAlertOptions);

    if (!result.isConfirmed) {
      eanCode.value.ean = lastSavedEanCode.value;
      return;
    }
  }

  eanCode.value.ean = trimmedEan;
  saving.value = true;

  try {
    if (eanCode.value.id) {
      await handleEdit(trimmedEan);
    } else {
      await handleCreate(trimmedEan);
    }
  } catch (error) {
    saving.value = false;

    if (isDuplicateEanError(error)) {
      const matched = await tryMatchExistingEanCode(trimmedEan);
      if (!matched && !errors.value.__all__ && !errors.value.eanCode) {
        setExistingEanBlockedError();
      }
      return;
    }

    displayGraphqlErrors(error);
  } finally {
    saving.value = false;
  }
};

const isSaveDisabled = computed(() => lastSavedEanCode.value === eanCode.value.ean.trim());
const hasUnsavedChanges = computed(() => lastSavedEanCode.value !== eanCode.value.ean.trim());

defineExpose({ hasUnsavedChanges });
</script>

<template>
  <Flex vertical class="gap-4">
    <FlexCell>
      <Flex class="mt-4 gap-4" vertical>
        <FlexCell>
          <Flex vertical class="gap-2">
            <FlexCell>
              <Label class="font-semibold block text-sm leading-6 text-gray-900">
                {{ t('products.eanCodes.labels.externalEanCode') }}
              </Label>
            </FlexCell>

            <FlexCell>
              <span class="text-gray-500 text-xs">
                {{ t('products.eanCodes.help.externalEanCode') }}
              </span>
            </FlexCell>

            <FlexCell v-if="matchingExistingEan">
              <div class="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <div class="flex items-center gap-2">
                  <Icon name="circle-notch" spin class="h-4 w-4" />
                  <span>{{ t('products.eanCodes.messages.matchingExisting') }}</span>
                </div>
              </div>
            </FlexCell>

            <FlexCell>
              <div v-if="errors.__all__ || errors.eanCode" class="text-danger text-small blink-animation ml-1 mb-1">
                <Icon size="sm" name="exclamation-circle" />
                <span class="ml-1">{{ errors.__all__ || errors.eanCode }}</span>
              </div>
            </FlexCell>

            <FlexCell>
              <FieldValue class="w-96" v-model="eanCode.ean" :field="getEanCode()" />
            </FlexCell>
          </Flex>
        </FlexCell>
      </Flex>
    </FlexCell>

    <FlexCell class="flex gap-2">
      <PrimaryButton :disabled="isSaveDisabled || isBusy" :loading="isBusy" @click="handleSave">
        {{ t('shared.button.save') }}
      </PrimaryButton>

      <ApolloAlertMutation :mutation="deleteEanCodeMutation" :mutation-variables="{ id: eanCode.id }" @done="deleteSuccess">
        <template v-slot="{ loading, confirmAndMutate }">
          <Button :disabled="!eanCode.id || isBusy || loading" :loading="loading" :customClass="'ltr:ml-auto rtl:mr-auto btn btn-outline-danger p-2'" @click="confirmAndMutate">
            <Icon name="trash" class="h-5 w-5" />
          </Button>
        </template>
      </ApolloAlertMutation>
    </FlexCell>
  </Flex>
</template>
