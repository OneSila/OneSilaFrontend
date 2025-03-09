<script setup lang="ts">

import {ref, onMounted, watch, Ref} from 'vue';
import {ProductPropertyValue} from "../../../../../configs";
import { FieldType, flagMapping, PropertyTypes } from "../../../../../../../../shared/utils/constants";
import {FieldQuery} from "../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query";
import {propertySelectValuesQuery} from "../../../../../../../../shared/api/queries/properties.js";
import {TextInput} from "../../../../../../../../shared/components/atoms/input-text";
import {TextEditor} from "../../../../../../../../shared/components/atoms/input-text-editor";
import {Toggle} from "../../../../../../../../shared/components/atoms/toggle";
import {DateInput} from "../../../../../../../../shared/components/atoms/input-date";
import DateTimeInput from "../../../../../../../../shared/components/atoms/input-date-time/DateTimeInput.vue";
import {QueryFormField} from "../../../../../../../../shared/components/organisms/general-form/formConfig";
import {useI18n} from "vue-i18n";
import apolloClient from "../../../../../../../../../apollo-client";
import {
  createProductPropertyMutation, createProductPropertyTextTranslationMutation,
  deleteProductPropertyMutation,
  updateProductPropertyMutation, updateProductPropertyTextTranslationMutation
} from "../../../../../../../../shared/api/mutations/properties.js";
import { format } from 'date-fns'
import {Toast} from "../../../../../../../../shared/modules/toast";
import {Icon} from "../../../../../../../../shared/components/atoms/icon";
import {Button} from "../../../../../../../../shared/components/atoms/button";
import {selectValueOnTheFlyConfig} from "../../../../../../../properties/property-select-values/configs";

const { t } = useI18n();


const props = defineProps<{ productId: string; value: ProductPropertyValue }>();
const emit = defineEmits(['refetch', 'update-id', 'remove']);

const field: Ref<QueryFormField| null> = ref(null);
const val: Ref<any> = ref(null);
const lastSavedVal: Ref<any> = ref(null);
const lastSavedLanguage: Ref<any> = ref(null);

const createInputData = () => {
  const inputData: any = {
    product: { id: props.productId },
    property: { id: props.value.property.id }
  };

  let newValue: any = null;
  switch (props.value.property.type) {
    case PropertyTypes.SELECT:
      inputData.valueSelect = { id: val.value };
      newValue = val.value;
      break;
    case PropertyTypes.MULTISELECT:
      inputData.valueMultiSelect = val.value.map(id => ({ id }));
      newValue = inputData.valueMultiSelect.length == 0 ? null : inputData.valueMultiSelect;
      break;
    case PropertyTypes.INT:
      inputData.valueInt = val.value;
      newValue = inputData.valueInt;
      break;
    case PropertyTypes.FLOAT:
      inputData.valueFloat = val.value;
      newValue = inputData.valueFloat;
      break;
    case PropertyTypes.BOOLEAN:
      inputData.valueBoolean = val.value;
      newValue = inputData.valueBoolean;
      break;
    case PropertyTypes.DATE:
      let date:any = format(new Date(val.value), 'yyyy-MM-dd');
      if (date == "1970-01-01") {
        date = null
      }
      inputData.valueDate = date;
      newValue = inputData.valueDate;
      break;
    case PropertyTypes.DATETIME:
      inputData.valueDatetime = val.value;
      newValue = inputData.valueDatetime;
      break;
    case PropertyTypes.TEXT:
      // we fake it soe it will not remove since for text we don't remove if we delete the
      // content since it can still be content in other language
      newValue = true;
      break;
    case PropertyTypes.DESCRIPTION:
      newValue = true;
      break;
  }

  if (newValue == null) {
    return null;
  }

  if ([PropertyTypes.INT, PropertyTypes.FLOAT].includes(props.value.property.type) && isNaN(newValue)) {
    return null;
  }

  return inputData;
};

const createTranslationInputData = (productPropertyId) => {
  const inputData: any = {
    productProperty: { id: productPropertyId },
    language: props.value.translation.language,
    valueText: props.value.property.type == PropertyTypes.TEXT ? val.value : null,
    valueDescription: props.value.property.type == PropertyTypes.DESCRIPTION ? val.value : null,
  };

  return inputData;
};

const createValue = async (inputData: any) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: createProductPropertyMutation,
      variables: { data: inputData },
    });
    emit('update-id', { oldId: props.value.property.id, newId: data.createProductProperty.id, isTranslation: false, value: null });
    Toast.success(t('properties.rule.alert.createProductProperty'))
    return data.createProductProperty.id;
  } catch (error) {
    console.error("Create value error:", error);
  }
  return null;
};

const updateValue = async (inputData: any) => {

  // for texts, we update the translations not the value itself
  if ([PropertyTypes.TEXT, PropertyTypes.DESCRIPTION].includes(props.value.property.type)) {
    return props.value.id;
  }

  try {
    const { data } = await  apolloClient.mutate({
      mutation: updateProductPropertyMutation,
      variables: { data: { id: props.value.id, ...inputData } },
    });
    Toast.success(t('properties.rule.alert.updateProductProperty'))
    return data.updateProductProperty.id;
  } catch (error) {
    console.error("Update value error:", error);
  }
  return null
};

const createTranslationValue = async (inputData: any) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: createProductPropertyTextTranslationMutation,
      variables: { data: inputData },
    });
    emit('update-id', { oldId: props.value.property.id, newId: data.createProductPropertyTextTranslation.id, isTranslation: true, value: inputData });
  } catch (error) {
    console.error("Create value error:", error);
  }
};

const updateTranslationValue = async (inputData: any) => {
  try {
    const { data } = await  apolloClient.mutate({
      mutation: updateProductPropertyTextTranslationMutation,
      variables: { data: { id: props.value.translation.id, ...inputData } },
    });
    Toast.success(t('properties.rule.alert.updateProductProperty'))
  } catch (error) {
    console.error("Update value error:", error);
  }
};

const saveChanges = async () => {
  const inputData = createInputData();

  if (inputData == null) {
    await removePropertyValue();
    return
  }

  let productPropertyId = null
  if (props.value.id) {
    productPropertyId = await updateValue(inputData);
  } else {
    productPropertyId = await createValue(inputData);
  }

  lastSavedVal.value = val.value;
  if (props.value.property.isProductType) {
    emit('refetch');
  }

  if ([PropertyTypes.TEXT, PropertyTypes.DESCRIPTION].includes(props.value.property.type)) {
    const translationInputData = createTranslationInputData(productPropertyId);

    if (props.value.translation.id) {
      await updateTranslationValue(translationInputData);
    } else {
      await createTranslationValue(translationInputData);
    }
  }

};


const setValues = () => {
  switch (props.value.property.type) {
      case PropertyTypes.MULTISELECT:
        if (props.value.valueMultiSelect) {
          val.value = props.value.valueMultiSelect.map(select => select.id);
        } else {
          val.value = null
        }
        break;
      case PropertyTypes.SELECT:
        val.value = props.value.valueSelect?.id || null
        break;
      case PropertyTypes.INT:
        val.value = props.value.valueInt;
        break;
      case PropertyTypes.FLOAT:
        val.value = props.value.valueFloat;
        break;
      case PropertyTypes.BOOLEAN:
        val.value = props.value.valueBoolean;
        break;
      case PropertyTypes.DATE:
        val.value = props.value.valueDate;
        break;
      case PropertyTypes.DATETIME:
        val.value = props.value.valueDateTime;
        break;
    }
  lastSavedVal.value = val.value;
}

const setTranslatedValues = () => {

  if (![PropertyTypes.TEXT, PropertyTypes.DESCRIPTION].includes(props.value.property.type)) {
    return;
  }

  // this is a little complicated because the value have a watch on all the values
  // before set it on a new language we also reset the id, reset the values -> set the values (if any) then set the language
  // all of that changes will trigger this method
  // so we only want to update when the language has changed and also the value has changed otherwise when we create we will
  // 1  save -> save will set an ID (to the translation so we will edit next time not create agasin) -> this method will get retriggered -> it will change the value
  // so that's why both the language and the value need to be changed in order to change it
  if (props.value.translation.language) {
      switch (props.value.property.type) {
      case PropertyTypes.TEXT:
        const newVal = props.value.translation?.valueText || null;
        if (lastSavedLanguage.value !== props.value.translation.language && val.value != newVal) {
          val.value = newVal;
        }
        break;
      case PropertyTypes.DESCRIPTION:
        const newValDescription = props.value.translation?.valueDescription || null;
        if (lastSavedLanguage.value !== props.value.translation.language && val.value != newValDescription) {
          val.value = newValDescription;
        }
        break;
    }
    lastSavedLanguage.value = props.value.translation.language;
    lastSavedVal.value = val.value;
  }
}

onMounted(async () => {
  if ([PropertyTypes.SELECT, PropertyTypes.MULTISELECT].includes(props.value.property.type)) {
    field.value = {
      type: FieldType.Query,
      name: 'propertySelectValue',
      labelBy: 'value',
      valueBy: 'id',
      query: propertySelectValuesQuery,
      queryVariables: { filter: { property: { id: { exact: props.value.property.id } } } },
      dataKey: 'propertySelectValues',
      isEdge: true,
      multiple: props.value.property.type === PropertyTypes.MULTISELECT,
      filterable: true,
      formMapIdentifier: 'id',
    };
  }

  if (field.value && props.value.property.type == PropertyTypes.SELECT) {
    field.value['createOnFlyConfig'] = selectValueOnTheFlyConfig(t, props.value.property.id)
  }

  setValues();

});

const removePropertyValue = async () => {

  if (props.value.id) {
    try {
      await apolloClient.mutate({
        mutation: deleteProductPropertyMutation,
        variables:  { id: props.value.id } ,
      });
    } catch (error) {
      console.error("Update value error:", error);
    }

    if (props.value.property.isProductType) {
      emit('refetch')
    }
  }

    emit('remove', props.value.property.id)
    Toast.success(t('properties.rule.alert.deleteProductProperty'))
    setValues();
    if ([PropertyTypes.TEXT, PropertyTypes.DESCRIPTION].includes(props.value.property.type)) {
      val.value = null;
      lastSavedVal.value = val.value;
    }
}

watch(props.value.translation, setTranslatedValues)

</script>

<template>
  <div>
    <div class="grid grid-cols-12 gap-4 items-center my-2 md:hidden">
      <div class="col-span-8">
      </div>
      <div class="col-span-2 text-end">
        <Button v-if="val !== lastSavedVal" @click="saveChanges" class="rounded-md px-2 py-1 text-sm text-white shadow-sm btn-primary">
          {{ t('shared.button.save') }}
        </Button>
      </div>
      <div class="col-span-2 text-end">
        <Button v-if="![PropertyTypes.TEXT, PropertyTypes.DESCRIPTION].includes(props.value.property.type)" class="btn btn-sm btn-outline-danger text-end" @click="removePropertyValue()">
          <Icon name="trash" />
        </Button>
      </div>
    </div>
    <div class="grid grid-cols-12 gap-4 items-center">
    <div class="col-span-1 text-end hidden md:block">
      <template v-if="[PropertyTypes.TEXT, PropertyTypes.DESCRIPTION].includes(value.property.type) && value.translation.language && flagMapping.hasOwnProperty(value.translation.language) && val == lastSavedVal">
        <span>{{ flagMapping[value.translation.language] }}</span>
      </template>
      <template v-else-if="val !== lastSavedVal">
        <Button @click="saveChanges" class="rounded-md px-2 py-1 text-sm text-white shadow-sm btn-primary">{{ t('shared.button.save') }}</Button>
      </template>
      <template v-else>
        <span></span>
      </template>
    </div>
    <div class="col-span-12 md:col-span-10">
      <FieldQuery
        v-if="value.property.type === PropertyTypes.SELECT && field !== null"
        :field="field"
        v-model="val"
      />
      <FieldQuery
        v-if="value.property.type === PropertyTypes.MULTISELECT && field !== null"
        :field="field"
        v-model="val"
        multiple
      />
      <TextInput
        v-if="value.property.type === PropertyTypes.INT"
        class="w-full"
        v-model="val"
        number
      />
      <TextInput
        v-if="value.property.type === PropertyTypes.FLOAT"
        class="w-full"
        v-model="val"
        float
      />
      <TextInput
        v-if="value.property.type === PropertyTypes.TEXT"
        class="w-full"
        v-model="val"
      />
      <TextEditor
        v-if="value.property.type === PropertyTypes.DESCRIPTION"
        v-model="val"
        class="h-32"
      />
      <Toggle v-if="value.property.type === PropertyTypes.BOOLEAN" v-model="val" />
      <DateInput v-if="value.property.type === PropertyTypes.DATE" v-model="val" />
      <DateTimeInput v-if="value.property.type === PropertyTypes.DATETIME" v-model="val" />
    </div>
    <div class="col-span-1 hidden md:block">
      <Button class="btn btn-sm btn-outline-danger" @click="removePropertyValue()">
        <Icon name="trash" />
      </Button>
    </div>
  </div>
  </div>
</template>
