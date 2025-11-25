<script lang="ts" setup>
import { defineProps, defineSlots } from 'vue';
import { Button } from '../../../../atoms/button';
import { ApolloAlertMutation } from '../../../../molecules/apollo-alert-mutation';
import { Link } from '../../../../atoms/link';
import { Checkbox } from '../../../../atoms/checkbox';
import { useI18n } from 'vue-i18n';
import { getFieldComponent, accessNestedProperty } from '../../../general-show/showConfig';
import { FieldType } from '../../../../../utils/constants';

const { t } = useI18n();

const props = defineProps<{
  item: any;
  config: any;
  selectedEntities: string[];
  queryObject: any;
  haveBulk: any;
  getUpdatedField: (field: any, item: any, index: number) => any;
  selectCheckbox: (id: string, value: boolean) => void;
}>();

const slots = defineSlots<{
  additionalButtons?: (scope: { item: any }) => any;
}>();

const getModelValue = (field: any, item: any) => {
  if (typeof field.accessor === 'function') {
    return field.accessor(item.node);
  }
  if (field.name && field.name.includes('.')) {
    return accessNestedProperty(item.node, field.name.split('.'));
  }
  return item.node[field.name];
};

const getImageValue = (field: any, item: any) => {
  if (field.imageField && field.imageField.includes('.')) {
    return accessNestedProperty(item.node, field.imageField.split('.'));
  }
  return item.node[field.imageField];
};

</script>

<template>
  <tr>
    <td v-if="haveBulk"
        scope="col"
        :class="['px-4 text-left text-sm font-semibold text-gray-900',
                 selectedEntities.includes(String(item.node[config.identifierKey || 'id'])) ? 'border-l-2 border-indigo-600' : '']">
      <Checkbox
        :modelValue="selectedEntities.includes(String(item.node[config.identifierKey || 'id']))"
        @update:model-value="value => selectCheckbox(item.node[config.identifierKey || 'id'], value)" />
    </td>
    <td v-for="(field, index) in config.fields" :key="field.name + '-' + index" class="whitespace-nowrap px-3 py-4 text-sm">
      <component
        v-if="field.type === FieldType.Text && field.addImage && field.imageField"
        :is="getFieldComponent(field.type)"
        :field="getUpdatedField(field, item, index)"
        :model-value="getModelValue(field, item)"
        :image-value="getImageValue(field, item)" />
      <component
        v-else
        :is="getFieldComponent(field.type)"
        :field="getUpdatedField(field, item, index)"
        :model-value="getModelValue(field, item)" />
    </td>
    <td v-if="config.addActions">
      <div class="flex gap-4 items-center justify-end">
        <slot name="additionalButtons" :item="item" />
        <Link
          v-if="config.addEdit"
          :path="{ name: config.editUrlName,
                   params: config.identifierKey !== undefined ? { ...config.identifierVariables, id: item.node[config.identifierKey] } : undefined,
                   query: { ...config.urlQueryParams } }">
          <Button class="text-indigo-600 hover:text-indigo-900">{{ t('shared.button.edit') }}</Button>
        </Link>
        <ApolloAlertMutation
          v-if="config.addDelete && config.deleteMutation"
          :mutation="config.deleteMutation"
          :mutation-variables="config.deleteIdentifierKey ? { id: item.node[config.deleteIdentifierKey] } : (config.identifierKey ? { id: item.node[config.identifierKey] } : undefined)"
          :refetch-queries="() => [{
             query: queryObject.query,
             variables: {
               filter: queryObject.filter,
               order: queryObject.order,
               first: queryObject.pagination.first,
               last: queryObject.pagination.last,
               before: queryObject.pagination.before,
               after: queryObject.pagination.after
             }
          }]">
          <template #default="{ loading, confirmAndMutate }">
            <Button :disabled="loading" class="text-red-600 hover:text-red-600" @click="confirmAndMutate">
              {{ t('shared.button.delete') }}
            </Button>
          </template>
        </ApolloAlertMutation>
      </div>
    </td>
  </tr>
</template>
