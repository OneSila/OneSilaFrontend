<script setup lang="ts">

import {useI18n} from 'vue-i18n';
import {ChoiceFormField, FormField, QueryFormField} from '../../../../shared/components/organisms/general-form/formConfig';
import {getProductField, MOVEMENT_FROM_MODELS, MOVEMENT_TO_MODELS} from "../configs";
import {Breadcrumbs} from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute} from "vue-router";
import {FieldType, INVENTORY_MOVEMENTS_MODEL_CODES, PurchaseOrderOpenStatuses} from "../../../../shared/utils/constants";
import {onMounted, reactive, Ref, ref, watch} from "vue";
import {Label} from "../../../../shared/components/atoms/label";
import {FieldQuery} from "../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import {FieldValue} from "../../../../shared/components/organisms/general-form/containers/form-fields/field-value";
import {FieldChoice} from "../../../../shared/components/organisms/general-form/containers/form-fields/field-choice";
import {FieldTextarea} from "../../../../shared/components/organisms/general-form/containers/form-fields/field-textarea";
import {purchaseOrdersQuery} from "../../../../shared/api/queries/purchasing.js";
import {inventoryLocationsQuery} from "../../../../shared/api/queries/inventory.js";
import SubmitButtons from "./containers/SubmitButtons.vue";
import {Icon} from "../../../../shared/components/atoms/icon";

const { t } = useI18n();
const route = useRoute();

const movementFromModelFromUrl = route.query.from ? route.query.from.toString() : null;
const movementFromIdFromUrl = route.query.fromId ? route.query.fromId.toString() : null;
const productIdFromUrl = route.query.productId ? route.query.productId.toString() : null;

interface FormState {
  product: { id: string | null };
  quantity: number | null;
  movementFromId: string | null;
  movementToId: string | null;
  notes: string | null;
}

const form = reactive<FormState>({
  product: { id: null },
  quantity: null,
  movementFromId: null,
  movementToId: null,
  notes: null,
});


onMounted(() => {
  if (movementFromModelFromUrl) {
    movementFromModel.value = movementFromModelFromUrl;
  }
  if (movementFromIdFromUrl) {
    form.movementFromId = movementFromIdFromUrl;
  }
  if (productIdFromUrl) {
    form.product.id = productIdFromUrl;
  }
});

const movementFromModel: Ref<string> = ref('');
const movementToModel: Ref<string> = ref(INVENTORY_MOVEMENTS_MODEL_CODES.INVENTORY_LOCATION);
const errors: Ref<Record<string, string>> = ref({});
const movementFromIdField: Ref<ChoiceFormField | QueryFormField | null> = ref({
    type: FieldType.Choice,
    name: 'movementFromId',
    label: t('inventory.movements.labels.movementFrom'),
    options: [],
    labelBy: 'name',
    valueBy: 'id',
    disabled: true,
  });

const movementToIdField: Ref<ChoiceFormField | QueryFormField | null> = ref({
    type: FieldType.Choice,
    name: 'movementToId',
    label: t('inventory.movements.labels.movementTo'),
    options: [],
    labelBy: 'name',
    valueBy: 'id',
    disabled: true,
  });


const productField = getProductField(productIdFromUrl, t);
const quantityField: FormField = {
      type: FieldType.Text,
      name: 'quantity',
      number: true,
      label: t('shared.labels.quantity'),
    };

const movementFromField: FormField = {
          type: FieldType.Choice,
          name: 'movementFromModel',
          label: t('inventory.movements.labels.movementFromModel'),
          options: MOVEMENT_FROM_MODELS(t),
          labelBy: 'name',
          valueBy: 'code',
          disabled: !!movementFromModelFromUrl,
};

const movementToField: FormField = {
  type: FieldType.Choice,
  name: 'movementToModel',
  label: t('inventory.movements.labels.movementToModel'),
  options: MOVEMENT_TO_MODELS(t),
  labelBy: 'name',
  valueBy: 'code',
};

const notesField: FormField = {
  type: FieldType.Textarea,
  name: 'notes',
  label: t('inventory.movements.labels.notes'),
  optional: true,
};


const getQueryForModel = (modelCode) => {
  switch (modelCode) {
    case INVENTORY_MOVEMENTS_MODEL_CODES.PURCHASE_ORDER:
      return purchaseOrdersQuery;
    case INVENTORY_MOVEMENTS_MODEL_CODES.INVENTORY_LOCATION:
      return inventoryLocationsQuery;
    default:
      return inventoryLocationsQuery;
  }
};

const getDataKeyForModel = (modelCode) => {
  switch (modelCode) {
    case INVENTORY_MOVEMENTS_MODEL_CODES.PURCHASE_ORDER:
      return 'purchaseOrders';
    case INVENTORY_MOVEMENTS_MODEL_CODES.INVENTORY_LOCATION:
      return 'inventoryLocations';
    default:
      return 'inventoryLocations';
  }
};

const getLabelForModel = (modelCode) => {
  switch (modelCode) {
    case INVENTORY_MOVEMENTS_MODEL_CODES.PURCHASE_ORDER:
      return t('purchasing.orders.show.title');
    case INVENTORY_MOVEMENTS_MODEL_CODES.INVENTORY_LOCATION:
      return t('inventory.inventoryLocations.show.title');
    default:
      return t('inventory.inventoryLocations.show.title');
  }
};

const getLabelByForModel = (modelCode) => {
  switch (modelCode) {
    case INVENTORY_MOVEMENTS_MODEL_CODES.PURCHASE_ORDER:
      return 'createdAt';
    case INVENTORY_MOVEMENTS_MODEL_CODES.INVENTORY_LOCATION:
      return 'name';
    default:
      return 'name';
  }
};

const getFiltersForMovementFromModel = () => {
  switch (movementFromModel.value) {
    case INVENTORY_MOVEMENTS_MODEL_CODES.PURCHASE_ORDER:
      return {
        filter: {
          purchaseorderitem: {
            product: {
              id: {
                exact: form.product.id,
              },
            },
          },
          status: {
            inList: PurchaseOrderOpenStatuses,
          },
        },
      };
    case INVENTORY_MOVEMENTS_MODEL_CODES.INVENTORY_LOCATION:
      return {
        filter: {
          inventory: {
            product: {
              id: {
                exact: form.product.id,
              },
            },
            quantity: {
              gt: 0,
            },
          },
        },
      };
    default:
      return {};
  }
};

const getFiltersForMovementToModel = () => {
  switch (movementToModel.value) {
    case INVENTORY_MOVEMENTS_MODEL_CODES.INVENTORY_LOCATION:
      let filter: Record<string, any> = {};
      if (
        movementFromModel.value === INVENTORY_MOVEMENTS_MODEL_CODES.INVENTORY_LOCATION &&
        form.movementFromId
      ) {
        filter.id = {
          nExact: form.movementFromId,
        };
      }
      return {
        filter: filter,
      };
    default:
      return {};
  }
};


watch(movementFromModel, (newValue) => {
  if (newValue && form.product.id !== null) {
    movementFromIdField.value = {
      type: FieldType.Query,
      name: 'movementFromId',
      label: getLabelForModel(newValue),
      labelBy: getLabelByForModel(newValue),
      valueBy: 'id',
      query: getQueryForModel(newValue),
      dataKey: getDataKeyForModel(newValue),
      queryVariables: getFiltersForMovementFromModel(),
      isEdge: true,
      multiple: false,
      filterable: true,
      formMapIdentifier: 'id',
      disabled: !!movementFromIdFromUrl,
    };
  } else {
    movementFromIdField.value = {
      type: FieldType.Choice,
      name: 'movementFromId',
      label: t('inventory.movements.labels.movementFrom'),
      options: [],
      labelBy: 'name',
      valueBy: 'id',
      disabled: true,
    };
  }
  form.movementFromId = null;
});

watch(
  () => form.product.id,
  (newProductId, oldProductId) => {
    if (newProductId && movementFromIdField.value !== null) {
      movementFromIdField.value = {
        type: FieldType.Query,
        name: 'movementFromId',
        label: t('inventory.movements.labels.movementFrom'),
        labelBy: getLabelByForModel(movementFromModel.value),
        valueBy: 'id',
        query: getQueryForModel(movementFromModel.value),
        dataKey: getDataKeyForModel(movementFromModel.value),
        queryVariables: getFiltersForMovementFromModel(),
        isEdge: true,
        multiple: false,
        filterable: true,
        formMapIdentifier: 'id',
        disabled: !!movementFromIdFromUrl,
      };
    } else {
      movementFromIdField.value = {
        type: FieldType.Choice,
        name: 'movementFromId',
        label: t('inventory.movements.labels.movementFrom'),
        options: [],
        labelBy: 'name',
        valueBy: 'id',
        disabled: true,
      };
    }
    if (newProductId !== oldProductId) {
      form.movementFromId = null; // Reset only if product.id has changed
    }
  }
);


// Watcher for movementToModel and form.movementFromId
watch(
  [movementToModel, () => form.movementFromId],
  ([newMovementToModel, newMovementFromId]) => {
    if (newMovementToModel && newMovementFromId) {
      movementToIdField.value = {
        type: FieldType.Query,
        name: 'movementToId',
        label: t('inventory.movements.labels.movementTo'),
        labelBy: getLabelByForModel(newMovementToModel),
        valueBy: 'id',
        query: getQueryForModel(newMovementToModel),
        dataKey: getDataKeyForModel(newMovementToModel),
        queryVariables: getFiltersForMovementToModel(),
        isEdge: true,
        multiple: false,
        filterable: true,
        formMapIdentifier: 'id',
      };
      form.movementToId = null;
    } else {
      movementToIdField.value = {
        type: FieldType.Choice,
        name: 'movementToId',
        label: t('inventory.movements.labels.movementTo'),
        options: [],
        labelBy: 'name',
        valueBy: 'id',
        disabled: true,
      };
      form.movementToId = null;
    }
  }
);

// Watcher for form.movementFromId
watch(
  () => form.movementFromId,
  (newMovementFromId, oldMovementFromId) => {
    if (movementToModel.value && newMovementFromId !== oldMovementFromId) {
      // Re-trigger the watcher on movementToModel
      movementToModel.value = movementToModel.value;
    }
  }
);


const handleUpdateErrors = (newErrors: Record<string, string>) => {
  errors.value = {}
  errors.value = newErrors;
};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'inventory.inventory.list' }, name: t('inventory.title') },
                   { path: { name: 'inventory.inventory.create' }, name: t('inventory.movements.create.title') }]" />
    </template>

   <template v-slot:content>

   <div class="space-y-10 divide-y divide-gray-900/10 mt-4">
    <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div class="px-4 py-6 sm:p-8">
          <div class="grid max-w grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
            <!-- Product Field -->
            <div v-if="productField && productField.type == FieldType.Query" class="col-span-full">
              <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ productField.label }}*</label>
              <div class="mt-2">
                <FieldQuery :field="productField as QueryFormField" :model-value="form.product.id" @update:modelValue="form.product.id = $event"/>
              </div>
              <div v-if="errors && errors['product']" class="text-danger text-small blink-animation ml-1 mb-1">
                <Icon size="sm" name="exclamation-circle" />
                <span class="ml-1">{{ errors['product'] }}</span>
              </div>
            </div>

            <!-- Quantity Field -->
            <div class="col-span-full">
              <label v-if="quantityField" class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ quantityField.label }}*</label>
              <div class="mt-2">
                <FieldValue v-if="quantityField" :field="quantityField" :model-value="form.quantity" @update:modelValue="form.quantity = $event"/>
              </div>
              <div v-if="errors && errors['quantity']" class="text-danger text-small blink-animation ml-1 mb-1">
                <Icon size="sm" name="exclamation-circle" />
                <span class="ml-1">{{ errors['quantity'] }}</span>
              </div>
            </div>

            <!-- Movement From Model Field -->
            <div class="col-span-full">
              <label v-if="movementFromField" class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ movementFromField.label }}*</label>
              <div class="mt-2">
                <FieldChoice v-if="movementFromField" :field="movementFromField" :model-value="movementFromModel" @update:modelValue="movementFromModel = $event"/>
              </div>
              <div v-if="errors && errors['movementFromModel']" class="text-danger text-small blink-animation ml-1 mb-1">
                <Icon size="sm" name="exclamation-circle" />
                <span class="ml-1">{{ errors['movementFromModel'] }}</span>
              </div>
            </div>

            <!-- Movement From ID Field -->
            <div class="col-span-full" v-if="movementFromIdField">
              <label class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ movementFromIdField.label }}*</label>
              <div class="mt-2">
                <FieldQuery v-if="movementFromIdField.type === FieldType.Query" :field="movementFromIdField" :model-value="form.movementFromId" @update:modelValue="form.movementFromId = $event" />
                <FieldChoice v-else :field="movementFromIdField" :model-value="form.movementFromId" @update:modelValue="form.movementFromId = $event" />
              </div>
              <div v-if="errors && errors['movementFromId']" class="text-danger text-small blink-animation ml-1 mb-1">
                <Icon size="sm" name="exclamation-circle" />
                <span class="ml-1">{{ errors['movementFromId'] }}</span>
              </div>
            </div>

            <!-- Movement To ID Field -->
            <div class="col-span-full" v-if="movementToIdField">
              <label v-if="movementToIdField" class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ movementToIdField.label }}*</label>
              <div class="mt-2">
                <FieldQuery v-if="movementToIdField.type === FieldType.Query" :field="movementToIdField" :model-value="form.movementToId" @update:modelValue="form.movementToId = $event" />
                <FieldChoice v-else :field="movementToIdField" :model-value="form.movementToId" @update:modelValue="form.movementToId = $event" />
              </div>
              <div v-if="errors && errors['movementToId']" class="text-danger text-small blink-animation ml-1 mb-1">
                <Icon size="sm" name="exclamation-circle" />
                <span class="ml-1">{{ errors['movementToId'] }}</span>
              </div>
            </div>

            <!-- Notes Field -->
            <div class="col-span-full">
              <label v-if="notesField" class="font-semibold block text-sm leading-6 text-gray-900 px-1">{{ notesField.label }}</label>
              <div class="mt-2">
                <FieldTextarea v-if="notesField" :field="notesField" :model-value="form.notes" @update:modelValue="form.notes = $event"/>
              </div>
              <div v-if="errors && errors['notes']" class="text-danger text-small blink-animation ml-1 mb-1">
                <Icon size="sm" name="exclamation-circle" />
                <span class="ml-1">{{ errors['notes'] }}</span>
              </div>
            </div>
          </div>
        </div>

        <SubmitButtons
            :form="form"
            :movement-from-model="movementFromModel"
            :movement-to-model="movementToModel"
            @update-errors="handleUpdateErrors"
        />
      </div>
    </div>
  </div>

   </template>
  </GeneralTemplate>
</template>