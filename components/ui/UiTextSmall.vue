<template>
  <textarea
    :value="value"
    :ref="resizeTextarea"
    @focus="handleFocus"
    @input="handleInput"
    @blur="handleBlur"
  ></textarea>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";

const props = defineProps({
  value: {
    type: String,
    default: "",
  },
});

const refTextarea = null;

const handleFocus = () => {
  console.log("HANDLE FOCUS");
};
const handleInput = () => {
  console.log("HANDLE INPUT");
};
const handleBlur = () => {
  console.log("HANDLE BLUR");
};

const resizeTextarea = () => {
  console.log("resizeTextarea");
  // this.$refs.textarea.style.height = "auto";
  // this.$refs.textarea.style.height = `${this.$refs.textarea.scrollHeight}px`;
};

onMounted(() => {
  console.log("-=-=-=-=-=-=-");
  console.log(resizeTextarea());
  console.log("-=-=-=-=-=-=-");
});
</script>

<style lang="scss" scoped>
textarea {
  width: 100%;
  min-height: 150px;
  resize: vertical;
}
</style>
