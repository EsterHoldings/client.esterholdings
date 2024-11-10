<template>
  <div class="buttons-group">
    <slot />
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.buttons-group button {
  border: none;
  background-color: orange !important;
}

.buttons-group {
  min-width: min-content;
  max-width: max-content;
  width: min-content;

  border: 1px solid rgb(82, 27, 37);
  padding: 5px;
  display: flex;

  border-radius: 10px;
  padding: 0;
  overflow: hidden;

  button {
    border: none !important;
    border-radius: 0;
  }

  .button {
    border: none !important;
    border-radius: 0;
  }

  &.btn {
    border: none !important;
    border-radius: 0;
  }

  & .btn {
    border: none !important;
    border-radius: 0;
  }

  & > * {
    border: none !important;
    border-radius: 0;
    background-color: orangered;
  }
}
</style>
