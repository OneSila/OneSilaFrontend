<script setup lang="ts">
import { Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Card } from "../../../../../../../../../shared/components/atoms/card";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { Modal } from "../../../../../../../../../shared/components/atoms/modal";
import { Loader } from "../../../../../../../../../shared/components/atoms/loader";
import apolloClient from "../../../../../../../../../../apollo-client";
import { refreshLatestAmazonIssuesMutation } from "../../../../../../../../../shared/api/mutations/salesChannels.js";

export interface FormattedIssue {
  message?: string | null;
  severity?: string | null;
  validationIssue?: boolean | null;
}

const props = defineProps<{ modelValue: boolean; issues?: FormattedIssue[] | null; id?: string | null }>();
const emit = defineEmits(['modal-closed']);
const localShowModal = ref(props.modelValue);
const issues: Ref<FormattedIssue[]> = ref(props.issues ?? []);
const { t } = useI18n();

const loading = ref(false);
issues.value = props.issues ?? [];

const fetchIssues = async () => {
  if (!props.id) {
    return;
  }
  loading.value = true;
  const { data } = await apolloClient.mutate({
    mutation: refreshLatestAmazonIssuesMutation,
    variables: { data: { id: props.id } },
  });
  if (data && data.refreshAmazonLatestIssues) {
    issues.value = data.refreshAmazonLatestIssues.formattedIssues || [];
  } else if (props.issues) {
    issues.value = props.issues;
  }
  loading.value = false;
};

watch(() => props.modelValue, (newVal) => {
  localShowModal.value = newVal;
  if (newVal && props.issues) {
    issues.value = props.issues;
  }
});

const closeModal = () => {
  localShowModal.value = false;
  emit('modal-closed');
};
</script>

<template>
  <div>
    <Modal v-model="localShowModal" @closed="closeModal">
      <Loader :loading="loading" />
      <Card class="modal-content w-[90%]">
        <div class="mb-6">
          <h3 class="text-xl font-semibold leading-7 text-gray-900">
            {{ t('integrations.salesChannel.modal.issues.title') }}
          </h3>
        </div>
        <div class="mb-4 overflow-y-auto max-h-96" :class="issues.length > 0 ? 'table-responsive custom-table-scroll' : ''">
          <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
            <thead>
              <tr>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  {{ t('shared.labels.message') }}
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  {{ t('shared.labels.severity') }}
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  {{ t('shared.labels.validationIssue') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="(issue, index) in issues" :key="index">
                <td class="break-words max-w-xs">{{ issue.message }}</td>
                <td class="capitalize">{{ issue.severity }}</td>
                <td>
                  <Icon v-if="issue.validationIssue" name="check-circle" class="text-green-500" />
                  <Icon v-else name="times-circle" class="text-red-500" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <hr />
        <div class="flex justify-end gap-4 mt-4">
          <Button class="btn btn-primary" @click="fetchIssues">{{ t('shared.button.refresh') }}</Button>
          <Button class="btn btn-outline-dark" @click="closeModal">{{ t('shared.button.cancel') }}</Button>
        </div>
      </Card>
    </Modal>
  </div>
</template>
