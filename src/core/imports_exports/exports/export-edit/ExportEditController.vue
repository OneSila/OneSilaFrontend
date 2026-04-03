<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import apolloClient from '../../../../../apollo-client';
import GeneralTemplate from '../../../../shared/templates/GeneralTemplate.vue';
import { Breadcrumbs } from '../../../../shared/components/molecules/breadcrumbs';
import { Loader } from '../../../../shared/components/atoms/loader';
import { Toast } from '../../../../shared/modules/toast';
import { companyLanguagesQuery } from '../../../../shared/api/queries/languages.js';
import { exportQuery } from '../../../../shared/api/queries/importsExports.js';
import { updateExportMutation } from '../../../../shared/api/mutations/importsExports.js';
import ExportForm from '../components/ExportForm.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const id = ref(String(route.params.id));
const loading = ref(true);
const submitting = ref(false);
const languageOptions = ref<Array<{ code: string; name?: string; nameLocal?: string; nameTranslated?: string }>>([]);
const initialValue = ref<Record<string, any> | null>(null);

onMounted(async () => {
  try {
    const [{ data: languagesData }, { data: exportData }] = await Promise.all([
      apolloClient.query({
        query: companyLanguagesQuery,
        fetchPolicy: 'cache-first',
      }),
      apolloClient.query({
        query: exportQuery,
        variables: { id: id.value },
        fetchPolicy: 'network-only',
      }),
    ]);

    languageOptions.value = languagesData?.companyLanguages || [];
    const exportNode = exportData?.['export'];

    initialValue.value = exportNode ? {
      name: exportNode.name || '',
      kind: exportNode.kind,
      ids: exportNode.parameters?.ids || [],
      type: exportNode.type,
      columns: exportNode.columns || [],
      language: exportNode.language || null,
      isPeriodic: Boolean(exportNode.isPeriodic),
      intervalHours: exportNode.intervalHours ?? null,
      salesChannel: exportNode.parameters?.salesChannel ?? null,
      salespricelist: exportNode.parameters?.salespricelist || [],
      activeOnly: exportNode.parameters?.activeOnly ?? null,
      flat: exportNode.parameters?.flat ?? null,
      addTranslations: exportNode.parameters?.addTranslations ?? null,
      valuesAreIds: exportNode.parameters?.valuesAreIds ?? null,
      addValueIds: exportNode.parameters?.addValueIds ?? null,
      addProductSku: exportNode.parameters?.addProductSku ?? null,
      addTitle: exportNode.parameters?.addTitle ?? null,
      addDescription: exportNode.parameters?.addDescription ?? null,
      productPropertiesAddValueIds: exportNode.parameters?.productPropertiesAddValueIds ?? null,
      propertySelectValuesAddValueIds: exportNode.parameters?.propertySelectValuesAddValueIds ?? null,
    } : null;
  } catch (error) {
    console.error(error);
    Toast.error(t('importsExports.exports.alerts.loadError'));
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async (form: any) => {
  submitting.value = true;

  try {
    const payload: Record<string, any> = {
      id: id.value,
      name: form.name || null,
      type: form.type,
      columns: form.columns.length ? form.columns : null,
      language: form.language || null,
      isPeriodic: form.type === 'json_feed' ? form.isPeriodic : false,
      intervalHours: form.type === 'json_feed' && form.isPeriodic ? form.intervalHours : null,
      salesChannel: form.salesChannel || null,
      salespricelist: form.salespricelist.length ? form.salespricelist : null,
      activeOnly: form.activeOnly,
      flat: form.flat,
      addTranslations: form.addTranslations,
      valuesAreIds: form.valuesAreIds,
      addValueIds: form.addValueIds,
      addProductSku: form.addProductSku,
      addTitle: form.addTitle,
      addDescription: form.addDescription,
      productPropertiesAddValueIds: form.productPropertiesAddValueIds,
      propertySelectValuesAddValueIds: form.propertySelectValuesAddValueIds,
    };

    await apolloClient.mutate({
      mutation: updateExportMutation,
      variables: { data: payload },
      fetchPolicy: 'network-only',
    });

    Toast.success(t('importsExports.exports.alerts.updateSuccess'));
    await router.push({
      name: form.action === 'continue' ? 'importsExports.exports.edit' : 'importsExports.exports.show',
      params: { id: id.value },
    });
  } catch (error) {
    console.error(error);
    Toast.error(t('importsExports.exports.alerts.updateError'));
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'importsExports.exports.list' }, name: t('importsExports.exports.title') },
          { path: { name: 'importsExports.exports.show', params: { id } }, name: t('importsExports.exports.show.title') },
          { path: { name: 'importsExports.exports.edit', params: { id } }, name: t('importsExports.exports.edit.title') },
        ]"
      />
    </template>

    <template #content>
      <Loader :loading="loading" />
      <ExportForm
        v-if="!loading && initialValue"
        mode="edit"
        :initial-value="initialValue"
        :language-options="languageOptions"
        :submitting="submitting"
        @cancel="router.push({ name: 'importsExports.exports.show', params: { id } })"
        @details="router.push({ name: 'importsExports.exports.show', params: { id } })"
        @submit="handleSubmit"
      />
    </template>
  </GeneralTemplate>
</template>
