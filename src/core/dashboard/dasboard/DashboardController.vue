<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuery } from 'vql';
import { useSafeRequest } from '../../../shared/modules/network'; // Adjust the path to your actual useSafeRequest location

// Define a reactive reference for errors
const errors = ref([]);

// Use the useSafeRequest composition function
const safeRequest = useSafeRequest(errors);

// Define the reactive data properties for the query
const { data, executeQuery, fetching } = useQuery({
  // If you want to manually trigger the query, you can use a computed prop based on some other reactive property
  pause: computed(() => false),
});

// Function to run the query
const runQuery = async () => {
  // Use safeRequest to handle the network request with error management
  await safeRequest(() => executeQuery());
};

// A watch to log the result once it's available
watch(data, (newData) => {
  if (newData && newData.companies) {
    console.log('Companies:', newData.companies.edges);
  }
}, {
  immediate: true,
});

// Execute the query on component mount
runQuery();
</script>

<template>
  <div class="companies-query">
    <!-- You can use slots or template logic to display data here -->
    <div v-if="fetching">Loading companies...</div>
    <div v-if="errors.length" class="errors">
      <!-- Handle and display errors here -->
    </div>
    <div v-if="data && data.companies">
      <!-- Loop through and display companies here -->
    </div>
  </div>
</template>

<gql>
query Companies {
  companies {
    edges {
      node {
        id
      }
    }
  }
}
</gql>
