<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQuery, useResult } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { useSafeRequest } from '../../../shared/modules/network'; // Adjust the path if necessary

// GraphQL query defined with gql
const COMPANIES_QUERY = gql`
query Companies {
  companies {
    edges {
      node {
        id
        name
      }
    }
  }
}`;

// Use the useSafeRequest composition function
const errors = ref([]);
const safeRequest = useSafeRequest(errors);

// Apollo query
const { result, loading, error, refetch } = useQuery(COMPANIES_QUERY);

// Refetch the query on component mount
safeRequest(refetch);

// Use result composable to get a reactive result of the query
const companies = useResult(result, null, data => data.companies.edges);

// Watch for errors
watch(error, (errorValue) => {
  if (errorValue) {
    errors.value.push(errorValue);
  }
});

</script>

<template>
  <div class="companies-query">
    <div v-if="loading.value">Loading companies...</div>
    <div v-if="errors.length" class="errors">
      <!-- Handle and display errors here -->
      <span v-for="(error, index) in errors" :key="index">{{ error.message }}</span>
    </div>
    <div v-if="companies">
      <div v-for="companyEdge in companies" :key="companyEdge.node.id">
        {{ companyEdge.node.name }}
      </div>
    </div>
  </div>
</template>
