<script lang="ts" setup>
import { defineProps, ref } from 'vue';
import { Button } from '././../../atoms/button';
import { ApolloAlertMutation } from '././../../molecules/apollo-alert-mutation';
import { ListingConfig, FieldType, accessNestedProperty } from './listingConfig';
import { Pagination } from "../../molecules/pagination";
import { Image } from "../../atoms/image";
import { Link } from "../../atoms/link";
import { useI18n } from "vue-i18n";
import { Icon } from "../../atoms/icon";

const { t } = useI18n();
const props = defineProps<{ config: ListingConfig, query: any; queryKey: any; filterVariables: any; orderVariables: any; pagination: any; }>();

const filterVariablesRef = ref();
const orderVariablesRef = ref();
const paginationRef = ref();
const refetchQueries = ref();

const getRefetchQueries = (filterVars, orderVars, paginationData) => {

    return [
      {
        query: props.query,
        variables: {
          filter: filterVars,
          order: orderVars,
          first: paginationData?.first,
          last: paginationData?.last,
          before: paginationData?.before,
          after: paginationData?.after
        }
      }
    ];

};

const updateRefs = (filterVariables, orderVars, paginationData) => {
  orderVariablesRef.value = orderVars;
  paginationRef.value = paginationData;
  filterVariablesRef.value = filterVariables;
  refetchQueries.value = getRefetchQueries(filterVariablesRef.value, orderVariablesRef.value, paginationRef.value);
  return true;
}

</script>

<template>

<ApolloQuery :query="query"
             :variables="{filters: filterVariables,
                                order: orderVariables,
                                first: pagination.first,
                                last: pagination.last,
                                before: pagination.before,
                                after: pagination.after }">
  <template v-slot="{ result: { loading, error, data }, query }">
    <div v-if="data && updateRefs(filterVariables, orderVariables, pagination)" class="mt-5 panel p-0 border-0 overflow-hidden">
      <div class="table-responsive">
        <table class="table-striped table-hover">
          <thead>
          <tr>
            <th v-for="header in config.headers" :key="header">{{ header }}</th>
            <th v-if="config.addActions" class="!text-center">Actions</th>
          </tr>
          </thead>
          <tbody>

          <tr v-for="item in data[queryKey].edges" :key="item.id">
            <td v-for="field in config.fields" :key="field.name">
              <template v-if="field.type === FieldType.Text">
                {{ item.node[field.name] }}
              </template>
              <template v-else-if="field.type === FieldType.Image">
                <Image :source="`${field.basePath}/${item.node[field.name]}${field.suffix || ''}`" :alt="field.alt" class="w-5 h-5 object-cover rounded-full" />
              </template>
              <template v-else-if="field.type === FieldType.NestedText">
                {{ accessNestedProperty(item.node, field.keys) }}
              </template>
              <template v-else-if="field.type === FieldType.Boolean">
                    <Icon v-if="item.node[field.name]" name="check-circle" class="ml-2 text-green-500" />
                    <Icon v-else name="times-circle" class="ml-2 text-red-500" />
              </template>
            </td>
            <td v-if="config.addActions">
              <div class="flex gap-4 items-center justify-center">
                <Link v-if="config.addShow" :path="{ name: config.showUrlName, params: { ...config.identifierVariables, id: item.node[config.identifierKey] }}">
                  <Button class="btn btn-sm btn-outline-secondary">{{ t('shared.button.show') }}</Button>
                </Link>
                <Link v-if="config.addEdit" :path="{ name: config.editUrlName, params: { ...config.identifierVariables, id: item.node[config.identifierKey] }}">
                  <Button class="btn btn-sm btn-outline-primary">{{ t('shared.button.edit') }}</Button>
                </Link>
                <ApolloAlertMutation
                    v-if="config.addDelete"
                    :mutation="config.deleteMutation"
                    :mutation-variables="{id: item.node[config.identifierKey]}"
                    :refetch-queries="refetchQueries">
                  <template v-slot="{ loading, confirmAndMutate }">
                    <Button :disabled="loading" class="btn btn-sm btn-outline-danger" @click="confirmAndMutate">
                      {{ t('shared.button.delete') }}
                    </Button>
                  </template>
                </ApolloAlertMutation>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <div v-if="config.addPagination" class="py-2 px-2">
        <Pagination :alignment="config.paginationConfig?.alignment"
                    :button-class="config.paginationConfig?.buttonClass"
                    :page-info="data[queryKey].pageInfo"
                    :use-icons="config.paginationConfig?.useIcons"/>
      </div>
    </div>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error">An error occurred</div>

  </template>
</ApolloQuery>

</template>
