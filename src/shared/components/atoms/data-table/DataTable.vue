<script setup lang="ts">
withDefaults(
  defineProps<{ columns: string[]; rows: any[]; borderColor?: string }>(),
  { borderColor: 'gray-600' },
);

const generateKey = (rowIndex: number, column: any) => {
  return `row-${rowIndex + 1}-${column}-${Math.round(Math.random() * 9999)}`;
};
</script>

<template>
  <table class="table table-auto border-collapse border border-gray-800">
    <thead>
      <th
        v-for="(column, columnIndex) in columns"
        :key="column"
        class="text-left border p-1"
        :class="`border-${borderColor}`"
      >
        <slot
          name="column-header"
          :column="column"
          :column-index="columnIndex"
          >{{ column }}</slot
        >
      </th>
    </thead>

    <tbody>
      <tr v-for="(row, rowIndex) in rows" :key="`row-${rowIndex + 1}`">
        <td
          v-for="(column, columnIndex) in row"
          :key="generateKey(rowIndex, column)"
          class="border"
          :class="`border-${borderColor}`"
        >
          <slot
            name="column"
            :row="row"
            :row-index="rowIndex"
            :column="column"
            :column-index="columnIndex"
            >{{ column }}</slot
          >
        </td>
      </tr>
    </tbody>
  </table>
</template>
