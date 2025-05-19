<template>
  <div class="table-container">
    <PanelDefault v-for="input in tableData" :key="input.key">
      <div class="secure__wrapper">
        <UiFormControl :label="input.key"></UiFormControl>
        <UiInput type="number" :value="input.value" />
      </div>
    </PanelDefault>
  </div>
</template>

<script setup>
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";

import { ref } from "vue";

const tableData = ref([
  { key: "Access Token", value: 900 },
  { key: "Refresh Token", value: 630000 },
]);
</script>

<style scoped lang="scss">
.table-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.secure__wrapper {
  padding: 20px;
  width: 100%;
}
</style>
