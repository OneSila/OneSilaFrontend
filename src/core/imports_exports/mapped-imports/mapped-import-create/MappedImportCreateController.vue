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
import { createMappedImportMutation } from '../../../../shared/api/mutations/importsExports.js';
import MappedImportForm from '../components/MappedImportForm.vue';

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
      createOnly: form.createOnly,
      updateOnly: form.updateOnly,
      overrideOnly: form.overrideOnly,
      skipBrokenRecords: form.skipBrokenRecords,
      type: form.type,
      isPeriodic: form.isPeriodic,
      intervalHours: form.isPeriodic ? form.intervalHours : null,
      language: form.language || null,
      jsonUrl: form.sourceMode === 'url' ? form.jsonUrl || null : null,
      jsonFile: form.sourceMode === 'file' ? form.jsonFile : null,
    };

    const { data } = await apolloClient.mutate({
      mutation: createMappedImportMutation,
      variables: { data: payload },
      fetchPolicy: 'network-only',
    });

    const createdId = data?.createMappedImport?.id;
    Toast.success(t('importsExports.mappedImports.alerts.createSuccess'));

    if (createdId) {
      await router.push({
        name: form.action === 'continue' ? 'importsExports.mappedImports.edit' : 'importsExports.mappedImports.show',
        params: { id: createdId },
      });
      return;
    }

    await router.push({ name: 'importsExports.mappedImports.list' });
  } catch (error) {
    console.error(error);
    Toast.error(t('importsExports.mappedImports.alerts.createError'));
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
          { path: { name: 'importsExports.mappedImports.list' }, name: t('importsExports.mappedImports.title') },
          { path: { name: 'importsExports.mappedImports.create' }, name: t('importsExports.mappedImports.create.title') },
        ]"
      />
    </template>

    <template #content>
      <Loader :loading="loading" />
      <MappedImportForm
        v-if="!loading"
        mode="create"
        :language-options="languageOptions"
        :submitting="submitting"
        @cancel="router.push({ name: 'importsExports.mappedImports.list' })"
        @details="router.push({ name: 'importsExports.mappedImports.list' })"
        @submit="handleSubmit"
      />
    </template>
  </GeneralTemplate>
</template>
