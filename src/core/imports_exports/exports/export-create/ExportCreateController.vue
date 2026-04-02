<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import apolloClient from '../../../../../apollo-client';
import GeneralTemplate from '../../../../shared/templates/GeneralTemplate.vue';
import { Breadcrumbs } from '../../../../shared/components/molecules/breadcrumbs';
import { Loader } from '../../../../shared/components/atoms/loader';
import { Toast } from '../../../../shared/modules/toast';
import { companyLanguagesQuery } from '../../../../shared/api/queries/languages.js';
import { createExportMutation } from '../../../../shared/api/mutations/importsExports.js';
import ExportForm from '../components/ExportForm.vue';

const { t } = useI18n();
const router = useRouter();

const loading = ref(true);
const submitting = ref(false);
const languageOptions = ref<Array<{ code: string; name?: string; nameLocal?: string; nameTranslated?: string }>>([]);

onMounted(async () => {
  try {
    const { data } = await apolloClient.query({
      query: companyLanguagesQuery,
      fetchPolicy: 'cache-first',
    });
    languageOptions.value = data?.companyLanguages || [];
  } catch (error) {
    console.error(error);
    Toast.error(t('importsExports.alerts.languagesLoadError'));
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async (form: any) => {
  submitting.value = true;

  try {
    const payload: Record<string, any> = {
      name: form.name || null,
      kind: form.kind,
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

    const { data } = await apolloClient.mutate({
      mutation: createExportMutation,
      variables: { data: payload },
      fetchPolicy: 'network-only',
    });

    const createdId = data?.createExport?.id;
    Toast.success(t('importsExports.exports.alerts.createSuccess'));

    if (createdId) {
      await router.push({
        name: form.action === 'continue' ? 'importsExports.exports.edit' : 'importsExports.exports.show',
        params: { id: createdId },
      });
      return;
    }

    await router.push({ name: 'importsExports.exports.list' });
  } catch (error) {
    console.error(error);
    Toast.error(t('importsExports.exports.alerts.createError'));
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
          { path: { name: 'importsExports.exports.create' }, name: t('importsExports.exports.create.title') },
        ]"
      />
    </template>

    <template #content>
      <Loader :loading="loading" />
      <ExportForm
        v-if="!loading"
        mode="create"
        :language-options="languageOptions"
        :submitting="submitting"
        @cancel="router.push({ name: 'importsExports.exports.list' })"
        @details="router.push({ name: 'importsExports.exports.list' })"
        @submit="handleSubmit"
      />
    </template>
  </GeneralTemplate>
</template>
