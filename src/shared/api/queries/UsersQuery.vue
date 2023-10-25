<script setup lang="ts">
import { Ref, ref, watchEffect } from 'vue'
import { computed } from '@vue/reactivity'
import { useQuery } from 'vql'

import { useSafeRequest } from '../../modules/network'

const props = withDefaults(
  defineProps<{ staff?: boolean | null; manual?: boolean }>(),
  { staff: null, manual: false }
)

const users: Ref<any[]> = ref([])
const total = ref(0)
const errors: Ref<any[]> = ref([])

const safeRequest = useSafeRequest(errors)

const { data, executeQuery, fetching } = useQuery({
  variables: props,
  pause: computed(() => props.manual)
})

const run = () => safeRequest(async () => executeQuery())

watchEffect(() => {
  users.value = data.value?.users.results || []
  total.value = data.value?.users.totalCount || 0
})

defineExpose({
  run
})
</script>

<template>
  <div class="me-query">
    <slot
      :users="users"
      :total="total"
      :loading="fetching"
    />
  </div>
</template>

<gql>
query($staff: Boolean) {
  users(isStaff: $staff) {
    totalCount
    results {
      id
      email
      firstName
      lastName
      language
      isStaff
      isSuperuser
      showOnboarding
    }
  }
}
</gql>
