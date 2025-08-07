<script lang="ts" setup>
import {defineProps, defineSlots, computed} from 'vue';
import {Button} from '../../../../atoms/button';
import {ApolloAlertMutation} from '../../../../molecules/apollo-alert-mutation';
import {Link} from '../../../../atoms/link';
import {Icon} from '../../../../atoms/icon';
import {Image} from '../../../../atoms/image';
import {Checkbox} from '../../../../atoms/checkbox';
import {useI18n} from 'vue-i18n';
import {getFieldComponent, accessNestedProperty} from '../../../general-show/showConfig';
import {FieldType} from '../../../../../utils/constants';

const {t} = useI18n();

const props = defineProps<{
  item: any;
  config: any;
  haveBulk: any;
  selectedEntities: string[];
  selectCheckbox: (id: string, value: boolean) => void;
  queryObject: any;
}>();

const slots = defineSlots<{
  additionalButtons?: (scope: { item: any }) => any;
}>();

// Compute the image field from the item's fields (internal to this component)
const imageField = computed(() => {
  for (const field of props.config.fields) {
    if (field.type === FieldType.Text && field.addImage && field.imageField) {
      const imageValue = field.imageField.includes('.') ? accessNestedProperty(props.item.node, field.imageField.split('.')) : props.item.node[field.imageField];
      if (imageValue) {
        const modelValue = getModelValue(field, props.item);
        return {
          imageValue,
          modelValue,
          clickable: props.config.addShow
        };
      }
    }
  }
  return null;
});

// Local getShowRoute for grid view.
const getShowRoute = (item: any) => {
  if (!props.config.identifierKey) return undefined;
  const params = {
    ...props.config.identifierVariables,
    [props.config.paramIdentifier || 'id']: item.node[props.config.identifierKey]
  };
  return {
    name: props.config.showUrlName,
    params,
    query: {...props.config.urlQueryParams}
  };
};

// Local getUpdatedField for grid view.
const getUpdatedField = (field: any, item: any, index: number) => {
  if (index === 0 && props.config.addShow) {
    return {
      ...field,
      clickable: true,
      clickUrl: getShowRoute(item)
    };
  }
  return field;
};

const getModelValue = (field: any, item: any) => {
  if (typeof field.accessor === 'function') {
    return field.accessor(item.node);
  }
  if (field.name && field.name.includes('.')) {
    return accessNestedProperty(item.node, field.name.split('.'));
  }
  return item.node[field.name];
};

</script>

<template>
  <div class="card bg-white rounded-xl shadow-md overflow-hidden relative"
       :class="['px-4 text-left text-sm font-semibold text-gray-900', selectedEntities.includes(item.node[config.identifierKey || 'id']) ? 'border-2 border-indigo-600' : '']">
    <!-- Checkbox overlay in top-left corner -->
    <div v-if="haveBulk" class="absolute top-2 left-2 z-10">
      <Checkbox
          :modelValue="selectedEntities.includes(item.node[config.identifierKey || 'id'])"
          @update:model-value="value => selectCheckbox(item.node[config.identifierKey || 'id'], value)"/>
    </div>
    <div class="p-4">
      <!-- Image Section -->
      <div class="mb-4">
        <div v-if="imageField">
          <div class="flex justify-center items-center">
            <template v-if="imageField.clickable">
              <Link :path="getShowRoute(item)">
                <Image :source="imageField.imageValue" :alt="String(imageField.modelValue)"
                       class="h-48 w-auto rounded-md justify-center"/>
              </Link>
            </template>
            <template v-else>
              <Image :source="imageField.imageValue" :alt="String(imageField.modelValue)"
                     class="h-48 w-auto rounded-md justify-center" />
            </template>
          </div>
        </div>
        <div v-else>
          <div class="flex justify-center items-center h-48 bg-gray-200">
            <template v-if="config.defaultGridIcon">
              <Icon :name="config.defaultGridIcon" size="2xl" class="text-gray-600"/>
            </template>
          </div>
        </div>
      </div>
      <!-- Details: a simple 2-column table (Label/Value) -->
      <table class="w-full text-sm">
        <tbody>
        <tr v-for="(field, index) in config.fields" :key="field.name" class="border-b py-2">
          <td class="font-semibold pr-2 py-1">{{ config.headers[index] }}</td>
          <td>
            <component :is="getFieldComponent(field.type)"
                       :field="getUpdatedField(field, item, index)"
                       :model-value="getModelValue(field, item)"
                       :hide-image="true"/>
          </td>
        </tr>
        </tbody>
      </table>
      <!-- Actions -->
      <div v-if="config.addActions" class="flex gap-4 justify-end mt-2">
        <slot name="additionalButtons" :item="item" />
        <Link v-if="config.addEdit"
              :path="{ name: config.editUrlName,
                       params: config.identifierKey !== undefined ? { ...config.identifierVariables, id: item.node[config.identifierKey] } : undefined,
                       query: { ...config.urlQueryParams } }">
          <a class="text-indigo-600 hover:text-indigo-900">{{ t('shared.button.edit') }}</a>
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
      </div>
  </div>
</template>
