<template>
  <div class="table-container">
    <table class="table">
      <thead>
        <tr>
          <th>Key</th>
          <th>Value (Seconds)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in tableData" :key="index">
          <td class="table__cell">{{ item.key }}</td>
          <td class="table__cell">
            <UiInput type="number" :value="item.value" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from "vue";
import UiInput from "~/components/ui/UiInput.vue";

const tableData = ref([
  { key: "Access Token", value: 900 },
  { key: "Refresh Token", value: 630000 },
]);
</script>

<style scoped lang="scss">
.table-container {
  width: 100%;
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
}

.table th,
.table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.table th {
  background-color: #c8c8c8;
  color: #3e3939;
  font-weight: 500;
}

.table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.table tr:hover {
  background-color: #f1f1f1;
}
</style>
