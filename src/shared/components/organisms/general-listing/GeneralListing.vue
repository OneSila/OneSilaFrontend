<script lang="ts" setup>

import { Button } from '././../../atoms/button';
import { ApolloAlertMutation } from '././../../molecules/apollo-alert-mutation';
import { ListingConfig } from './listingConfig';
import { Pagination } from "../../molecules/pagination";
import { Link } from "../../atoms/link";
import { useI18n } from "vue-i18n";
import { SearchConfig } from "../general-search/searchConfig";
import {FilterManager} from "../../molecules/filter-manager";
import {getFieldComponent} from "../general-show/showConfig";

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    searchConfig: SearchConfig;
    config: ListingConfig;
    query: any;
    queryKey: any;
    fixedFilterVariables?: any;
    fixedOrderVariables?: any;
  }>(),
  {
    fixedFilterVariables: null,
    fixedOrderVariables: null
  }
);

const getShowRoute = (item) => {

  if (props.config.identifierKey === undefined) {
    return undefined;
  }

  const params = {
    ...props.config.identifierVariables,
    [props.config.paramIdentifier || 'id']: item.node[props.config.identifierKey]
  };

  return {
    name: props.config.showUrlName,
    params,
    query: { ...props.config.urlQueryParams }
  };
};

const getUpdatedField = (field, item, index) => {
      if (index === 0 && props.config.addShow) {
        return {
          ...field,
          clickable: true,
          clickUrl: getShowRoute(item),
        };
      }
      return field;
}
</script>

<template>

<FilterManager :searchConfig="searchConfig">
  <template v-slot:variables="{ filterVariables, orderVariables, pagination }">
    <ApolloQuery :query="query"
                 :variables="{filter: fixedFilterVariables !== null ? { ...filterVariables, ...fixedFilterVariables } : filterVariables,
                              order: fixedOrderVariables !== null ? { ...orderVariables, ...fixedOrderVariables } : orderVariables,
                              first: pagination.first,
                              last: pagination.last,
                              before: pagination.before,
                              after: pagination.after }">
      <template v-slot="{ result: { loading, error, data }, query }">
        <div v-if="data" class="mt-5 panel p-0 border-0 overflow-hidden">
          <div class="table-responsive">
            <table class="table-striped table-hover">
              <thead>
              <tr>
                <th v-for="header in config.headers" :key="header">{{ header }}</th>
                <th v-if="config.addActions" class="!text-end">{{ t('shared.labels.actions')}}</th>
              </tr>
              </thead>
              <tbody>

              <tr v-for="item in data[queryKey].edges" :key="item.node.id">
                <td v-for="(field, index) in config.fields" :key="field.name">
                    <component
                      :is="getFieldComponent(field.type)"
                      :field="getUpdatedField(field, item, index)"
                      :model-value="item.node[field.name]"
                    />
                </td>
                <td v-if="config.addActions">
                  <div class="flex gap-4 items-center justify-end">
                    <Link v-if="config.addEdit"
                          :path="{ name: config.editUrlName,
                                   params: config.identifierKey !== undefined ? { ...config.identifierVariables, id: item.node[config.identifierKey] } : undefined,
                                   query: {...config.urlQueryParams}}">
                      <Button class="btn btn-sm btn-outline-primary">{{ t('shared.button.edit') }}</Button>
                    </Link>
                    <ApolloAlertMutation
                        v-if="config.addDelete && config.deleteMutation"
                        :mutation="config.deleteMutation"
                        :mutation-variables="config.identifierKey !== undefined ? { id: item.node[config.identifierKey] } : undefined"
                        :refetch-queries="() => [{
                         query: props.query,
                         variables: {
                           filter: fixedFilterVariables !== null ? { ...filterVariables, ...fixedFilterVariables } : filterVariables,
                           order: fixedOrderVariables !== null ? { ...orderVariables, ...fixedOrderVariables } : orderVariables,
                           first: pagination.first,
                           last: pagination.last,
                           before: pagination.before,
                           after: pagination.after
                         }
                       }]">
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
      </template>
    </ApolloQuery>

  </template>
</FilterManager>

</template>
