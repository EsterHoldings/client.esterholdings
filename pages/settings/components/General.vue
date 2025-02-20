<template>
  <div class="table-container">
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Logo</th>
          <th>Upload</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in tableData" :key="index">
          <td>{{ row.id }}</td>

          <td class="table__cell">
            <div class="logo-container">
              <img
                v-if="row.previewUrl"
                :src="row.previewUrl"
                alt="Logo"
                class="preview-image"
              />

              <UiIconLogo v-else class="logo-placeholder" />
            </div>
          </td>

          <td class="table__cell">
            <label class="input">
              <UiIconLoad />
              <UiTextH4> Upload </UiTextH4>
              <input
                type="file"
                accept="image/*"
                @change="handleFileChange($event, index)"
              />
            </label>
          </td>

          <td class="table__cell">
            <UiIconTrash @click="removeFile(index)" class="delete-icon" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from "vue";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import UiIconLoad from "~/components/ui/UiIconLoad.vue";
import UiIconTrash from "~/components/ui/UiIconTrash.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";

const tableData = ref([{ id: 1, previewUrl: null, file: null }]);

const handleFileChange = (event, index) => {
  const selectedFile = event.target.files[0];

  if (selectedFile) {
    const url = URL.createObjectURL(selectedFile);
    tableData.value[index].file = selectedFile;
    tableData.value[index].previewUrl = url;
  }
};

const removeFile = (index) => {
  tableData.value[index].file = null;
  tableData.value[index].previewUrl = null;
};
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
  font-family: Montserrat, sans-serif;
}

.table th,
.table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
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

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 200px;
    height: auto;
  }
}

.preview-image {
  width: 200px;
  object-fit: contain;
  border-radius: 8px;
}

.logo-placeholder {
  width: 60px;
  height: 60px;
  background: #000;
  border-radius: 10px;
}

.delete-icon {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.delete-icon:hover {
  transform: scale(1.1);
}

.input {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    svg {
      transform: scale(1.1);
      transition: transform 0.3s ease-in-out;
    }
  }

  input {
    display: none;
  }
}
</style>
