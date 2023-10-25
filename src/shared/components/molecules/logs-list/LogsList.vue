<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { DataTable } from '../../atoms/data-table';

import { Accordion } from '../../../../shared/components/atoms/accordion';
import { Label } from '../../../../shared/components/atoms/label';
import { Button } from '../../../../shared/components/atoms/button';
import { Card } from '../../atoms/card';

import { PaginatedCollection } from '../paginated-collection';

defineProps<{
  perPage?: number;
  total?: number;
  page?: number;
  logs: {
    actionTime: string;
    getActionName: string;
    getChangeMessage: string;
    objectId: string;
    fromValues: string;
    toValues: string;
    user: { id: string; email: string };
  }[];
}>();

defineEmits<{
  (e: 'update:page', page: number): void;
}>();

const { t } = useI18n();

const columns = ref([
  t('shared.labels.field'),
  t('shared.labels.old'),
  t('shared.labels.new'),
]);

const showLogs = ref(false);

const getLogChangesRows = (log: any) => {
  const rawRows: Record<string, any> = {};
  const arrayRows: Array<string[]> = [];

  for (const [key, value] of Object.entries(log.fromValues)) {
    rawRows[key] = [value];
  }

  for (const [key, value] of Object.entries(log.toValues)) {
    if (Array.isArray(rawRows[key])) {
      rawRows[key].push(value);
    } else {
      rawRows[key] = ['N/A', value || 'N/A'];
    }
  }

  for (const [key, value] of Object.entries(rawRows)) {
    arrayRows.push([key, ...value]);
  }

  return arrayRows;
};
</script>

<template>
  <Card class="logs-list space-y-4 mt-4">
    <PaginatedCollection
      :page="page"
      :per-page="perPage"
      :items-count="logs.length"
      :total="total"
      @update:page="(page) => $emit('update:page', page)"
    >
      <Label class="text-gray-800" size="xl">
        <Button @click="showLogs = !showLogs">Logs</Button>
      </Label>

      <Flex v-if="showLogs" gap="4" vertical>
        <FlexCell v-for="(log, index) in logs" :key="index">
          <Accordion>
            <template #panel>
              <Label class="text-gray-500" size="m">
                {{ log.user.email }} | {{ log.getActionName }} |
                {{ new Date(log.actionTime).toLocaleDateString() }} -
                {{ new Date(log.actionTime).toLocaleTimeString() }}
              </Label>
            </template>

            <template #content>
              <Flex vertical>
                <FlexCell>
                  <Label class="text-gray-500" size="m" bold> Message: </Label>

                  <Label class="text-gray-500" size="m">
                    {{ log.getChangeMessage }}
                  </Label>
                </FlexCell>

                <FlexCell>
                  <Label class="text-gray-500" size="m" bold>
                    Object Id:
                  </Label>

                  <Label class="text-gray-500" size="m">
                    {{ log.objectId }}
                  </Label>
                </FlexCell>

                <FlexCell>
                  <Label class="text-gray-500" size="m" bold>
                    User Email:
                  </Label>

                  <Label class="text-gray-500" size="m">
                    {{ log.user.email }}
                  </Label>
                </FlexCell>

                <FlexCell class="pt-2">
                  <DataTable
                    v-if="getLogChangesRows(log).length"
                    border-color="gray-300"
                    :columns="columns"
                    :rows="getLogChangesRows(log)"
                  >
                    <template #column-header="{ column }">
                      <Label class="px-1 text-gray-500">{{ column }}</Label>
                    </template>

                    <template #column="{ column }">
                      <Label class="px-2 text-gray-500 break-all">{{
                        column
                      }}</Label>
                    </template>
                  </DataTable>
                </FlexCell>
              </Flex>
            </template>
          </Accordion>
        </FlexCell>
      </Flex>
    </PaginatedCollection>
  </Card>
</template>
