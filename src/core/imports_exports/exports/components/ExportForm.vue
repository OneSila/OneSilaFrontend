<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { TextInput } from '../../../../shared/components/atoms/input-text';
import { Toggle } from '../../../../shared/components/atoms/toggle';
import { PrimaryButton } from '../../../../shared/components/atoms/button-primary';
import { SecondaryButton } from '../../../../shared/components/atoms/button-secondary';
import { Selector } from '../../../../shared/components/atoms/selector';
import { Card } from '../../../../shared/components/atoms/card';
import { Button } from '../../../../shared/components/atoms/button';
import { FieldQuery } from '../../../../shared/components/organisms/general-form/containers/form-fields/field-query';
import type { QueryFormField } from '../../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../../shared/utils/constants';
import { salesPriceListsQuerySelector } from '../../../../shared/api/queries/salesPrices.js';
import { salesChannelsQuerySelector } from '../../../../shared/api/queries/salesChannels.js';
import FormFieldShell from '../../components/FormFieldShell.vue';
import ExportColumnsBuilder from './ExportColumnsBuilder.vue';
import ExportSelectedRecords from './ExportSelectedRecords.vue';
import {
  EXPORT_KIND_COLUMNS,
  EXPORT_KIND_DEFAULT_COLUMNS,
  EXPORT_KIND_PARAMETERS,
  getExportKindOptionsWithCurrent,
  getExportTypeOptions,
  getLanguageOptions,
} from '../../configs';

type SubmitAction = 'save' | 'continue';

type ExportFormValue = {
  name: string;
  kind: string;
  ids: string[];
  type: string;
  columns: string[];
  language: string | null;
  isPeriodic: boolean;
  intervalHours: number | null;
  salesChannel: string | null;
  salespricelist: string[];
  activeOnly: boolean | null;
  flat: boolean | null;
  addTranslations: boolean | null;
  valuesAreIds: boolean | null;
  addValueIds: boolean | null;
  addProductSku: boolean | null;
  addTitle: boolean | null;
  addDescription: boolean | null;
  productPropertiesAddValueIds: boolean | null;
  propertySelectValuesAddValueIds: boolean | null;
};

const props = withDefaults(defineProps<{
  mode: 'create' | 'edit';
  initialValue?: Partial<ExportFormValue> | null;
  languageOptions: Array<{ code: string; name?: string; nameLocal?: string; nameTranslated?: string }>;
  lockKind?: boolean;
  submitting?: boolean;
}>(), {
  initialValue: null,
  lockKind: false,
  submitting: false,
});

const emit = defineEmits<{
  (e: 'submit', value: ExportFormValue & { action: SubmitAction }): void;
  (e: 'cancel'): void;
  (e: 'details'): void;
}>();

const { t } = useI18n();

const defaultFormState = (): ExportFormValue => ({
  name: '',
  kind: 'products',
  ids: [],
  type: 'json_feed',
  columns: [...(EXPORT_KIND_DEFAULT_COLUMNS.products || [])],
  language: null,
  isPeriodic: false,
  intervalHours: null,
  salesChannel: null,
  salespricelist: [],
  activeOnly: null,
  flat: null,
  addTranslations: null,
  valuesAreIds: null,
  addValueIds: null,
  addProductSku: null,
  addTitle: null,
  addDescription: null,
  productPropertiesAddValueIds: null,
  propertySelectValuesAddValueIds: null,
});

const form = reactive<ExportFormValue>(defaultFormState());
const fieldErrors = reactive<Record<string, string | null>>({
  kind: null,
  type: null,
  intervalHours: null,
});

const isEdit = computed(() => props.mode === 'edit');
const isKindLocked = computed(() => isEdit.value || props.lockKind);
const kindOptions = computed(() => getExportKindOptionsWithCurrent(t, form.kind));
const typeOptions = computed(() => getExportTypeOptions(t));
const languageSelectorOptions = computed(() => getLanguageOptions(props.languageOptions, true, t('importsExports.shared.none')));
const supportedParameters = computed(() => EXPORT_KIND_PARAMETERS[form.kind as keyof typeof EXPORT_KIND_PARAMETERS] || []);
const allowedParameters = computed(() => supportedParameters.value.filter((name) => name !== 'ids'));

const relationField = (
  name: string,
  query: any,
  dataKey: string,
  labelBy: string,
  multiple = true,
): QueryFormField => ({
  type: FieldType.Query,
  name,
  labelBy,
  valueBy: 'id',
  query,
  dataKey,
  multiple,
  filterable: true,
  isEdge: true,
  removable: true,
});

const salesPricelistField = relationField('salespricelist', salesPriceListsQuerySelector, 'salesPriceLists', 'name');
const salesChannelField = relationField('salesChannel', salesChannelsQuerySelector, 'salesChannels', 'hostname', false);

const humanize = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());

const parameterVisible = (name: string) => allowedParameters.value.includes(name);

const getBooleanParameterValue = (name: string) => {
  const value = (form as Record<string, boolean | null | string | string[] | number | undefined>)[name];
  return typeof value === 'boolean' ? value : undefined;
};

const setBooleanParameterValue = (name: string, value: boolean) => {
  (form as Record<string, boolean | null | string | string[] | number | undefined>)[name] = value;
};

const applyInitialValue = () => {
  const next = defaultFormState();
  Object.assign(next, props.initialValue || {});
  Object.assign(form, next);

  if (form.type !== 'json_feed') {
    form.isPeriodic = false;
    form.intervalHours = null;
  }
};

watch(
  () => props.initialValue,
  () => applyInitialValue(),
  { immediate: true, deep: true },
);

watch(
  () => form.kind,
  (nextKind) => {
    const supportedColumns = new Set(EXPORT_KIND_COLUMNS[nextKind as keyof typeof EXPORT_KIND_COLUMNS] || []);
    form.columns = form.columns.filter((value) => supportedColumns.has(value));

    if (!form.columns.length) {
      form.columns = [...(EXPORT_KIND_DEFAULT_COLUMNS[nextKind as keyof typeof EXPORT_KIND_DEFAULT_COLUMNS] || [])];
    }

    Object.keys(form).forEach((key) => {
      if (['name', 'kind', 'type', 'columns', 'language', 'isPeriodic', 'intervalHours'].includes(key)) {
        return;
      }

      if (!supportedParameters.value.includes(key)) {
        (form as Record<string, any>)[key] = Array.isArray((form as Record<string, any>)[key]) ? [] : null;
      }
    });
  },
  { immediate: true },
);

watch(
  () => form.type,
  (nextType) => {
    if (nextType !== 'json_feed') {
      form.isPeriodic = false;
      form.intervalHours = null;
      fieldErrors.intervalHours = null;
    }
  },
);

const validate = () => {
  Object.keys(fieldErrors).forEach((key) => {
    fieldErrors[key] = null;
  });

  if (!form.kind) {
    fieldErrors.kind = t('importsExports.validation.required');
  }

  if (!form.type) {
    fieldErrors.type = t('importsExports.validation.required');
  }

  if (form.type === 'json_feed' && form.isPeriodic && (!form.intervalHours || form.intervalHours <= 0)) {
    fieldErrors.intervalHours = t('importsExports.validation.intervalHoursPositive');
  }

  return !Object.values(fieldErrors).some(Boolean);
};

const handleSubmit = (action: SubmitAction) => {
  if (!validate()) {
    return;
  }

  emit('submit', {
    ...form,
    action,
  });
};
</script>

<template>
  <Card class="border border-slate-200 p-6 shadow-sm">
    <div class="space-y-8">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">{{ t(`importsExports.exports.${mode}.title`) }}</h2>
        <p class="mt-1 text-sm leading-6 text-slate-500">{{ t('importsExports.exports.form.subtitle') }}</p>
      </div>

      <div class="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div class="md:col-span-2 xl:col-span-3">
          <FormFieldShell :label="t('shared.labels.name')">
            <TextInput v-model:model-value="form.name" class="w-full" :placeholder="t('shared.placeholders.name')" />
          </FormFieldShell>
        </div>

        <FormFieldShell :label="t('importsExports.fields.kind')" required :hint="isKindLocked ? t('importsExports.exports.form.kindLocked') : null" :error="fieldErrors.kind">
          <Selector
            v-model="form.kind"
            :options="kindOptions"
            label-by="label"
            value-by="value"
            :disabled="isKindLocked"
          />
        </FormFieldShell>

        <FormFieldShell :label="t('shared.labels.type')" required :error="fieldErrors.type">
          <Selector
            v-model="form.type"
            :options="typeOptions"
            label-by="label"
            value-by="value"
          />
        </FormFieldShell>

        <FormFieldShell :label="t('shared.labels.language')">
          <Selector
            v-model="form.language"
            :options="languageSelectorOptions"
            label-by="label"
            value-by="value"
            filterable
            :placeholder="t('importsExports.shared.none')"
          />
        </FormFieldShell>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <ExportColumnsBuilder v-model="form.columns" :kind="form.kind" />
      </div>

      <ExportSelectedRecords :kind="form.kind" :ids="form.ids" />

      <div v-if="form.type === 'json_feed'" class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div class="grid gap-6 md:grid-cols-2">
          <FormFieldShell :label="t('importsExports.fields.isPeriodic')">
            <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <span class="text-sm text-slate-700">{{ t('importsExports.fields.isPeriodic') }}</span>
              <Toggle v-model="form.isPeriodic" />
            </div>
          </FormFieldShell>

          <FormFieldShell v-if="form.isPeriodic" :label="t('importsExports.fields.intervalHours')" required :error="fieldErrors.intervalHours">
            <TextInput
              v-model:model-value="form.intervalHours"
              class="w-full"
              number
              :min-number="1"
              :placeholder="t('importsExports.placeholders.intervalHours')"
            />
          </FormFieldShell>
        </div>
      </div>

      <div class="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div>
          <h3 class="text-base font-semibold text-slate-900">{{ t('importsExports.exports.form.parametersTitle') }}</h3>
          <p class="mt-1 text-sm text-slate-500">{{ t('importsExports.exports.form.parametersSubtitle') }}</p>
        </div>

        <div v-if="parameterVisible('salesChannel') || parameterVisible('salespricelist')" class="grid items-start gap-6 md:grid-cols-2">
          <FormFieldShell v-if="parameterVisible('salesChannel')" :label="humanize('salesChannel')">
            <FieldQuery :field="salesChannelField" :model-value="form.salesChannel" @update:model-value="form.salesChannel = $event" />
          </FormFieldShell>

          <FormFieldShell v-if="parameterVisible('salespricelist')" :label="humanize('salespricelist')">
            <FieldQuery :field="salesPricelistField" :model-value="form.salespricelist" @update:model-value="form.salespricelist = $event || []" />
          </FormFieldShell>
        </div>

        <div class="grid items-start gap-4 md:grid-cols-2">
          <div
            v-for="parameterName in allowedParameters.filter((name) => !['salesChannel', 'salespricelist'].includes(name))"
            :key="parameterName"
            class="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div class="flex items-center justify-between gap-3">
              <h4 class="text-sm font-semibold text-slate-900">{{ humanize(parameterName) }}</h4>
              <Toggle
                :model-value="getBooleanParameterValue(parameterName)"
                @update:model-value="setBooleanParameterValue(parameterName, Boolean($event))"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-6">
        <SecondaryButton :disabled="submitting" @click="emit('cancel')">
          {{ t('shared.button.cancel') }}
        </SecondaryButton>
        <Button
          v-if="isEdit"
          type="button"
          class="button rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm btn-info"
          :disabled="submitting"
          @click="emit('details')"
        >
          {{ t('shared.button.show') }}
        </Button>
        <SecondaryButton :disabled="submitting" @click="handleSubmit('continue')">
          {{ t(mode === 'create' ? 'shared.button.createAndContinue' : 'shared.button.saveAndContinue') }}
        </SecondaryButton>
        <PrimaryButton :loading="submitting" :disabled="submitting" @click="handleSubmit('save')">
          {{ t(mode === 'create' ? 'shared.button.create' : 'shared.button.save') }}
        </PrimaryButton>
      </div>
    </div>
  </Card>
</template>
