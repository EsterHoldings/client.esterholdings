<template>
  <div class="table-container">
    <table class="table">
      <thead>
        <tr>
          <th>
            {{ t("admin.settings.tables.appearance.variable") }}
          </th>
          <th>
            {{ t("admin.settings.tables.appearance.preview") }}
          </th>
          <th>
            {{ t("admin.settings.tables.appearance.picker") }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(color, key) in colors" :key="key">
          <td class="table__cell">{{ key }}</td>

          <td class="table__cell preview">
            <div
              v-if="key.includes('background')"
              class="preview-box"
              :style="{ backgroundColor: color }"
            >
              {{ t("admin.settings.tables.appearance.background") }}
            </div>
            <div
              v-else-if="key.includes('text')"
              class="preview-text"
              :style="{ color: color }"
            >
              {{ t("admin.settings.tables.appearance.text") }}
            </div>
            <button
              v-else
              class="preview-button"
              :style="{
                backgroundColor: color,
                color: getContrastColor(color),
              }"
            >
              {{ t("admin.settings.tables.appearance.button") }}
            </button>
          </td>

          <td class="table__cell">
            <input
              type="color"
              :value="color"
              @input="updateColor(key, $event.target.value)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { ref, watch } from "vue";

const { t } = useI18n();
const colors = ref({
  "--color-background": "#ffffff",
  "--color-text": "#000000",
  "--color-text-muted": "#666666",
  "--color-secondary": "#e0e0e0",
  "--color-contrast": "#ff5733",
  "--color-default": "#cccccc",
  "--color-primary": "#007bff",
  "--color-info": "#17a2b8",
  "--color-success": "#28a745",
  "--color-warning": "#ffc107",
  "--color-danger": "#dc3545",
  "--color-dark": "#343a40",
  "--color-light": "#f8f9fa",
});

const updateColor = (key, value) => {
  colors.value[key] = value;
  document.documentElement.style.setProperty(key, value);
};

watch(
  colors,
  (newColors) => {
    Object.entries(newColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  },
  { deep: true }
);

const getContrastColor = (bgColor) => {
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 125 ? "#000000" : "#ffffff";
};
</script>

<style scoped>
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

.preview {
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-box {
  width: 80px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  font-size: 12px;
  font-weight: bold;
  color: #000;
  border: 1px solid #ddd;
}

.preview-text {
  font-size: 14px;
  font-weight: bold;
}

.preview-button {
  padding: 5px 10px;
  border-radius: 5px;
  border: none;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.preview-button:hover {
  opacity: 0.8;
}

input[type="color"] {
  border: none;
  width: 40px;
  height: 40px;
  padding: 0;
  cursor: pointer;
}
</style>
