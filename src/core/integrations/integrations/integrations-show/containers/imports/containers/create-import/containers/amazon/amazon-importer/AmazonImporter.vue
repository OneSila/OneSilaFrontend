<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { Wizard } from '../../../../../../../../../../shared/components/molecules/wizard';
import { OptionSelector } from '../../../../../../../../../../shared/components/molecules/option-selector';
import apolloClient from '../../../../../../../../../../../apollo-client';
import { Toast } from '../../../../../../../../../../shared/modules/toast';
import { createAmazonImportProcessMutation } from '../../../../../../../../../../shared/api/mutations/salesChannels';
import { amazonImportProcessesQuery } from '../../../../../../../../../../shared/api/queries/salesChannels';
import { IntegrationTypes } from '../../../../../../integrations';

const props = defineProps<{ integrationId: string; type: string }>();
const router = useRouter();
const { t } = useI18n();

const importType = ref('schema');
const hasFinishedSchema = ref(false);
const loading = ref(false);

const typeChoices = computed(() => [
  { name: 'schema' },
  { name: 'products', disabled: !hasFinishedSchema.value },
]);

const fetchImports = async () => {
  loading.value = true;
  try {
    const { data } = await apolloClient.query({
      query: amazonImportProcessesQuery,
      variables: { filter: { salesChannel: { id: { exact: props.integrationId } } } },
      fetchPolicy: 'network-only',
    });
    const edges = data?.amazonImportProcesses?.edges || [];
    hasFinishedSchema.value = edges.some((e: any) => e.node.type === 'schema' && e.node.status === 'success');
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchImports);

const createImport = async () => {
  try {
    await apolloClient.mutate({
      mutation: createAmazonImportProcessMutation,
      variables: {
        data: {
          salesChannel: { id: props.integrationId },
          type: importType.value,
          status: 'pending',
        },
      },
    });
    Toast.success(t('integrations.imports.create.success'));
    router.push({ name: 'integrations.integrations.show', params: { id: props.integrationId, type: props.type }, query: { tab: 'imports' } });
  } catch (err) {
    console.error(err);
    Toast.error(t('shared.form.error'));
  }
};

const wizardSteps = [{ title: t('integrations.imports.create.title'), name: 'selectType' }];

</script>

<template>
  <Wizard :steps="wizardSteps" :show-buttons="true" @on-finish="createImport">
    <template #selectType>
      <div class="flex flex-col gap-6">
        <OptionSelector v-model="importType" :choices="typeChoices">
          <template #schema>
            <div>
              <h3 class="text-lg font-bold">{{ t('integrations.imports.types.schema') }}</h3>
            </div>
          </template>
          <template #products>
            <div>
              <h3 class="text-lg font-bold">{{ t('integrations.imports.types.products') }}</h3>
            </div>
          </template>
        </OptionSelector>
      </div>
    </template>
  </Wizard>
</template>
