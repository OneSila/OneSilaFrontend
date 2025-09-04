<script lang="ts" setup>

import { Card } from '../../../../shared/components/atoms/card';
import { Link } from '../../../../shared/components/atoms/link';
import {useI18n} from "vue-i18n";
import { Url } from "../../../../shared/utils/constants";

const props = defineProps<{ label: string; cntQuery: any; url: Url;  refetchNeeded?: boolean  }>();
const emit = defineEmits(['refetched']);
const { t } = useI18n();

const refetchIfNecessary = (query, data) => {
  if (props.refetchNeeded) {
    query.refetch();
    emit('refetched');
  }
  return true;
}

</script>

<template>
  <Card class="card">
    <Link :path="url">
      <div class="p-5">
      <div class="space-y-4 text-gray-600 dark:text-gray-300">
        <div class="flex items-start relative gap-5">
          <div class="flex items-center gap-3">
            <div class="h-14 w-14">
              <span class="flex h-full w-full items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-folder h-full w-full fill-warning text-warning"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              </span>
            </div>
            <div class="space-y-1">
              <p class="font-semibold text-base">{{ label }}</p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="p-0.5 bg-gray-600 rounded-full"></span>
            <ApolloQuery :query="cntQuery" fetch-policy="cache-and-network">
              <template v-slot="{ result: { data }, query }">
                <p v-if="data && refetchIfNecessary(query, data)" class="text-sm">{{ data.medias.totalCount }} {{ t('media.media.labels.files') }}</p>
              </template>
            </ApolloQuery>
        </div>
      </div>
    </div>
    </Link>
  </Card>
</template>
