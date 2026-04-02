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
import { mappedImportQuery } from '../../../../shared/api/queries/importsExports.js';
import { updateMappedImportMutation } from '../../../../shared/api/mutations/importsExports.js';
import MappedImportForm from '../components/MappedImportForm.vue';

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
    const [{ data: languagesData }, { data: mappedImportData }] = await Promise.all([
      apolloClient.query({
        query: companyLanguagesQuery,
        fetchPolicy: 'cache-first',
      }),
      apolloClient.query({
        query: mappedImportQuery,
        variables: { id: id.value },
        fetchPolicy: 'network-only',
      }),
    ]);

    languageOptions.value = languagesData?.companyLanguages || [];
    const mappedImport = mappedImportData?.mappedImport;
    initialValue.value = mappedImport ? {
      name: mappedImport.name || '',
      type: mappedImport.type,
      language: mappedImport.language || null,
      createOnly: Boolean(mappedImport.createOnly),
      updateOnly: Boolean(mappedImport.updateOnly),
      overrideOnly: Boolean(mappedImport.overrideOnly),
      skipBrokenRecords: Boolean(mappedImport.skipBrokenRecords),
      isPeriodic: Boolean(mappedImport.isPeriodic),
      intervalHours: mappedImport.intervalHours ?? null,
      jsonUrl: mappedImport.jsonUrl || '',
      jsonFile: mappedImport.jsonFile || (mappedImport.jsonFileUrl ? {
        name: mappedImport.jsonFile?.name || 'import.json',
        url: mappedImport.jsonFileUrl,
      } : null),
    } : null;
  } catch (error) {
    console.error(error);
    Toast.error(t('importsExports.mappedImports.alerts.loadError'));
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
      createOnly: form.createOnly,
      updateOnly: form.updateOnly,
      overrideOnly: form.overrideOnly,
      skipBrokenRecords: form.skipBrokenRecords,
      isPeriodic: form.isPeriodic,
      intervalHours: form.isPeriodic ? form.intervalHours : null,
      language: form.language || null,
    };

    if (form.sourceMode === 'url') {
      payload.jsonUrl = form.jsonUrl || null;
      payload.jsonFile = null;
    } else {
      payload.jsonUrl = null;
      if (form.jsonFile instanceof File) {
        payload.jsonFile = form.jsonFile;
      }
    }

    await apolloClient.mutate({
      mutation: updateMappedImportMutation,
      variables: { data: payload },
      fetchPolicy: 'network-only',
    });

    Toast.success(t('importsExports.mappedImports.alerts.updateSuccess'));
    await router.push({
      name: form.action === 'continue' ? 'importsExports.mappedImports.edit' : 'importsExports.mappedImports.show',
      params: { id: id.value },
    });
  } catch (error) {
    console.error(error);
    Toast.error(t('importsExports.mappedImports.alerts.updateError'));
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
          { path: { name: 'importsExports.mappedImports.show', params: { id } }, name: t('importsExports.mappedImports.show.title') },
          { path: { name: 'importsExports.mappedImports.edit', params: { id } }, name: t('importsExports.mappedImports.edit.title') },
        ]"
      />
    </template>

    <template #content>
      <Loader :loading="loading" />
      <MappedImportForm
        v-if="!loading && initialValue"
        mode="edit"
        :initial-value="initialValue"
        :language-options="languageOptions"
        :submitting="submitting"
        @cancel="router.push({ name: 'importsExports.mappedImports.show', params: { id } })"
        @details="router.push({ name: 'importsExports.mappedImports.show', params: { id } })"
        @submit="handleSubmit"
      />
    </template>
  </GeneralTemplate>
</template>
