<script lang="ts" setup>
import { defineProps } from 'vue';
import { Button } from '../../../../atoms/button';
import { ApolloAlertMutation } from '../../../../molecules/apollo-alert-mutation';
import { Link } from '../../../../atoms/link';
import { Checkbox } from '../../../../atoms/checkbox';
import { useI18n } from 'vue-i18n';
import { getFieldComponent } from '../../../general-show/showConfig';
import { FieldType } from '../../../../../utils/constants';

const { t } = useI18n();

const props = defineProps<{
  item: any;
  config: any;
  selectedEntities: string[];
  queryObject: any;
  getUpdatedField: (field: any, item: any, index: number) => any;
  selectCheckbox: (id: string, value: boolean) => void;
}>();

</script>

<template>
  <tr>
    <td v-if="config.addBulkEdit || config.addBulkDelete"
        scope="col"
        :class="['px-4 text-left text-sm font-semibold text-gray-900',
                 selectedEntities.includes(item.node[config.identifierKey || 'id']) ? 'border-l-2 border-indigo-600' : '']">
      <Checkbox
        :modelValue="selectedEntities.includes(item.node[config.identifierKey || 'id'])"
        @update:model-value="value => selectCheckbox(item.node[config.identifierKey || 'id'], value)" />
    </td>
    <td v-for="(field, index) in config.fields" :key="field.name" class="whitespace-nowrap px-3 py-4 text-sm">
      <component
        v-if="field.type === FieldType.Text && field.addImage && field.imageField"
        :is="getFieldComponent(field.type)"
        :field="getUpdatedField(field, item, index)"
        :model-value="item.node[field.name]"
        :image-value="item.node[field.imageField]" />
      <component
        v-else
        :is="getFieldComponent(field.type)"
        :field="getUpdatedField(field, item, index)"
        :model-value="item.node[field.name]" />
    </td>
    <td v-if="config.addActions">
      <div class="flex gap-4 items-center justify-end">
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
