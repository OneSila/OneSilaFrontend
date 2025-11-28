<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { Wizard } from "../../../../../../../../../../../shared/components/molecules/wizard";
import { OptionSelector } from "../../../../../../../../../../../shared/components/molecules/option-selector";
import { Icon } from "../../../../../../../../../../../shared/components/atoms/icon";
import apolloClient from "../../../../../../../../../../../../apollo-client";
import { Toast } from "../../../../../../../../../../../shared/modules/toast";
import { createSheinImportProcessMutation } from "../../../../../../../../../../../shared/api/mutations/salesChannels";
import { sheinImportProcessesQuery } from "../../../../../../../../../../../shared/api/queries/salesChannels";
import { processGraphQLErrors } from "../../../../../../../../../../../shared/utils";

const props = defineProps<{ integrationId: string; type: string }>();
const router = useRouter();
const { t } = useI18n();

const importType = ref("schema");
const hasFinishedSchema = ref(false);
const loading = ref(false);

const typeChoices = computed(() => [
  { name: "schema" },
  {
    name: "products",
    disabled: !hasFinishedSchema.value,
    hideDisabledBanner: true,
  },
]);

const fetchImports = async () => {
  loading.value = true;
  try {
    const { data } = await apolloClient.query({
      query: sheinImportProcessesQuery,
      variables: {
        filter: {
          salesChannel: { id: { exact: props.integrationId } },
          type: { exact: "schema" },
          status: { exact: "success" },
        },
      },
      fetchPolicy: "cache-first",
    });
    const edges = data?.sheinImportProcesses?.edges || [];
    hasFinishedSchema.value = edges.length > 0;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchImports);

const createImport = async () => {
  try {
    await apolloClient.mutate({
      mutation: createSheinImportProcessMutation,
      variables: {
        data: {
          salesChannel: { id: props.integrationId },
          type: importType.value,
          status: "pending",
        },
      },
    });
    Toast.success(t("integrations.imports.create.success"));
    router.push({
      name: "integrations.integrations.show",
      params: { id: props.integrationId, type: props.type },
      query: { tab: "imports" },
    });
  } catch (err) {
    const validationErrors = processGraphQLErrors(err, t);
    if (validationErrors["__all__"]) {
      Toast.error(validationErrors["__all__"]);
    }
  }
};

const wizardSteps = [
  { title: t("integrations.imports.create.title"), name: "selectType" },
];
</script>

<template>
  <Wizard :steps="wizardSteps" :show-buttons="true" @on-finish="createImport">
    <template #selectType>
      <div class="flex flex-col gap-6">
        <OptionSelector v-model="importType" :choices="typeChoices" :disabled="loading">
          <template #schema>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-bold">
                  {{ t("integrations.imports.types.schema") }}
                </h3>
              </div>
              <p class="text-sm text-gray-500">
                {{ t("integrations.imports.types.schemaDescription") }}
              </p>
            </div>
          </template>
          <template #products>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-bold">
                  {{ t("integrations.imports.types.products") }}
                </h3>
              </div>
              <p class="text-sm text-gray-500">
                {{ t("integrations.imports.types.productsDescription") }}
              </p>
              <div
                v-if="!hasFinishedSchema"
                class="text-sm text-gray-400 flex items-center gap-1"
              >
                <Icon name="exclamation-circle" class="text-gray-400" />
                <span>
                  {{ t("integrations.imports.types.schemaRequired") }}
                </span>
              </div>
            </div>
          </template>
        </OptionSelector>
      </div>
    </template>
  </Wizard>
</template>
