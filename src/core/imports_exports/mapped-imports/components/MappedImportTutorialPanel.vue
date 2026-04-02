<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Card } from '../../../../shared/components/atoms/card';
import { mappedImportTutorials } from '../../tutorials';

const props = defineProps<{
  selectedType: string | null;
}>();

const { t } = useI18n();

const definition = computed(() => {
  if (!props.selectedType) {
    return null;
  }

  return mappedImportTutorials[props.selectedType] ?? null;
});
</script>

<template>
  <Card class="sticky top-6 border border-slate-200 bg-slate-50 p-6 shadow-sm">
    <template v-if="definition">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            {{ t('importsExports.mappedImports.tutorial.title') }}
          </p>
          <h2 class="mt-2 text-2xl font-semibold text-slate-900">
            {{ t(`importsExports.mappedImports.types.${definition.type}`) }}
          </h2>
        </div>
        <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
          {{ definition.type }}
        </span>
      </div>

      <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {{ t('importsExports.mappedImports.tutorial.purpose') }}
        </h3>
        <p class="mt-2 text-sm leading-6 text-slate-700">{{ definition.purpose }}</p>
      </div>

      <div class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-amber-700">
          {{ t('importsExports.mappedImports.tutorial.minimumRule') }}
        </h3>
        <p class="mt-2 text-sm leading-6 text-amber-900">{{ definition.minimumRule }}</p>
      </div>

      <div v-if="definition.notes?.length" class="mt-4">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {{ t('importsExports.mappedImports.tutorial.importantNotes') }}
        </h3>
        <ul class="mt-3 space-y-2 text-sm leading-6 text-slate-700">
          <li v-for="note in definition.notes" :key="note" class="rounded-xl border border-slate-200 bg-white px-4 py-3">
            {{ note }}
          </li>
        </ul>
      </div>

      <div class="mt-6 space-y-6">
        <section v-for="section in definition.sections" :key="section.title" class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div class="border-b border-slate-200 bg-slate-100/80 px-4 py-3">
            <h3 class="text-sm font-semibold text-slate-900">{{ section.title }}</h3>
            <p v-if="section.intro" class="mt-1 text-sm text-slate-600">{{ section.intro }}</p>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200 text-sm">
              <thead class="bg-white">
                <tr class="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th class="px-4 py-3">{{ t('importsExports.mappedImports.tutorial.table.field') }}</th>
                  <th class="px-4 py-3">{{ t('importsExports.mappedImports.tutorial.table.required') }}</th>
                  <th class="px-4 py-3">{{ t('importsExports.mappedImports.tutorial.table.type') }}</th>
                  <th class="px-4 py-3">{{ t('importsExports.mappedImports.tutorial.table.meaning') }}</th>
                  <th class="px-4 py-3">{{ t('importsExports.mappedImports.tutorial.table.behavior') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-for="field in section.fields" :key="`${section.title}-${field.name}`" class="align-top">
                  <td class="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-800">{{ field.name }}</td>
                  <td class="whitespace-nowrap px-4 py-3 text-slate-700">{{ field.required }}</td>
                  <td class="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-700">{{ field.dataType }}</td>
                  <td class="px-4 py-3 text-slate-700">{{ field.meaning }}</td>
                  <td class="px-4 py-3 text-slate-700">{{ field.behavior }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div class="mt-6">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {{ t('importsExports.mappedImports.tutorial.exampleJson') }}
        </h3>
        <pre class="mt-3 max-h-[30rem] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">{{ definition.exampleJson }}</pre>
      </div>
    </template>

    <template v-else>
      <p class="text-sm leading-6 text-slate-600">
        {{ t('importsExports.mappedImports.tutorial.empty') }}
      </p>
    </template>
  </Card>
</template>
