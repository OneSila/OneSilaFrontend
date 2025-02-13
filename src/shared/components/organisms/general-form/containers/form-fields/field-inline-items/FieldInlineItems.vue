<script setup lang="ts">
import {defineEmits, defineProps, onMounted, ref, watch} from "vue";
import { Toast } from "../../../../../../modules/toast";
import { Loader } from "../../../../../atoms/loader";
import { Icon } from "../../../../../atoms/icon";
import { Button } from "../../../../../atoms/button";
import { Checkbox } from "../../../../../atoms/checkbox";
import { FormType, InlineItemsFormField } from "../../../formConfig";
import { getFieldComponent, cleanUpDataForMutation } from "../../../../general-form/formConfig";
import { FieldType} from "../../../../../../utils/constants";
import apolloClient from "../../../../../../../../apollo-client";
import { useI18n } from "vue-i18n";
import {useRoute} from "vue-router";
import Swal, {SweetAlertOptions} from "sweetalert2";
import {processGraphQLErrors} from "../../../../../../utils";

const props = defineProps<{
  field: InlineItemsFormField;
  modelValue: any[];
}>();

const { t } = useI18n();
const emit = defineEmits(["update:modelValue"]);

const route = useRoute();
const rows = ref<any[]>([]);
const selectedRows = ref<boolean[]>([]); // Tracks checkbox selection
const loading = ref(false);
const saving = ref(false);

const isCreateMode = props.field.mode === FormType.CREATE;
const isEditMode = props.field.mode === FormType.EDIT;

const mainInstanceId = ref<null | string>(null);
if (isEditMode) {
  mainInstanceId.value = String(route.params.id);
}

// Keep a copy of the original rows for comparison
const originalRows = ref<any[]>([]);

// Update modelValue whenever rows changes deeply
watch(
  rows,
  (newRows) => {
    emit("update:modelValue", newRows);
  },
  { deep: true }
);

// Check if a given row is dirty by comparing it with the corresponding original row
const isRowDirty = (rowIndex: number) => {

  // this should only show on edit
  if (isCreateMode) {
    return false;
  }
  const current = rows.value[rowIndex];
  const original = originalRows.value[rowIndex];

  if (current._saveError) return true;

  for (const fieldItem of props.field.fields) {
    const currentVal = current[fieldItem.name];
    const originalVal = original[fieldItem.name];

    if (typeof currentVal === 'object' && currentVal !== null && typeof originalVal === 'object' && originalVal !== null) {
      if (JSON.stringify(currentVal) !== JSON.stringify(originalVal)) {
        return true;
      }
    } else {
      if (currentVal !== originalVal) {
        return true;
      }
    }
  }

  return false;
};

// Fetch data in edit mode
const fetchData = async () => {
  if (!isEditMode || !props.field.query) return;

  try {
    loading.value = true;
    const defaultVariables = {
      filter: {
        [props.field.valueKey]: { id: { exact: mainInstanceId.value } }
      }
    };

    const variables = {
      ...defaultVariables,
      ...(props.field.queryVariables || {})
    };

    const { data } = await apolloClient.query({
      query: props.field.query,
      variables,
      fetchPolicy: "network-only",
    });

    const rawData = props.field.isEdge
      ? data[props.field.dataKey]?.edges.map((edge: any) => edge.node)
      : data[props.field.dataKey];

    rows.value = rawData.map((item: any) => {
      const row = props.field.fields.reduce((acc: any, field) => {
        acc[field.name] = item[field.name] ?? null;
        return acc;
      }, {});
      row.id = item.id || null;
      return row;
    });

    // Make a deep copy of rows to track original values
    originalRows.value = JSON.parse(JSON.stringify(rows.value));

    selectedRows.value = new Array(rows.value.length).fill(false);
  } catch (error) {
    console.error("Error fetching inline items:", error);
  } finally {
    loading.value = false;
  }
};

// Add a new row
const addRow = () => {
  const newRow = props.field.fields.reduce((row, field) => {
    row[field.name] = field.default || null;
    return row;
  }, {});

  rows.value.push(newRow);
  originalRows.value.push(JSON.parse(JSON.stringify(newRow))); // initial original state = current state
  selectedRows.value.push(false);
};

const deselectAll = () => {
  selectedRows.value = selectedRows.value.map(() => false);
};

// Show a confirmation alert before deletion
const triggerDeleteAlert = async () => {
  const defaultSwalOptions = {
    title: t('shared.alert.mutationAlert.title'),
    text: t('shared.alert.mutationAlert.text'),
    confirmButtonText: t('shared.alert.mutationAlert.confirmButtonText'),
    cancelButtonText: t('shared.alert.mutationAlert.cancelButtonText'),
    icon: 'warning',
    showCancelButton: true,
    reverseButtons: true,
    padding: '2em'
  };

  const defaultSwalClasses = {
    popup: 'sweet-alerts',
    confirmButton: 'btn btn-secondary',
    cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3'
  };

  const swalWithBootstrapButtons = Swal.mixin({
    customClass: defaultSwalClasses,
    buttonsStyling: false
  });

  const result = await swalWithBootstrapButtons.fire(defaultSwalOptions as SweetAlertOptions);
  return result.isConfirmed;
};

// Bulk delete (or single if index is provided)
const bulkDelete = async (index: null | number = null) => {
  const acceptedAlert = await triggerDeleteAlert();
  if (!acceptedAlert) {
    deselectAll();
    return;
  }

  let rowsToDelete: any[] = [];
  if (index !== null) {
    if (rows.value[index]) {
      rowsToDelete.push(rows.value[index]);
    }
  } else {
    for (let i = 0; i < selectedRows.value.length; i++) {
      if (selectedRows.value[i] && rows.value[i]) {
        rowsToDelete.push(rows.value[i]);
      }
    }
  }

  if (!rowsToDelete.length) return;

  const deleteObjects = rowsToDelete
    .filter((row) => row.id)
    .map((row) => ({ id: row.id }));

  try {
    if (deleteObjects.length > 0 && props.field.deleteMutation) {
      await apolloClient.mutate({
        mutation: props.field.deleteMutation,
        variables: { data: deleteObjects },
      });
      Toast.success("Selected rows deleted successfully!");
    }

    // Remove deleted rows locally
    rows.value = rows.value.filter((row) => !rowsToDelete.includes(row));
    originalRows.value = originalRows.value.filter((original) => !rowsToDelete.some(r => r.id === original.id));
    selectedRows.value = new Array(rows.value.length).fill(false);
  } catch (error) {
    console.error("Error deleting rows:", error);
    Toast.error("Failed to delete selected rows.");
  } finally {
    deselectAll();
    saving.value = false;
  }
};

// Handle row save (create or edit)
const saveRow = async (rowIndex: number) => {
  const row = rows.value[rowIndex];
  delete rows.value[rowIndex]._saveError;
  const field = props.field;
  const formData = cleanUpDataForMutation(row, field.fields, row.id ? FormType.EDIT : FormType.CREATE);

  // If it's a new row (no id) - use create mutation
  if (!row.id && field.createMutation) {
    // For create, we need to attach the parent ID if required
    // Assuming we have mainInstanceId that we must link via field.valueKey
    formData[field.valueKey] = {id: mainInstanceId.value};

    // Create accepts an array or single object depending on your schema
    try {
      const { data } = await apolloClient.mutate({
        mutation: field.createMutation,
        variables: { data: [formData] }, // If bulk create is needed, else just formData if single
      });

      // Assuming the create mutation returns the created object with an id
      if (data && data[field.createMutationKey] && data[field.createMutationKey].length) {
        const createdItem = data[field.createMutationKey][0];
        row.id = createdItem.id;
        Toast.success("Row created successfully!");
      }

    } catch (error) {
      console.error("Error creating row:", error);
      handleError(error);
      row._saveError = true;
      return;
    }
  }
  // If the row exists (has an id) - use edit mutation
  else if (row.id && field.editMutation) {
    formData.id = row.id;
    try {
      const { data } = await apolloClient.mutate({
        mutation: field.editMutation,
        variables: { data: formData },
      });

      if (data && data[field.editMutationKey]) {
        Toast.success("Row updated successfully!");
      }
    } catch (error) {
      console.error("Error updating row:", error);
      handleError(error);
      row._saveError = true;
      return;
    }
  }

  originalRows.value[rowIndex] = JSON.parse(JSON.stringify(rows.value[rowIndex]));
  delete rows.value[rowIndex]._saveError;
};

const handleError = (errors) => {
  const validationErrors = processGraphQLErrors(errors, t);
  if (validationErrors['__all__']) {
    Toast.error(validationErrors['__all__']);
  }
}

onMounted(() => {
  if (isEditMode) {
    fetchData();
  } else if (isCreateMode) {
    addRow();
  }
});
</script>

<template>
  <div>
    <!-- Bulk Delete Button -->
    <Flex v-if="field.allowDelete && selectedRows.includes(true)" class="mb-2" between>
      <FlexCell grow></FlexCell>
      <FlexCell>
        <Button class="btn btn-danger" @click="bulkDelete()">
          {{ t("shared.button.delete") }}
        </Button>
      </FlexCell>
    </Flex>

<table class="table-striped table-hover">
  <thead>
    <tr>
      <th v-if="field.allowDelete">
        <Checkbox
          :modelValue="selectedRows.every(Boolean) && rows.length > 0"
          @update:modelValue="(value) => selectedRows.fill(value)"
        />
      </th>
        <th v-for="f in field.fields" :key="f.name">
          {{ f.label }}
        </th>
      <th class="action-col" v-if="field.allowDelete || true"></th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
      <!-- Bulk Delete Checkbox -->
      <td v-if="field.allowDelete">
        <Checkbox v-model="selectedRows[rowIndex]" />
      </td>

      <!-- Dynamic Fields Rendering -->
      <td class="td-max-width" v-for="fieldItem in field.fields" :key="fieldItem.name">
        <div v-if="fieldItem.type !== FieldType.Hidden" class="col-span-full td-scrollable">
          <Flex>
            <!-- Checkbox Field -->
            <FlexCell v-if="fieldItem.type === FieldType.Checkbox" class="ml-2" center>
              <component
                v-model="row[fieldItem.name]"
                :is="getFieldComponent(fieldItem.type)"
                :field="fieldItem"
              />
            </FlexCell>
          </Flex>

          <!-- Other Fields -->
          <div v-if="fieldItem.type !== FieldType.Checkbox" class="mt-2">
            <component
              v-model="row[fieldItem.name]"
              :is="getFieldComponent(fieldItem.type)"
              :field="fieldItem"
            />
          </div>
        </div>
      </td>

      <!-- Action Buttons Column -->
      <td class="action-col">
        <Flex end gap="2">
          <FlexCell>
            <!-- Show save button only if row is dirty -->
            <Button
              v-if="isRowDirty(rowIndex)"
              class="btn btn-sm btn-outline-primary"
              @click="saveRow(rowIndex)"
            >
              <Icon name="floppy-disk" />
            </Button>
          </FlexCell>
          <FlexCell v-if="field.allowDelete">
            <Button class="btn btn-sm btn-outline-danger" @click="bulkDelete(rowIndex)">
              <Icon name="trash" />
            </Button>
          </FlexCell>
        </Flex>
      </td>
    </tr>
  </tbody>
</table>

    <!-- Add Row Button -->
    <div v-if="field.allowAdd" class="mt-2">
      <Button @click="addRow" class="btn btn-outline-primary">
        <Icon name="plus" />
      </Button>
    </div>
  </div>
</template>

<style>
.table-striped th,
.table-striped td {
  padding: 8px;
  text-align: left;
}

/* For columns with variable short content */
.shrink-col {
  max-width: 80px;  /* Adjust as needed */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Limit normal columns */
.td-max-width {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Scrollable container for content that overflows */
.td-scrollable {
  max-width: 200px;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

.td-scrollable::-webkit-scrollbar {
  height: 6px;
}

.td-scrollable::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.td-scrollable::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.td-scrollable::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Narrow action column */
.action-col {
  width: 80px;
  min-width: 80px;
  max-width: 80px;
  white-space: nowrap;
  text-align: center;
  padding: 4px;
}

</style>