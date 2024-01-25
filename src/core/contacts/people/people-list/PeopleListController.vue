<script setup lang="ts">

import { watchEffect, ref} from 'vue'
import { peopleQuery } from "../../../../shared/api/queries/companies.js";
import { deletePersonMutation } from "../../../../shared/api/mutations/contacts.js"
import { OrderType, SearchConfig} from "../../../../shared/components/organisms/general-search/searchConfig";
import { useI18n } from 'vue-i18n';
import { FilterManager } from "../../../../shared/components/molecules/filter-manager";
import { ApolloAlertMutation } from "../../../../shared/components/molecules/apollo-alert-mutation";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Pagination } from "../../../../shared/components/molecules/pagination";
import { Button } from "../../../../shared/components/atoms/button";
import PeopleListTemplate  from "./PeopleListTemplate.vue"
import IconUserPlus from "../../../../shared/components/atoms/icons/icon-user-plus.vue";
import {setCompanyToUser} from "../../../../shared/modules/auth";

const { t } = useI18n();
const searchConfig: SearchConfig = {
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
};

const orderVariablesRef = ref();
const paginationRef = ref();
const refetchQueries = ref();
const getRefetchQueries = (orderVars, paginationData) => {

  if (orderVars && paginationData) {

    return [
      {
        query: peopleQuery,
        variables: {
          order: orderVars,
          first: paginationData.first,
          last: paginationData.last,
          before: paginationData.before,
          after: paginationData.after
        }
      }
    ];

  }

  return [];
};

const updateRefs = (orderVars, paginationData) => {
  orderVariablesRef.value = orderVars;
  paginationRef.value = paginationData;
  refetchQueries.value = getRefetchQueries(orderVariablesRef.value, paginationRef.value);
  return true;
}

</script>

<template>
  <PeopleListTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'people.list' }, name: 'People' }]" />
    </template>

    <template v-slot:buttons>
            <div>
          <button type="button" class="btn btn-primary">
              <icon-user-plus class="ltr:mr-2 rtl:ml-2" />
              Add Contact
          </button>
      </div>
    </template>


   <template v-slot:content>
      <FilterManager :searchConfig="searchConfig">
      <template v-slot:variables="{ filterVariables, orderVariables, pagination }">
        <ApolloQuery :query="peopleQuery"
                     :variables="{ order: orderVariables,
                                  first: pagination.first,
                                  last: pagination.last,
                                  before: pagination.before,
                                  after: pagination.after }">
          <template v-slot="{ result: { loading, error, data }, query }">
            <div class="mt-5 panel p-0 border-0 overflow-hidden" v-if="data && updateRefs(orderVariables, pagination)">
              <div class="table-responsive">
                <table class="table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Company</th>
                      <th>Language</th>
                      <th class="!text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="person in data.people.edges" :key="person.node.id">
                      <td>{{ person.node.firstName }} {{ person.node.lastName }}</td>
                      <td>{{ person.node.email }}</td>
                      <td>{{ person.node.phone }}</td>
                      <td>{{ person.node.company.name }}</td>
                      <td>
                        <img class="w-5 h-5 object-cover rounded-full" :src="`/src/assets/images/flags/${person.node.language.toUpperCase()}.svg`" alt="" />
                      </td>
                      <td>
                        <div class="flex gap-4 items-center justify-center">
                          <button type="button" class="btn btn-sm btn-outline-primary" @click="editUser(contact)">Edit</button>
                            <ApolloAlertMutation
                                :mutation="deletePersonMutation"
                                :mutation-variables="{ id:  person.node.id }"
                                :refetch-queries="refetchQueries">
                              <template v-slot="{ loading, confirmAndMutate }">
                                <Button class="btn btn-sm btn-outline-danger" :disabled="loading" @click="confirmAndMutate">
                                  Delete
                                </Button>
                              </template>
                            </ApolloAlertMutation>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="py-2 px-2">
                <Pagination :pageInfo="data.people.pageInfo" :use-icons="true" :button-class="'default'" :alignment="'center'"  />
              </div>
            </div>

            <div v-if="loading">Loading...</div>
            <div v-else-if="error">An error occurred</div>

          </template>
        </ApolloQuery>
      </template>
    </FilterManager>
   </template>
  </PeopleListTemplate>
</template>